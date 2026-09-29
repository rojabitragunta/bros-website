/** Customer data access (server only). Every query is scoped to the given user id. */
import "server-only";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { Address, Order, OrderLine, SizeCode } from "@/types";

type OrderRow = typeof schema.orders.$inferSelect;
type ItemRow = typeof schema.orderItems.$inferSelect;

export function toOrder(o: OrderRow, items: ItemRow[]): Order {
  return {
    id: o.id,
    number: o.number,
    placedAt: o.createdAt.toISOString(),
    status: o.status,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    total: o.total,
    lines: items.map<OrderLine>((i) => ({
      productId: i.productId,
      name: i.name,
      colourName: i.colourName,
      size: i.size as SizeCode,
      quantity: i.quantity,
      price: i.price,
      image: i.image,
    })),
  };
}

export async function getUserOrders(userId: string, limit = 50): Promise<Order[]> {
  const rows = await db.select().from(schema.orders).where(eq(schema.orders.userId, userId)).orderBy(desc(schema.orders.createdAt)).limit(limit);
  if (!rows.length) return [];
  const items = await db.select().from(schema.orderItems).where(inArray(schema.orderItems.orderId, rows.map((r) => r.id)));
  return rows.map((o) => toOrder(o, items.filter((i) => i.orderId === o.id)));
}

/** Returns the order only if it belongs to the user. */
export async function getUserOrder(userId: string, orderId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return null;
  const [o] = await db.select().from(schema.orders).where(and(eq(schema.orders.id, orderId), eq(schema.orders.userId, userId)));
  if (!o) return null;
  const [items, events, payment] = await Promise.all([
    db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, o.id)),
    db.select().from(schema.orderEvents).where(eq(schema.orderEvents.orderId, o.id)).orderBy(asc(schema.orderEvents.createdAt)),
    db.select().from(schema.payments).where(eq(schema.payments.orderId, o.id)),
  ]);
  return { row: o, items, events, payment: payment[0] ?? null };
}

export async function getAddresses(userId: string): Promise<Address[]> {
  const rows = await db
    .select()
    .from(schema.addresses)
    .where(eq(schema.addresses.userId, userId))
    .orderBy(desc(schema.addresses.isDefault), asc(schema.addresses.createdAt));
  return rows.map((a) => ({ id: a.id, label: a.label, name: a.name, line1: a.line1, line2: a.line2, city: a.city, state: a.state, pincode: a.pincode, phone: a.phone, isDefault: a.isDefault }));
}
