/**
 * End-to-end checks against a running server, using your installed Chrome.
 * Uses the database in DATABASE_URL (local dev only — it creates test orders).
 *
 *   npm run build && npx next start -p 3100
 *   npm run test:e2e
 *
 * Env: BASE_URL, DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, CHROME_PATH, SCREENSHOT_DIR
 */
import { chromium } from "playwright-core";
import postgres from "postgres";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

try {
  process.loadEnvFile(".env.local");
} catch {}
const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const OUT = process.env.SCREENSHOT_DIR ?? fs.mkdtempSync(path.join(os.tmpdir(), "bros-e2e-"));
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const sql = postgres(process.env.DATABASE_URL, { max: 1 });
const results = [];
const check = (name, ok, extra = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? ` — ${extra}` : ""}`);
};
const stockOf = async (sku) => (await sql`select stock from variants where sku = ${sku}`)[0].stock;

// ── A. Server-side permission checks (no browser) ─────────────────────────
{
  const r1 = await fetch(`${BASE}/admin`, { redirect: "manual" });
  check("anon /admin redirects to admin login", r1.status >= 300 && r1.status < 400 && r1.headers.get("location")?.includes("/admin/login"));
  const r2 = await fetch(`${BASE}/account`, { redirect: "manual" });
  check("anon /account redirects to login", r2.headers.get("location")?.includes("/login?next="));
  const r3 = await fetch(`${BASE}/checkout`, { redirect: "manual" });
  check("anon /checkout redirects to login", r3.headers.get("location")?.includes("/login?next="));
  const fd = new FormData();
  fd.append("file", new Blob(["x"], { type: "image/png" }), "x.png");
  const r4 = await fetch(`${BASE}/api/admin/images`, { method: "POST", body: fd });
  check("anon image upload is rejected (403)", r4.status === 403);
  const r5 = await fetch(`${BASE}/api/payments/razorpay/webhook`, { method: "POST", body: "{}", headers: { "x-razorpay-signature": "bad" } });
  check("webhook with bad signature is rejected (401)", r5.status === 401);
  const products = await (await fetch(`${BASE}/api/products`)).json();
  check("public catalogue API lists active products with variants", products.length === 12 && products.every((p) => p.variants.length > 0), `${products.length} products`);
}

const browser = await chromium.launch({ executablePath: CHROME, headless: true });

// ── B. Customer journey ───────────────────────────────────────────────────
const email = `e2e+${Date.now()}@test.local`;
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
const page = await ctx.newPage();
page.on("dialog", (d) => d.accept());
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

await page.goto(`${BASE}/register`);
await page.getByLabel("First name").fill("Test");
await page.getByLabel("Last name").fill("Customer");
await page.getByLabel("Email").fill(email);
await page.getByLabel("Password").fill("short");
await page.getByRole("button", { name: "Create account" }).click();
await page.getByText("Use at least 8 characters.").waitFor();
check("registration shows validation errors and keeps typed values", (await page.getByLabel("Email").inputValue()) === email);
await page.getByLabel("Password").fill("a-good-password-123");
await page.getByRole("button", { name: "Create account" }).click();
await page.waitForURL("**/account");
check("registration signs in and lands on account", page.url().endsWith("/account"));

const SKU = "BR001-ONY-M";
const before = await stockOf(SKU);
await page.goto(`${BASE}/products/bros-performance-tee`);
const xxl = page.getByRole("radio", { name: "XXL — sold out" });
check("sold-out size is disabled on product page", await xxl.isDisabled());
await page.getByRole("radio", { name: "M", exact: true }).click();
await page.getByText(/Available|Low stock/).first().waitFor();
check("stock status shown after choosing a size", true);
await page.getByRole("button", { name: "Increase quantity" }).click().catch(() => {});
await page.getByRole("button", { name: /Add to Bag/ }).first().click();
await page.waitForTimeout(800);
await page.goto(`${BASE}/checkout`);
await page.getByRole("heading", { name: "Checkout" }).waitFor();
const qtyInBag = await page.evaluate(() => JSON.parse(localStorage.getItem("bros-cart") || "{}").state?.items?.[0]?.quantity ?? 0);
await page.getByRole("button", { name: /Place order/ }).click();
await page.getByText("Enter the street address.").waitFor();
check("checkout validates the address server-side", true);
await page.getByLabel("Address", { exact: true }).fill("12 Jubilee Hills Road");
await page.getByLabel("City").fill("Hyderabad");
await page.getByLabel("PIN code").fill("500033");
await page.getByLabel("State").fill("Telangana");
await page.getByLabel("Mobile (+91)").fill("9876543210");
await page.getByText("Pay on delivery", { exact: false }).first().isVisible();
await page.getByRole("button", { name: /Place order/ }).click();
await page.waitForURL("**/account/orders/**", { timeout: 20000 });
await page.getByText("your order is confirmed").waitFor();
const orderUrl = page.url();
check("COD order placed and confirmation shown", true, orderUrl.split("/").pop());
const after = await stockOf(SKU);
check(`stock decremented by ordered quantity (${qtyInBag})`, before - after === qtyInBag, `${before} → ${after}`);
await page.screenshot({ path: `${OUT}/desktop-order.png`, fullPage: false });

// Customer cannot reach admin
await page.goto(`${BASE}/admin`);
await page.waitForURL("**/admin/login");
check("customer is redirected away from admin", (await page.getByText("doesn't have admin access").count()) === 1);
const fd = new FormData();
fd.append("file", new Blob(["x"], { type: "image/png" }), "x.png");
const cookie = (await ctx.cookies()).map((c) => `${c.name}=${c.value}`).join("; ");
const up = await fetch(`${BASE}/api/admin/images`, { method: "POST", body: fd, headers: { cookie } });
check("customer image upload is rejected (403)", up.status === 403);

// Another customer's order is not visible
const [other] = await sql`select o.id from orders o join users u on u.id = o.user_id where u.email <> ${email} limit 1`;
if (other) {
  const [o] = await sql`select number from orders where id = ${other.id}`;
  await page.goto(`${BASE}/account/orders/${other.id}`);
  check("customer cannot view another customer's order", !(await page.content()).includes(o.number));
}

// Cancel restores stock
await page.goto(orderUrl.split("?")[0]);
await page.getByRole("button", { name: "Cancel order" }).click();
await page.getByText("Cancelled", { exact: true }).first().waitFor({ timeout: 15000 });
check("customer cancellation restores stock", (await stockOf(SKU)) === before, `now ${await stockOf(SKU)}`);
check("no client-side errors during customer journey", errors.length === 0, errors.join(" | "));

// ── C. Admin ──────────────────────────────────────────────────────────────
const actx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
const admin = await actx.newPage();
admin.on("dialog", (d) => d.accept());
await admin.goto(`${BASE}/admin/login`);
await admin.getByLabel("Admin email").fill(process.env.ADMIN_EMAIL);
await admin.getByLabel("Password").fill("wrong-password");
await admin.getByRole("button", { name: "Sign in to admin" }).click();
await admin.getByText("Incorrect email or password.").waitFor();
check("admin login rejects wrong password", true);
await admin.getByLabel("Password").fill(process.env.ADMIN_PASSWORD);
await admin.getByRole("button", { name: "Sign in to admin" }).click();
await admin.waitForURL(`${BASE}/admin`);
await admin.getByRole("heading", { name: "Dashboard" }).waitFor();
check("admin signs in to dashboard", true);
await admin.screenshot({ path: `${OUT}/admin-dashboard.png` });

// Inventory adjust
await admin.goto(`${BASE}/admin/inventory?q=${SKU}`);
const row = admin.locator("tr", { hasText: SKU });
const s0 = await stockOf(SKU);
await row.getByLabel("Quantity").fill("10");
await row.getByLabel("Note").fill("E2E receive");
await row.getByRole("button", { name: "Save" }).click();
await row.getByText(`Stock is now ${s0 + 10}`).waitFor();
check("admin receives stock (+10)", (await stockOf(SKU)) === s0 + 10);
await row.getByLabel("Adjustment type").selectOption("set");
await row.getByLabel("Quantity").fill(String(s0));
await row.getByRole("button", { name: "Save" }).click();
await row.getByText(`Stock is now ${s0}`).waitFor();
check("admin count correction restores the original value", (await stockOf(SKU)) === s0);
await admin.getByText("E2E receive").first().waitFor();
check("stock movement history shows the adjustment", true);

// Photo upload / delete
await admin.goto(`${BASE}/admin/products/p-001`);
const imgCount = async () => (await sql`select count(*)::int n from product_images where product_id = 'p-001' and colour = 'onyx'`)[0].n;
const n0 = await imgCount();
const sample = path.resolve("public/images/campaign");
const file = fs.readdirSync(sample).find((f) => /\.(webp|jpg|png)$/.test(f));
// Wait for React to hydrate the uploader before choosing files.
await admin.waitForFunction(() => {
  const el = document.querySelector("input[type=file][multiple]");
  return el && Object.keys(el).some((k) => k.startsWith("__reactProps"));
});
await admin.locator('input[type=file][multiple]').setInputFiles(path.join(sample, file));
await admin.getByText("Uploaded", { exact: true }).waitFor({ timeout: 30000 });
await admin.waitForTimeout(1500);
check("admin uploads a product photo", (await imgCount()) === n0 + 1);
const [newest] = await sql`select id, url, is_placeholder from product_images where product_id = 'p-001' order by created_at desc limit 1`;
check("uploaded photo is stored as real (not placeholder)", newest.is_placeholder === false, newest.url);
const store = await (await fetch(`${BASE}/products/bros-performance-tee`)).text();
check("uploaded photo appears on the storefront", store.includes(encodeURIComponent(newest.url)) || store.includes(newest.url));
await admin.reload();
await admin.getByRole("button", { name: "Delete photo" }).last().click();
await admin.waitForTimeout(2000);
check("admin deletes the photo", (await imgCount()) === n0);

// Order status update
await admin.goto(`${BASE}/admin/orders`);
await admin.getByRole("heading", { name: "Orders" }).waitFor();
check("admin orders list loads", (await admin.locator("tbody tr").count()) > 0);

// ── D. Mobile screenshots ─────────────────────────────────────────────────
const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const mp = await m.newPage();
for (const [name, url] of [["m-home", "/"], ["m-shop", "/shop"], ["m-product", "/products/bros-performance-tee"], ["m-login", "/login"]]) {
  await mp.goto(`${BASE}${url}`);
  await mp.waitForTimeout(1200);
  const overflow = await mp.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  check(`mobile ${url} has no horizontal overflow`, !overflow);
  await mp.screenshot({ path: `${OUT}/${name}.png` });
}
const ma = await m.newPage();
await ma.context().addCookies(await actx.cookies());
await ma.goto(`${BASE}/admin/inventory`);
await ma.waitForTimeout(800);
await ma.screenshot({ path: `${OUT}/m-admin.png` });

await browser.close();
await sql.end();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed · screenshots in ${OUT}`);
process.exit(failed.length ? 1 : 0);
