"use server";

/**
 * Admin Server Actions. Every action begins with assertAdmin(): permissions are
 * enforced here on the server, never only by hiding UI.
 */
import { randomBytes } from "node:crypto";
import { and, asc, eq, ne } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { colours } from "@/data/colours";
import { db, schema } from "@/lib/db";
import { AuthError, assertAdmin } from "@/lib/auth/session";
import { CATALOG_TAG } from "@/lib/services/catalog";
import { StockError, adjustStock } from "@/lib/services/inventory";
import { OrderError, cancelOrder, updateOrderStatus, updateTracking } from "@/lib/services/orders";
import { deleteStoredImage } from "@/lib/storage";
import { fieldErrors } from "@/lib/validation";
import type { FormState } from "@/app/actions/auth";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const CATEGORIES = ["tees", "tanks", "long-sleeves", "shorts", "joggers", "leggings", "bras"] as const;
const COLOUR_IDS = colours.map((c) => c.id) as [string, ...string[]];

const lines = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

const productSchema = z.object({
  name: z.string().trim().min(2, "Enter a product name.").max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens.")
    .max(100),
  tagline: z.string().trim().max(160),
  description: z.string().trim().max(4000),
  price: z.coerce.number().int("Whole rupees only.").min(1, "Enter a price.").max(1_000_000),
  compareAtPrice: z.union([z.literal("").transform(() => null), z.coerce.number().int().min(1).max(1_000_000)]),
  category: z.enum(CATEGORIES, "Choose a category."),
  gender: z.array(z.enum(["men", "women"])).min(1, "Choose at least one."),
  collections: z.array(z.enum(["drop-001", "essentials"])),
  colourIds: z.array(z.enum(COLOUR_IDS)).min(1, "Choose at least one colour."),
  sizes: z.array(z.enum(SIZES)).min(1, "Choose at least one size."),
  fabric: z.string().trim().max(120),
  gsm: z.coerce.number().int().min(0).max(1000),
  composition: z.array(z.object({ material: z.string().min(1), percent: z.number().min(1).max(100) })),
  fit: z.string().trim().max(300),
  stretch: z.enum(["2-way", "4-way", "minimal"]),
  features: z.array(z.string().max(160)).max(20),
  care: z.array(z.string().max(160)).max(20),
  badges: z.array(z.enum(["new", "bestseller", "limited"])),
  featuredRank: z.coerce.number().int().min(0).max(10000),
  lowStockThreshold: z.coerce.number().int().min(0).max(1000),
  status: z.enum(["draft", "active", "archived"]),
});

function parseComposition(text: string) {
  // "Polyester 88, Elastane 12"  or one per line
  return text
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const m = s.match(/^(.*?)[\s:]+(\d{1,3})\s*%?$/);
      return m ? { material: m[1].trim(), percent: Number(m[2]) } : { material: s, percent: 0 };
    });
}

function fail(e: unknown): FormState {
  if (e instanceof AuthError) return { error: e.message };
  if (e instanceof OrderError) return { error: e.message };
  if (e instanceof StockError) return { error: `Not enough stock: only ${e.available} available.` };
  console.error("[admin]", e);
  return { error: "Something went wrong. Please try again." };
}

function refreshCatalog(productId?: string) {
  updateTag(CATALOG_TAG);
  revalidatePath("/admin", "layout");
  if (productId) revalidatePath(`/admin/products/${productId}`);
}

/* ── Products ─────────────────────────────────────────────────────────────── */

export async function saveProduct(_: FormState, fd: FormData): Promise<FormState> {
  let createdId: string | null = null;
  try {
    await assertAdmin();
    const id = String(fd.get("id") ?? "");
    const parsed = productSchema.safeParse({
      ...Object.fromEntries(fd),
      gender: fd.getAll("gender"),
      collections: fd.getAll("collections"),
      colourIds: fd.getAll("colourIds"),
      sizes: SIZES.filter((s) => fd.getAll("sizes").includes(s)),
      badges: fd.getAll("badges"),
      composition: parseComposition(String(fd.get("composition") ?? "")),
      features: lines(fd.get("features")),
      care: lines(fd.get("care")),
    });
    if (!parsed.success) return { error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error) };
    const data = parsed.data;

    const [slugTaken] = await db
      .select({ id: schema.products.id })
      .from(schema.products)
      .where(and(eq(schema.products.slug, data.slug), id ? ne(schema.products.id, id) : undefined));
    if (slugTaken) return { fields: { slug: "Another product already uses this URL slug." }, error: "Please fix the highlighted fields." };

    const productId = id || `p-${randomBytes(4).toString("hex")}`;
    await db.transaction(async (tx) => {
      if (id) {
        const [exists] = await tx.update(schema.products).set({ ...data, updatedAt: new Date() }).where(eq(schema.products.id, id)).returning({ id: schema.products.id });
        if (!exists) throw new Error("Product not found.");
      } else {
        await tx.insert(schema.products).values({ ...data, id: productId });
      }
      // Ensure a variant exists for every colour × size; deactivate removed combinations
      // (kept, not deleted, because past orders reference them).
      const existing = await tx.select().from(schema.variants).where(eq(schema.variants.productId, productId));
      const code = productId.replace(/^p-/, "").toUpperCase();
      for (const colour of data.colourIds) {
        for (const size of data.sizes) {
          const v = existing.find((x) => x.colour === colour && x.size === size);
          if (!v) {
            await tx.insert(schema.variants).values({ productId, colour, size, sku: `BR${code}-${colour.slice(0, 3).toUpperCase()}-${size}`, stock: 0 });
          } else if (!v.active) {
            await tx.update(schema.variants).set({ active: true }).where(eq(schema.variants.id, v.id));
          }
        }
      }
      for (const v of existing) {
        if (v.active && (!data.colourIds.includes(v.colour) || !(data.sizes as string[]).includes(v.size))) {
          await tx.update(schema.variants).set({ active: false }).where(eq(schema.variants.id, v.id));
        }
      }
    });
    refreshCatalog(productId);
    if (!id) createdId = productId;
    else return { ok: true, message: "Product saved." };
  } catch (e) {
    return fail(e);
  }
  redirect(`/admin/products/${createdId}?created=1`);
}

export async function setProductStatus(productId: string, status: "draft" | "active" | "archived") {
  await assertAdmin();
  await db.update(schema.products).set({ status, updatedAt: new Date() }).where(eq(schema.products.id, productId));
  refreshCatalog(productId);
}

export async function updateVariant(_: FormState, fd: FormData): Promise<FormState> {
  try {
    await assertAdmin();
    const id = String(fd.get("variantId") ?? "");
    const sku = String(fd.get("sku") ?? "").trim().toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9-]{1,39}$/.test(sku)) return { error: "SKU: 2–40 characters, letters, numbers and hyphens." };
    const [dupe] = await db.select({ id: schema.variants.id }).from(schema.variants).where(and(eq(schema.variants.sku, sku), ne(schema.variants.id, id)));
    if (dupe) return { error: `SKU ${sku} is already used by another variant.` };
    const [v] = await db.update(schema.variants).set({ sku, updatedAt: new Date() }).where(eq(schema.variants.id, id)).returning({ productId: schema.variants.productId });
    if (!v) return { error: "Variant not found." };
    refreshCatalog(v.productId);
    return { ok: true, message: "SKU updated." };
  } catch (e) {
    return fail(e);
  }
}

/* ── Images ───────────────────────────────────────────────────────────────── */

export async function deleteImage(imageId: string) {
  await assertAdmin();
  const [img] = await db.delete(schema.productImages).where(eq(schema.productImages.id, imageId)).returning();
  if (!img) return;
  await deleteStoredImage(img.storageKey);
  refreshCatalog(img.productId);
}

export async function deletePlaceholderImages(productId: string, colour: string) {
  await assertAdmin();
  await db
    .delete(schema.productImages)
    .where(and(eq(schema.productImages.productId, productId), eq(schema.productImages.colour, colour), eq(schema.productImages.isPlaceholder, true)));
  refreshCatalog(productId);
}

export async function moveImage(imageId: string, direction: -1 | 1) {
  await assertAdmin();
  await db.transaction(async (tx) => {
    const [img] = await tx.select().from(schema.productImages).where(eq(schema.productImages.id, imageId));
    if (!img) return;
    const siblings = await tx
      .select()
      .from(schema.productImages)
      .where(and(eq(schema.productImages.productId, img.productId), eq(schema.productImages.colour, img.colour)))
      .orderBy(asc(schema.productImages.position), asc(schema.productImages.createdAt));
    const i = siblings.findIndex((s) => s.id === imageId);
    const j = i + direction;
    if (j < 0 || j >= siblings.length) return;
    [siblings[i], siblings[j]] = [siblings[j], siblings[i]];
    for (const [pos, s] of siblings.entries()) {
      if (s.position !== pos) await tx.update(schema.productImages).set({ position: pos }).where(eq(schema.productImages.id, s.id));
    }
    refreshCatalog(img.productId);
  });
}

export async function updateImageMeta(imageId: string, alt: string, view: string) {
  await assertAdmin();
  const [img] = await db
    .update(schema.productImages)
    .set({ alt: alt.trim().slice(0, 200), view: ["front", "back", "side", "detail", "lifestyle", "model"].includes(view) ? view : "front" })
    .where(eq(schema.productImages.id, imageId))
    .returning({ productId: schema.productImages.productId });
  if (img) refreshCatalog(img.productId);
}

/* ── Inventory ────────────────────────────────────────────────────────────── */

const adjustSchema = z.object({
  variantId: z.uuid(),
  mode: z.enum(["add", "remove", "set"]),
  quantity: z.coerce.number().int("Whole units only.").min(0).max(100000),
  note: z.string().trim().max(200),
});

export async function adjustStockAction(_: FormState, fd: FormData): Promise<FormState> {
  try {
    const admin = await assertAdmin();
    const parsed = adjustSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return { error: Object.values(fieldErrors(parsed.error))[0] ?? "Invalid input." };
    if (parsed.data.mode !== "set" && parsed.data.quantity === 0) return { error: "Enter a quantity greater than 0." };
    const stock = await adjustStock(parsed.data, admin.id);
    const [v] = await db.select({ productId: schema.variants.productId }).from(schema.variants).where(eq(schema.variants.id, parsed.data.variantId));
    refreshCatalog(v?.productId);
    return { ok: true, message: `Stock is now ${stock}.` };
  } catch (e) {
    return fail(e);
  }
}

/* ── Orders ───────────────────────────────────────────────────────────────── */

const statusSchema = z.object({
  orderId: z.uuid(),
  status: z.enum(["packed", "shipped", "delivered", "returned"]),
  note: z.string().trim().max(300).default(""),
  courier: z.string().trim().max(60).optional(),
  trackingNumber: z.string().trim().max(80).optional(),
  restock: z.boolean(),
});

export async function updateOrderStatusAction(_: FormState, fd: FormData): Promise<FormState> {
  try {
    const admin = await assertAdmin();
    const parsed = statusSchema.safeParse({ ...Object.fromEntries(fd), restock: fd.get("restock") === "on" });
    if (!parsed.success) return { error: Object.values(fieldErrors(parsed.error))[0] ?? "Invalid input." };
    const { orderId, ...input } = parsed.data;
    await updateOrderStatus(orderId, input, admin.id);
    if (input.restock) updateTag(CATALOG_TAG);
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin", "layout");
    return { ok: true, message: "Order updated." };
  } catch (e) {
    return fail(e);
  }
}

export async function updateTrackingAction(_: FormState, fd: FormData): Promise<FormState> {
  try {
    await assertAdmin();
    const orderId = z.uuid().parse(fd.get("orderId"));
    await updateTracking(orderId, String(fd.get("courier") ?? "").trim().slice(0, 60), String(fd.get("trackingNumber") ?? "").trim().slice(0, 80));
    revalidatePath(`/admin/orders/${orderId}`);
    return { ok: true, message: "Tracking saved." };
  } catch (e) {
    return fail(e);
  }
}

export async function cancelOrderAdmin(_: FormState, fd: FormData): Promise<FormState> {
  try {
    const admin = await assertAdmin();
    const orderId = z.uuid().parse(fd.get("orderId"));
    const reason = String(fd.get("reason") ?? "").trim().slice(0, 200);
    await cancelOrder(orderId, { actorId: admin.id, asAdmin: true, note: reason ? `Cancelled by BRO'S: ${reason}` : "Cancelled by BRO'S" });
    updateTag(CATALOG_TAG);
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin", "layout");
    return { ok: true, message: "Order cancelled and stock restored." };
  } catch (e) {
    return fail(e);
  }
}

export async function markRefunded(orderId: string) {
  const admin = await assertAdmin();
  const [o] = await db
    .update(schema.orders)
    .set({ paymentStatus: "refunded", updatedAt: new Date() })
    .where(and(eq(schema.orders.id, orderId), eq(schema.orders.paymentStatus, "refund_pending")))
    .returning();
  if (o) await db.insert(schema.orderEvents).values({ orderId, status: o.status, note: "Refund marked as completed", actorId: admin.id });
  revalidatePath(`/admin/orders/${orderId}`);
}

