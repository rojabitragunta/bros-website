/**
 * Integration tests for inventory, orders and payments against a real
 * PostgreSQL database (never the production one).
 *
 *   TEST_DATABASE_URL=postgres://... npm run test:integration
 */
import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import { after, before, beforeEach, describe, test } from "node:test";

const url = process.env.TEST_DATABASE_URL;
if (!url) throw new Error("Set TEST_DATABASE_URL to a disposable test database.");
process.env.DATABASE_URL = url;
process.env.RAZORPAY_KEY_ID = "rzp_test_key";
process.env.RAZORPAY_KEY_SECRET = "rzp_test_secret";
process.env.RAZORPAY_WEBHOOK_SECRET = "whsec_test";

const { db, schema, closeDb } = await import("../src/lib/db");
const { eq, sql } = await import("drizzle-orm");
const { adjustStock, StockError } = await import("../src/lib/services/inventory");
const orders = await import("../src/lib/services/orders");
const { verifyPaymentSignature, verifyWebhookSignature } = await import("../src/lib/payments/razorpay");
const { hashPassword, verifyPassword } = await import("../src/lib/auth/password");
const { computeTotals } = await import("../src/lib/pricing");

const PRODUCT = "p-test";
const ADDRESS = { name: "Test Buyer", line1: "1 Test Road", line2: "", city: "Hyderabad", state: "Telangana", pincode: "500001", phone: "9876543210" };
let variantM: string;
let userA: { id: string; email: string };
let userB: { id: string; email: string };
let admin: string;

// Fake Razorpay API: orders are created; payments are looked up from this map.
const rpPayments = new Map<string, { id: string; order_id: string; amount: number; currency: string; status: string }>();
const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const u = String(input);
  if (u.endsWith("/v1/orders")) {
    const body = JSON.parse(String(init?.body));
    return Response.json({ id: `order_${randomUUID().slice(0, 12)}`, amount: body.amount, currency: "INR", status: "created" });
  }
  const m = u.match(/\/v1\/payments\/(.+)$/);
  if (m) {
    const p = rpPayments.get(decodeURIComponent(m[1]));
    return p ? Response.json(p) : new Response("not found", { status: 404 });
  }
  return realFetch(input, init);
}) as typeof fetch;

async function stock(id = variantM) {
  const [v] = await db.select({ stock: schema.variants.stock }).from(schema.variants).where(eq(schema.variants.id, id));
  return v.stock;
}
async function setStock(n: number, id = variantM) {
  await db.update(schema.variants).set({ stock: n }).where(eq(schema.variants.id, id));
}
const line = (quantity = 1) => ({ productId: PRODUCT, colour: "onyx", size: "M", quantity });
const total = (qty: number) => computeTotals([{ price: 1000, quantity: qty }]).total;
const place = (user: { id: string; email: string }, qty = 1, extra: Partial<Parameters<typeof orders.placeOrder>[1]> = {}) =>
  orders.placeOrder(user, { idempotencyKey: randomUUID(), items: [line(qty)], address: ADDRESS, paymentMethod: "cod", expectedTotal: total(qty), ...extra });

before(async () => {
  await db.execute(sql`truncate users, products, orders, inventory_movements, payments cascade`);
  const pw = await hashPassword("irrelevant-password");
  [userA, userB] = await db
    .insert(schema.users)
    .values([
      { email: "a@test.local", passwordHash: pw, firstName: "A" },
      { email: "b@test.local", passwordHash: pw, firstName: "B" },
    ])
    .returning({ id: schema.users.id, email: schema.users.email });
  [{ id: admin }] = await db.insert(schema.users).values({ email: "admin@test.local", passwordHash: pw, firstName: "Admin", role: "admin" }).returning({ id: schema.users.id });
  await db.insert(schema.products).values({ id: PRODUCT, slug: "test-tee", name: "Test Tee", price: 1000, category: "tees", colourIds: ["onyx"], sizes: ["M", "L"], status: "active" });
  const vs = await db
    .insert(schema.variants)
    .values([
      { productId: PRODUCT, colour: "onyx", size: "M", sku: "T-ONY-M", stock: 20 },
      { productId: PRODUCT, colour: "onyx", size: "L", sku: "T-ONY-L", stock: 0 },
    ])
    .returning();
  variantM = vs.find((v) => v.size === "M")!.id;
});

beforeEach(async () => {
  await db.update(schema.products).set({ status: "active", price: 1000 }).where(eq(schema.products.id, PRODUCT));
});

after(async () => {
  globalThis.fetch = realFetch;
  await closeDb();
});

describe("inventory", () => {
  test("add received stock, then a sale (the brief's example: 20 → 30 → 28)", async () => {
    await setStock(20);
    assert.equal(await adjustStock({ variantId: variantM, mode: "add", quantity: 10, note: "PO 1" }, admin), 30);
    await place(userA, 2);
    assert.equal(await stock(), 28);
    const moves = await db.select().from(schema.inventoryMovements).where(eq(schema.inventoryMovements.variantId, variantM));
    assert.ok(moves.some((m) => m.reason === "received" && m.delta === 10 && m.stockAfter === 30));
    assert.ok(moves.some((m) => m.reason === "sale" && m.delta === -2 && m.stockAfter === 28));
  });

  test("removing more than available fails and leaves stock unchanged", async () => {
    await setStock(3);
    await assert.rejects(adjustStock({ variantId: variantM, mode: "remove", quantity: 5, note: "" }, admin), StockError);
    assert.equal(await stock(), 3);
  });

  test("count correction sets an exact value and journals the difference", async () => {
    await setStock(7);
    assert.equal(await adjustStock({ variantId: variantM, mode: "set", quantity: 12, note: "stock take" }, admin), 12);
    const [last] = await db.select().from(schema.inventoryMovements).where(eq(schema.inventoryMovements.variantId, variantM)).orderBy(sql`id desc`).limit(1);
    assert.equal(last.reason, "correction");
    assert.equal(last.delta, 5);
  });

  test("database rejects negative stock even if written directly", async () => {
    await assert.rejects(setStock(-1));
  });
});

describe("orders", () => {
  test("out-of-stock variant cannot be ordered", async () => {
    await assert.rejects(
      orders.placeOrder(userA, { idempotencyKey: randomUUID(), items: [{ ...line(1), size: "L" }], address: ADDRESS, paymentMethod: "cod", expectedTotal: total(1) }),
      (e: Error & { code?: string }) => e.message.includes("sold out") && e.code === "insufficient",
    );
  });

  test("quantity above availability is rejected without partial changes", async () => {
    await setStock(2);
    await assert.rejects(place(userA, 3), /only 2 left/);
    assert.equal(await stock(), 2);
  });

  test("duplicate submits with the same idempotency key create one order", async () => {
    await setStock(10);
    const key = randomUUID();
    const input = { idempotencyKey: key, items: [line(1)], address: ADDRESS, paymentMethod: "cod" as const, expectedTotal: total(1) };
    const results = await Promise.all([orders.placeOrder(userA, input), orders.placeOrder(userA, input), orders.placeOrder(userA, input)]);
    assert.equal(new Set(results.map((r) => r.id)).size, 1);
    assert.equal(await stock(), 9);
  });

  test("an idempotency key cannot be reused by another customer", async () => {
    await setStock(5);
    const key = randomUUID();
    await orders.placeOrder(userA, { idempotencyKey: key, items: [line(1)], address: ADDRESS, paymentMethod: "cod", expectedTotal: total(1) });
    await assert.rejects(orders.placeOrder(userB, { idempotencyKey: key, items: [line(1)], address: ADDRESS, paymentMethod: "cod", expectedTotal: total(1) }));
  });

  test("simultaneous orders never oversell (20 buyers, 5 in stock)", async () => {
    await setStock(5);
    const results = await Promise.allSettled(Array.from({ length: 20 }, (_, i) => place(i % 2 ? userA : userB, 1)));
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 5);
    assert.equal(await stock(), 0);
  });

  test("simultaneous multi-unit orders: only one of two 3-unit orders fits in 5", async () => {
    await setStock(5);
    const results = await Promise.allSettled([place(userA, 3), place(userB, 3)]);
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
    assert.equal(await stock(), 2);
  });

  test("server re-prices: a stale client total is rejected", async () => {
    await setStock(5);
    await db.update(schema.products).set({ price: 1200 }).where(eq(schema.products.id, PRODUCT));
    await assert.rejects(place(userA, 1), (e: Error & { code?: string }) => e.code === "price_changed");
    assert.equal(await stock(), 5);
  });

  test("archived products cannot be ordered", async () => {
    await setStock(5);
    await db.update(schema.products).set({ status: "archived" }).where(eq(schema.products.id, PRODUCT));
    await assert.rejects(place(userA, 1), (e: Error & { code?: string }) => e.code === "unavailable");
  });

  test("cancellation restores stock exactly once", async () => {
    await setStock(5);
    const o = await place(userA, 2);
    assert.equal(await stock(), 3);
    await orders.cancelOrder(o.id, { actorId: userA.id, ownerId: userA.id });
    await orders.cancelOrder(o.id, { actorId: userA.id, ownerId: userA.id });
    assert.equal(await stock(), 5);
  });

  test("customers cannot cancel another customer's order", async () => {
    await setStock(5);
    const o = await place(userA, 1);
    await assert.rejects(orders.cancelOrder(o.id, { actorId: userB.id, ownerId: userB.id }), /not found/i);
  });

  test("status flow is enforced; shipped orders can't be cancelled by customers", async () => {
    await setStock(5);
    const o = await place(userA, 1);
    await assert.rejects(orders.updateOrderStatus(o.id, { status: "delivered" }, admin), /Can't move/);
    await orders.updateOrderStatus(o.id, { status: "packed" }, admin);
    await orders.updateOrderStatus(o.id, { status: "shipped", courier: "Delhivery", trackingNumber: "DL123" }, admin);
    await assert.rejects(orders.cancelOrder(o.id, { actorId: userA.id, ownerId: userA.id }), /no longer be cancelled/);
    const done = await orders.updateOrderStatus(o.id, { status: "delivered" }, admin);
    assert.equal(done.paymentStatus, "paid", "COD becomes paid on delivery");
  });

  test("returns only restock when requested", async () => {
    await setStock(5);
    const o = await place(userA, 2);
    for (const s of ["packed", "shipped", "delivered"] as const) await orders.updateOrderStatus(o.id, { status: s }, admin);
    assert.equal(await stock(), 3);
    await orders.updateOrderStatus(o.id, { status: "returned", restock: true }, admin);
    assert.equal(await stock(), 5);
  });
});

describe("online payments", () => {
  const payFor = async (rpOrderId: string, amount: number, status = "captured") => {
    const id = `pay_${randomUUID().slice(0, 10)}`;
    rpPayments.set(id, { id, order_id: rpOrderId, amount: amount * 100, currency: "INR", status });
    return id;
  };

  test("stock is reserved while awaiting payment and confirmed once paid (idempotent)", async () => {
    await setStock(5);
    const o = await place(userA, 2, { paymentMethod: "razorpay" });
    assert.ok(o.razorpayOrderId);
    assert.equal(await stock(), 3);
    const [pending] = await db.select().from(schema.orders).where(eq(schema.orders.id, o.id));
    assert.equal(pending.status, "pending_payment");
    const pid = await payFor(o.razorpayOrderId!, o.total);
    assert.equal((await orders.confirmRazorpayPayment(o.razorpayOrderId!, pid)).paid, true);
    assert.equal((await orders.confirmRazorpayPayment(o.razorpayOrderId!, pid)).paid, true);
    const [paid] = await db.select().from(schema.orders).where(eq(schema.orders.id, o.id));
    assert.equal(paid.status, "placed");
    assert.equal(paid.paymentStatus, "paid");
    assert.equal(await stock(), 3);
  });

  test("a payment with the wrong amount is not accepted", async () => {
    await setStock(5);
    const o = await place(userA, 1, { paymentMethod: "razorpay" });
    const pid = await payFor(o.razorpayOrderId!, o.total - 1);
    await assert.rejects(orders.confirmRazorpayPayment(o.razorpayOrderId!, pid), /did not match/);
  });

  test("authorised-but-uncaptured payments are not marked paid", async () => {
    await setStock(5);
    const o = await place(userA, 1, { paymentMethod: "razorpay" });
    const pid = await payFor(o.razorpayOrderId!, o.total, "authorized");
    assert.equal((await orders.confirmRazorpayPayment(o.razorpayOrderId!, pid)).paid, false);
  });

  test("abandoned payments release stock after the reservation expires; a late payment re-reserves it", async () => {
    await setStock(5);
    const o = await place(userA, 2, { paymentMethod: "razorpay" });
    assert.equal(await stock(), 3);
    await db.update(schema.orders).set({ reservationExpiresAt: new Date(Date.now() - 1000) }).where(eq(schema.orders.id, o.id));
    assert.ok((await orders.releaseExpiredReservations()) >= 1);
    assert.equal(await stock(), 5);
    const pid = await payFor(o.razorpayOrderId!, o.total);
    assert.equal((await orders.confirmRazorpayPayment(o.razorpayOrderId!, pid)).paid, true);
    assert.equal(await stock(), 3);
  });

  test("late payment when stock is gone is flagged for refund", async () => {
    await setStock(2);
    const o = await place(userA, 2, { paymentMethod: "razorpay" });
    await db.update(schema.orders).set({ reservationExpiresAt: new Date(Date.now() - 1000) }).where(eq(schema.orders.id, o.id));
    await orders.releaseExpiredReservations();
    await place(userB, 2); // someone else buys the released stock
    const pid = await payFor(o.razorpayOrderId!, o.total);
    const r = await orders.confirmRazorpayPayment(o.razorpayOrderId!, pid);
    assert.equal(r.paid, false);
    const [row] = await db.select().from(schema.orders).where(eq(schema.orders.id, o.id));
    assert.equal(row.paymentStatus, "refund_pending");
    assert.equal(await stock(), 0);
  });

  test("signatures are verified with HMAC-SHA256", () => {
    const sig = createHmac("sha256", "rzp_test_secret").update("order_1|pay_1").digest("hex");
    assert.equal(verifyPaymentSignature("order_1", "pay_1", sig), true);
    assert.equal(verifyPaymentSignature("order_1", "pay_2", sig), false);
    const body = '{"event":"payment.captured"}';
    assert.equal(verifyWebhookSignature(body, createHmac("sha256", "whsec_test").update(body).digest("hex")), true);
    assert.equal(verifyWebhookSignature(body, "bad"), false);
  });
});

describe("auth", () => {
  test("passwords are salted scrypt hashes", async () => {
    const h1 = await hashPassword("correct horse battery");
    const h2 = await hashPassword("correct horse battery");
    assert.notEqual(h1, h2);
    assert.equal(await verifyPassword("correct horse battery", h1), true);
    assert.equal(await verifyPassword("wrong", h1), false);
  });
});
