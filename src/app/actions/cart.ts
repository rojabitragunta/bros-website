"use server";

import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { colourMap } from "@/data/colours";
import { MAX_QTY } from "@/lib/catalog-utils";
import { db, schema } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { cartLineSchema } from "@/lib/validation";
import type { CartItem, ColourId, SizeCode } from "@/types";

/**
 * Server cart for signed-in customers (so the bag follows them across devices).
 * Guests keep the local cart; it is merged into the server cart on sign-in.
 */

type Line = z.infer<typeof cartLineSchema>;

/** Current prices and stock for bag lines — used to refresh the local cart. */
export async function priceCart(lines: Line[]): Promise<CartItem[]> {
  const parsed = z.array(cartLineSchema).max(50).safeParse(lines);
  if (!parsed.success || !parsed.data.length) return [];
  const ids = [...new Set(parsed.data.map((l) => l.productId))];
  const [rows, images] = await Promise.all([
    db
      .select({ v: schema.variants, p: schema.products })
      .from(schema.variants)
      .innerJoin(schema.products, eq(schema.products.id, schema.variants.productId))
      .where(inArray(schema.variants.productId, ids)),
    db.select().from(schema.productImages).where(inArray(schema.productImages.productId, ids)),
  ]);
  const out: CartItem[] = [];
  for (const l of parsed.data) {
    const r = rows.find((x) => x.v.productId === l.productId && x.v.colour === l.colour && x.v.size === l.size);
    if (!r || r.p.status !== "active" || !r.v.active) continue;
    const img = images.filter((i) => i.productId === l.productId && i.colour === l.colour).sort((a, b) => a.position - b.position)[0];
    const max = Math.min(MAX_QTY, r.v.stock);
    if (max <= 0) continue;
    out.push({
      key: `${l.productId}:${l.colour}:${l.size}`,
      productId: l.productId,
      slug: r.p.slug,
      name: r.p.name,
      price: r.p.price,
      colour: l.colour as ColourId,
      colourName: colourMap[l.colour as ColourId]?.name ?? l.colour,
      size: l.size as SizeCode,
      quantity: Math.min(l.quantity, max),
      image: img?.url ?? "",
      max,
    });
  }
  return out;
}

/** Merges the local cart into the signed-in user's server cart and returns the combined, re-priced cart. */
export async function syncCart(local: Line[]): Promise<CartItem[] | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const parsed = z.array(cartLineSchema).max(50).safeParse(local);
  const lines = parsed.success ? parsed.data : [];

  const stored = await db
    .select({ quantity: schema.cartItems.quantity, productId: schema.variants.productId, colour: schema.variants.colour, size: schema.variants.size })
    .from(schema.cartItems)
    .innerJoin(schema.variants, eq(schema.variants.id, schema.cartItems.variantId))
    .where(eq(schema.cartItems.userId, user.id));

  const merged = new Map<string, Line>();
  for (const l of [...stored, ...lines]) {
    const k = `${l.productId}:${l.colour}:${l.size}`;
    merged.set(k, { ...l, quantity: Math.max(merged.get(k)?.quantity ?? 0, l.quantity) });
  }
  const priced = await priceCart([...merged.values()]);
  await saveCartFor(user.id, priced);
  return priced;
}

/** Replaces the signed-in user's server cart. No-op for guests. */
export async function saveCart(lines: Line[]) {
  const user = await getCurrentUser();
  if (!user) return;
  const parsed = z.array(cartLineSchema).max(50).safeParse(lines);
  if (!parsed.success) return;
  await saveCartFor(user.id, parsed.data);
}

async function saveCartFor(userId: string, lines: Line[]) {
  const ids = [...new Set(lines.map((l) => l.productId))];
  const variants = ids.length ? await db.select().from(schema.variants).where(inArray(schema.variants.productId, ids)) : [];
  const values = lines
    .map((l) => ({ l, v: variants.find((v) => v.productId === l.productId && v.colour === l.colour && v.size === l.size) }))
    .filter((x) => x.v && x.l.quantity > 0)
    .map(({ l, v }) => ({ userId, variantId: v!.id, quantity: l.quantity }));
  await db.transaction(async (tx) => {
    await tx.delete(schema.cartItems).where(eq(schema.cartItems.userId, userId));
    if (values.length) await tx.insert(schema.cartItems).values(values);
  });
}

export async function clearServerCart() {
  const user = await getCurrentUser();
  if (user) await db.delete(schema.cartItems).where(and(eq(schema.cartItems.userId, user.id)));
}
