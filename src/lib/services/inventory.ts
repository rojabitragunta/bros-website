/**
 * Inventory — every stock change goes through applyStockChange() inside a
 * transaction, so the variant row and its journal entry always agree.
 *
 * Concurrency: the conditional UPDATE takes a row lock; a competing order
 * waits, then re-checks `stock + delta >= 0` against the committed value.
 * Stock can therefore never go negative (also enforced by a CHECK constraint).
 */
import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db, schema, type Tx } from "@/lib/db";

type Reason = (typeof schema.movementReasonEnum.enumValues)[number];

export class StockError extends Error {
  constructor(
    public variantId: string,
    public requested: number,
    public available: number,
  ) {
    super(`Only ${available} left in stock.`);
  }
}

export async function applyStockChange(
  tx: Tx,
  change: { variantId: string; delta: number; reason: Reason; note?: string; actorId?: string | null; orderId?: string | null },
): Promise<number> {
  const v = schema.variants;
  const [row] = await tx
    .update(v)
    .set({ stock: sql`${v.stock} + ${change.delta}`, updatedAt: new Date() })
    .where(and(eq(v.id, change.variantId), sql`${v.stock} + ${change.delta} >= 0`))
    .returning({ stock: v.stock });
  if (!row) {
    const [cur] = await tx.select({ stock: v.stock }).from(v).where(eq(v.id, change.variantId));
    throw new StockError(change.variantId, -change.delta, cur?.stock ?? 0);
  }
  await tx.insert(schema.inventoryMovements).values({
    variantId: change.variantId,
    delta: change.delta,
    stockAfter: row.stock,
    reason: change.reason,
    note: change.note ?? "",
    actorId: change.actorId ?? null,
    orderId: change.orderId ?? null,
  });
  return row.stock;
}

export type AdjustMode = "add" | "remove" | "set";

/** Admin stock adjustment: receive stock, remove (damaged/lost), or correct to a counted value. */
export async function adjustStock(input: { variantId: string; mode: AdjustMode; quantity: number; note: string }, actorId: string) {
  return db.transaction(async (tx) => {
    if (input.mode === "set") {
      const [cur] = await tx
        .select({ stock: schema.variants.stock })
        .from(schema.variants)
        .where(eq(schema.variants.id, input.variantId))
        .for("update");
      if (!cur) throw new Error("Variant not found.");
      const delta = input.quantity - cur.stock;
      if (delta === 0) return cur.stock;
      return applyStockChange(tx, { variantId: input.variantId, delta, reason: "correction", note: input.note, actorId });
    }
    const delta = input.mode === "add" ? input.quantity : -input.quantity;
    return applyStockChange(tx, {
      variantId: input.variantId,
      delta,
      reason: input.mode === "add" ? "received" : "adjustment",
      note: input.note,
      actorId,
    });
  });
}
