/**
 * Admin data access (server only). Callers must have passed requireAdmin().
 */
import "server-only";
import { and, asc, count, desc, eq, gte, ilike, inArray, lte, ne, notInArray, or, sql, sum } from "drizzle-orm";
import { db, schema } from "@/lib/db";

const { products, variants, productImages, inventoryMovements, orders, orderItems, orderEvents, payments, users } = schema;

export type StockFilter = "all" | "low" | "out" | "in";

const like = (q: string) => `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;

export async function getDashboard() {
  const since30 = new Date(Date.now() - 30 * 86400_000);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [statusCounts, [rev], [todayCount], [stock], recent, lowList, [refunds]] = await Promise.all([
    db.select({ status: orders.status, n: count() }).from(orders).groupBy(orders.status),
    db
      .select({ total: sum(orders.total), n: count() })
      .from(orders)
      .where(and(gte(orders.createdAt, since30), notInArray(orders.status, ["cancelled", "pending_payment"]))),
    db.select({ n: count() }).from(orders).where(and(gte(orders.createdAt, today), ne(orders.status, "pending_payment"))),
    db
      .select({
        out: sql<number>`count(*) filter (where ${variants.stock} = 0)`.mapWith(Number),
        low: sql<number>`count(*) filter (where ${variants.stock} > 0 and ${variants.stock} <= ${products.lowStockThreshold})`.mapWith(Number),
        units: sql<number>`coalesce(sum(${variants.stock}), 0)`.mapWith(Number),
      })
      .from(variants)
      .innerJoin(products, eq(products.id, variants.productId))
      .where(and(eq(variants.active, true), ne(products.status, "archived"))),
    db
      .select({ id: orders.id, number: orders.number, status: orders.status, total: orders.total, createdAt: orders.createdAt, email: orders.email, paymentStatus: orders.paymentStatus })
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(8),
    listInventory({ filter: "low", limit: 8 }),
    db.select({ n: count() }).from(orders).where(eq(orders.paymentStatus, "refund_pending")),
  ]);
  const byStatus = Object.fromEntries(statusCounts.map((s) => [s.status, s.n])) as Record<string, number>;
  return {
    revenue30: Number(rev?.total ?? 0),
    orders30: rev?.n ?? 0,
    ordersToday: todayCount?.n ?? 0,
    toFulfil: (byStatus.placed ?? 0) + (byStatus.packed ?? 0),
    refundsPending: refunds?.n ?? 0,
    byStatus,
    stock,
    recent,
    lowList,
  };
}

export async function listAdminProducts(opts: { q?: string; status?: string }) {
  const where = and(
    opts.q ? or(ilike(products.name, like(opts.q)), ilike(products.slug, like(opts.q)), ilike(products.category, like(opts.q))) : undefined,
    opts.status && opts.status !== "all" ? eq(products.status, opts.status as "active") : undefined,
  );
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      category: products.category,
      status: products.status,
      low: products.lowStockThreshold,
      updatedAt: products.updatedAt,
      units: sql<number>`coalesce(sum(${variants.stock}) filter (where ${variants.active}), 0)`.mapWith(Number),
      variantCount: sql<number>`count(${variants.id}) filter (where ${variants.active})`.mapWith(Number),
      outCount: sql<number>`count(${variants.id}) filter (where ${variants.active} and ${variants.stock} = 0)`.mapWith(Number),
      lowCount: sql<number>`count(${variants.id}) filter (where ${variants.active} and ${variants.stock} > 0 and ${variants.stock} <= ${products.lowStockThreshold})`.mapWith(Number),
    })
    .from(products)
    .leftJoin(variants, eq(variants.productId, products.id))
    .where(where)
    .groupBy(products.id)
    .orderBy(asc(products.featuredRank), asc(products.name));
  const ids = rows.map((r) => r.id);
  const thumbs = ids.length
    ? await db
        .selectDistinctOn([productImages.productId], { productId: productImages.productId, url: productImages.url })
        .from(productImages)
        .where(inArray(productImages.productId, ids))
        .orderBy(productImages.productId, asc(productImages.position))
    : [];
  return rows.map((r) => ({ ...r, thumb: thumbs.find((t) => t.productId === r.id)?.url }));
}

export async function getAdminProduct(id: string) {
  const [p] = await db.select().from(products).where(eq(products.id, id));
  if (!p) return null;
  const [images, vs] = await Promise.all([
    db.select().from(productImages).where(eq(productImages.productId, id)).orderBy(asc(productImages.colour), asc(productImages.position)),
    db.select().from(variants).where(eq(variants.productId, id)).orderBy(asc(variants.colour), asc(variants.size)),
  ]);
  return { product: p, images, variants: vs };
}

export async function listInventory(opts: { q?: string; filter?: StockFilter; productId?: string; limit?: number }) {
  const filter = opts.filter ?? "all";
  const where = and(
    eq(variants.active, true),
    ne(products.status, "archived"),
    opts.productId ? eq(variants.productId, opts.productId) : undefined,
    opts.q ? or(ilike(products.name, like(opts.q)), ilike(variants.sku, like(opts.q))) : undefined,
    filter === "out" ? eq(variants.stock, 0) : undefined,
    filter === "low" ? and(sql`${variants.stock} > 0`, lte(variants.stock, products.lowStockThreshold)) : undefined,
    filter === "in" ? sql`${variants.stock} > ${products.lowStockThreshold}` : undefined,
  );
  return db
    .select({
      id: variants.id,
      sku: variants.sku,
      colour: variants.colour,
      size: variants.size,
      stock: variants.stock,
      productId: products.id,
      productName: products.name,
      lowThreshold: products.lowStockThreshold,
    })
    .from(variants)
    .innerJoin(products, eq(products.id, variants.productId))
    .where(where)
    .orderBy(filter === "low" || filter === "out" ? asc(variants.stock) : asc(products.featuredRank), asc(products.name), asc(variants.colour), asc(variants.size))
    .limit(opts.limit ?? 500);
}

export async function listMovements(opts: { variantId?: string; q?: string; limit?: number }) {
  return db
    .select({
      id: inventoryMovements.id,
      createdAt: inventoryMovements.createdAt,
      delta: inventoryMovements.delta,
      stockAfter: inventoryMovements.stockAfter,
      reason: inventoryMovements.reason,
      note: inventoryMovements.note,
      orderId: inventoryMovements.orderId,
      sku: variants.sku,
      productName: products.name,
      actor: users.email,
    })
    .from(inventoryMovements)
    .innerJoin(variants, eq(variants.id, inventoryMovements.variantId))
    .innerJoin(products, eq(products.id, variants.productId))
    .leftJoin(users, eq(users.id, inventoryMovements.actorId))
    .where(
      and(
        opts.variantId ? eq(inventoryMovements.variantId, opts.variantId) : undefined,
        opts.q ? or(ilike(products.name, like(opts.q)), ilike(variants.sku, like(opts.q)), ilike(inventoryMovements.note, like(opts.q))) : undefined,
      ),
    )
    .orderBy(desc(inventoryMovements.createdAt), desc(inventoryMovements.id))
    .limit(opts.limit ?? 200);
}

export async function listOrders(opts: { q?: string; status?: string; limit?: number }) {
  const q = opts.q?.trim();
  return db
    .select({
      id: orders.id,
      number: orders.number,
      status: orders.status,
      paymentMethod: orders.paymentMethod,
      paymentStatus: orders.paymentStatus,
      total: orders.total,
      createdAt: orders.createdAt,
      email: orders.email,
      name: sql<string>`${orders.shippingAddress}->>'name'`,
      city: sql<string>`${orders.shippingAddress}->>'city'`,
      items: sql<number>`(select coalesce(sum(${orderItems.quantity}), 0) from ${orderItems} where ${orderItems.orderId} = ${orders.id})`.mapWith(Number),
    })
    .from(orders)
    .where(
      and(
        opts.status && opts.status !== "all" ? eq(orders.status, opts.status as "placed") : undefined,
        q
          ? or(
              ilike(orders.number, like(q)),
              ilike(orders.email, like(q)),
              sql`${orders.shippingAddress}->>'name' ilike ${like(q)}`,
              sql`${orders.shippingAddress}->>'phone' ilike ${like(q)}`,
            )
          : undefined,
      ),
    )
    .orderBy(desc(orders.createdAt))
    .limit(opts.limit ?? 200);
}

export async function getAdminOrder(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [o] = await db.select().from(orders).where(eq(orders.id, id));
  if (!o) return null;
  const [items, events, pay, [customer]] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, id)),
    db
      .select({ id: orderEvents.id, status: orderEvents.status, note: orderEvents.note, createdAt: orderEvents.createdAt, actor: users.email })
      .from(orderEvents)
      .leftJoin(users, eq(users.id, orderEvents.actorId))
      .where(eq(orderEvents.orderId, id))
      .orderBy(asc(orderEvents.createdAt)),
    db.select().from(payments).where(eq(payments.orderId, id)),
    db.select({ email: users.email, firstName: users.firstName, lastName: users.lastName, phone: users.phone }).from(users).where(eq(users.id, o.userId)),
  ]);
  return { order: o, items, events, payment: pay[0] ?? null, customer };
}
