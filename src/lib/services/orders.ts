/**
 * Orders (server only).
 *
 * placeOrder():
 *  - re-prices every line from the database (client prices are never trusted);
 *  - is idempotent per checkout attempt (unique idempotency key);
 *  - decrements stock atomically in the same transaction as the order insert,
 *    so either the whole order succeeds or nothing changes.
 *
 * Online-payment orders reserve stock for RESERVATION_MINUTES; unpaid ones are
 * cancelled and their stock restored by releaseExpiredReservations().
 */
import "server-only";
import { and, asc, eq, inArray, lt, sql } from "drizzle-orm";
import { colourMap } from "@/data/colours";
import { MAX_QTY } from "@/lib/catalog-utils";
import { db, schema, type Tx } from "@/lib/db";
import type { AddressSnapshot } from "@/lib/db/schema";
import { createRazorpayOrder, fetchPayment, razorpayEnabled } from "@/lib/payments/razorpay";
import { computeTotals } from "@/lib/pricing";
import { StockError, applyStockChange } from "./inventory";

export const RESERVATION_MINUTES = 30;

type OrderStatus = (typeof schema.orderStatusEnum.enumValues)[number];
type PaymentStatus = (typeof schema.paymentStatusEnum.enumValues)[number];

export class OrderError extends Error {
  constructor(
    message: string,
    public code: "unavailable" | "insufficient" | "price_changed" | "invalid" | "payment" = "invalid",
  ) {
    super(message);
  }
}

export interface PlaceOrderInput {
  idempotencyKey: string;
  items: { productId: string; colour: string; size: string; quantity: number }[];
  address: AddressSnapshot;
  paymentMethod: "cod" | "razorpay";
  /** Total the customer saw; if the server total differs, the order is rejected. */
  expectedTotal: number;
}

export interface PlacedOrder {
  id: string;
  number: string;
  total: number;
  paymentMethod: "cod" | "razorpay";
  razorpayOrderId?: string;
}

async function existingOrder(key: string, userId: string): Promise<PlacedOrder | null> {
  const [o] = await db.select().from(schema.orders).where(eq(schema.orders.idempotencyKey, key));
  if (!o) return null;
  if (o.userId !== userId) throw new OrderError("Invalid checkout session. Please refresh and try again.");
  const [p] = await db.select().from(schema.payments).where(eq(schema.payments.orderId, o.id));
  return { id: o.id, number: o.number, total: o.total, paymentMethod: o.paymentMethod, razorpayOrderId: p?.providerOrderId };
}

export async function placeOrder(user: { id: string; email: string }, input: PlaceOrderInput): Promise<PlacedOrder> {
  const dup = await existingOrder(input.idempotencyKey, user.id);
  if (dup) return dup;

  if (input.paymentMethod === "razorpay" && !razorpayEnabled()) {
    throw new OrderError("Online payment is not available yet. Please choose Cash on Delivery.", "payment");
  }

  await releaseExpiredReservations();

  // Merge duplicate lines and cap quantities.
  const merged = new Map<string, PlaceOrderInput["items"][number]>();
  for (const i of input.items) {
    const k = `${i.productId}:${i.colour}:${i.size}`;
    const prev = merged.get(k);
    merged.set(k, { ...i, quantity: (prev?.quantity ?? 0) + i.quantity });
  }
  const lines = [...merged.values()];
  if (!lines.length) throw new OrderError("Your bag is empty.");
  for (const l of lines) if (l.quantity > MAX_QTY) throw new OrderError(`You can order up to ${MAX_QTY} of each item.`);

  // Resolve variants + current prices from the database.
  const productIds = [...new Set(lines.map((l) => l.productId))];
  const rows = await db
    .select({ v: schema.variants, p: schema.products })
    .from(schema.variants)
    .innerJoin(schema.products, eq(schema.products.id, schema.variants.productId))
    .where(inArray(schema.variants.productId, productIds));
  const images = await db
    .select({ productId: schema.productImages.productId, colour: schema.productImages.colour, url: schema.productImages.url })
    .from(schema.productImages)
    .where(inArray(schema.productImages.productId, productIds))
    .orderBy(asc(schema.productImages.position));

  const resolved = lines.map((l) => {
    const row = rows.find((r) => r.v.productId === l.productId && r.v.colour === l.colour && r.v.size === l.size);
    if (!row || !row.v.active || row.p.status !== "active") {
      throw new OrderError(`An item in your bag is no longer available. Please remove it and try again.`, "unavailable");
    }
    return {
      ...l,
      variant: row.v,
      product: row.p,
      image: images.find((i) => i.productId === l.productId && i.colour === l.colour)?.url ?? "",
    };
  });

  const totals = computeTotals(resolved.map((r) => ({ price: r.product.price, quantity: r.quantity })));
  if (totals.total !== input.expectedTotal) {
    throw new OrderError("Prices in your bag have changed. Please review your order and try again.", "price_changed");
  }

  const online = input.paymentMethod === "razorpay";
  let order: typeof schema.orders.$inferSelect;
  try {
    order = await db.transaction(async (tx) => {
      const [{ n }] = await tx.execute<{ n: string }>(sql`select nextval('order_number_seq')::text as n`);
      const [o] = await tx
        .insert(schema.orders)
        .values({
          number: `BR${n}`,
          userId: user.id,
          idempotencyKey: input.idempotencyKey,
          status: online ? "pending_payment" : "placed",
          paymentMethod: input.paymentMethod,
          paymentStatus: online ? "pending" : "cod_pending",
          subtotal: totals.subtotal,
          shipping: totals.shipping,
          taxIncluded: totals.taxIncluded,
          total: totals.total,
          email: user.email,
          shippingAddress: input.address,
          reservationExpiresAt: online ? new Date(Date.now() + RESERVATION_MINUTES * 60_000) : null,
        })
        .returning();

      // Lock variants in a stable order to avoid deadlocks between concurrent checkouts.
      for (const r of [...resolved].sort((a, b) => a.variant.id.localeCompare(b.variant.id))) {
        await applyStockChange(tx, { variantId: r.variant.id, delta: -r.quantity, reason: "sale", orderId: o.id, actorId: user.id, note: `Order ${o.number}` });
      }
      await tx.insert(schema.orderItems).values(
        resolved.map((r) => ({
          orderId: o.id,
          variantId: r.variant.id,
          productId: r.product.id,
          slug: r.product.slug,
          name: r.product.name,
          colour: r.colour,
          colourName: colourMap[r.colour as keyof typeof colourMap]?.name ?? r.colour,
          size: r.size,
          sku: r.variant.sku,
          price: r.product.price,
          quantity: r.quantity,
          image: r.image,
        })),
      );
      await tx.insert(schema.orderEvents).values({
        orderId: o.id,
        status: o.status,
        note: online ? "Awaiting online payment" : "Order placed — Cash on Delivery",
        actorId: user.id,
      });
      await tx.delete(schema.cartItems).where(eq(schema.cartItems.userId, user.id));
      return o;
    });
  } catch (e) {
    if (e instanceof StockError) {
      const r = resolved.find((x) => x.variant.id === e.variantId);
      const what = r ? `${r.product.name} (${colourMap[r.colour as keyof typeof colourMap]?.name ?? r.colour}, ${r.size})` : "An item";
      throw new OrderError(
        e.available > 0 ? `${what}: only ${e.available} left. Please reduce the quantity.` : `${what} just sold out. Please remove it from your bag.`,
        "insufficient",
      );
    }
    // Two simultaneous submits of the same checkout: return the order the other one created.
    if (isUniqueViolation(e)) {
      const again = await existingOrder(input.idempotencyKey, user.id);
      if (again) return again;
    }
    throw e;
  }

  if (!online) return { id: order.id, number: order.number, total: order.total, paymentMethod: "cod" };

  try {
    const rp = await createRazorpayOrder(order.total, order.number, { orderId: order.id });
    await db.insert(schema.payments).values({ orderId: order.id, provider: "razorpay", providerOrderId: rp.id, amount: order.total });
    return { id: order.id, number: order.number, total: order.total, paymentMethod: "razorpay", razorpayOrderId: rp.id };
  } catch {
    await cancelOrder(order.id, { actorId: null, note: "Could not start online payment", paymentStatus: "failed" });
    throw new OrderError("We couldn't start the online payment. No money was taken — please try again or choose Cash on Delivery.", "payment");
  }
}

function isUniqueViolation(e: unknown) {
  const err = e as { code?: string; cause?: { code?: string } };
  return err?.code === "23505" || err?.cause?.code === "23505";
}

/* ── Cancellation & status ────────────────────────────────────────────────── */

const CUSTOMER_CANCELLABLE: OrderStatus[] = ["pending_payment", "placed"];
const ADMIN_CANCELLABLE: OrderStatus[] = ["pending_payment", "placed", "packed"];

/**
 * Cancels an order and restores its stock exactly once (the status transition
 * is the guard, so repeated calls are harmless).
 */
export async function cancelOrder(
  orderId: string,
  opts: { actorId: string | null; note?: string; ownerId?: string; asAdmin?: boolean; paymentStatus?: PaymentStatus },
) {
  return db.transaction(async (tx) => {
    const [cur] = await tx.select().from(schema.orders).where(eq(schema.orders.id, orderId)).for("update");
    if (!cur || (opts.ownerId && cur.userId !== opts.ownerId)) throw new OrderError("Order not found.");
    const allowed = opts.asAdmin ? ADMIN_CANCELLABLE : CUSTOMER_CANCELLABLE;
    if (cur.status === "cancelled") return cur;
    if (!allowed.includes(cur.status)) throw new OrderError("This order can no longer be cancelled.");

    const paymentStatus: PaymentStatus =
      opts.paymentStatus ?? (cur.paymentStatus === "paid" ? "refund_pending" : cur.paymentStatus === "pending" ? "failed" : cur.paymentStatus);
    const [o] = await tx
      .update(schema.orders)
      .set({ status: "cancelled", paymentStatus, reservationExpiresAt: null, updatedAt: new Date() })
      .where(eq(schema.orders.id, orderId))
      .returning();
    await restock(tx, o, "cancellation", opts.actorId);
    await tx.insert(schema.orderEvents).values({
      orderId,
      status: "cancelled",
      note: [opts.note, paymentStatus === "refund_pending" ? "Refund required" : ""].filter(Boolean).join(" — "),
      actorId: opts.actorId,
    });
    return o;
  });
}

async function restock(tx: Tx, order: { id: string; number: string }, reason: "cancellation" | "return", actorId: string | null) {
  const items = await tx.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, order.id));
  for (const i of [...items].sort((a, b) => a.variantId.localeCompare(b.variantId))) {
    await applyStockChange(tx, { variantId: i.variantId, delta: i.quantity, reason, orderId: order.id, actorId, note: `Order ${order.number}` });
  }
}

export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: [],
  placed: ["packed", "shipped"],
  packed: ["shipped"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

export async function updateOrderStatus(
  orderId: string,
  input: { status: OrderStatus; note?: string; courier?: string; trackingNumber?: string; restock?: boolean },
  actorId: string,
) {
  return db.transaction(async (tx) => {
    const [cur] = await tx.select().from(schema.orders).where(eq(schema.orders.id, orderId)).for("update");
    if (!cur) throw new OrderError("Order not found.");
    if (!NEXT_STATUSES[cur.status].includes(input.status)) {
      throw new OrderError(`Can't move an order from ${cur.status.replace("_", " ")} to ${input.status.replace("_", " ")}.`);
    }
    let paymentStatus = cur.paymentStatus;
    if (input.status === "delivered" && cur.paymentStatus === "cod_pending") paymentStatus = "paid";
    if (input.status === "returned" && cur.paymentStatus === "paid") paymentStatus = "refund_pending";
    const [o] = await tx
      .update(schema.orders)
      .set({
        status: input.status,
        paymentStatus,
        courier: input.courier ?? cur.courier,
        trackingNumber: input.trackingNumber ?? cur.trackingNumber,
        updatedAt: new Date(),
      })
      .where(eq(schema.orders.id, orderId))
      .returning();
    if (input.status === "returned" && input.restock) await restock(tx, o, "return", actorId);
    await tx.insert(schema.orderEvents).values({ orderId, status: input.status, note: input.note ?? "", actorId });
    return o;
  });
}

/** Updates courier/tracking without changing status. */
export async function updateTracking(orderId: string, courier: string, trackingNumber: string) {
  await db.update(schema.orders).set({ courier, trackingNumber, updatedAt: new Date() }).where(eq(schema.orders.id, orderId));
}

/** Cancels unpaid online orders whose reservation has expired. Safe to call often. */
export async function releaseExpiredReservations() {
  const expired = await db
    .select({ id: schema.orders.id })
    .from(schema.orders)
    .where(and(eq(schema.orders.status, "pending_payment"), lt(schema.orders.reservationExpiresAt, new Date())));
  for (const o of expired) {
    await cancelOrder(o.id, { actorId: null, asAdmin: true, note: "Payment not completed in time — stock released", paymentStatus: "failed" }).catch(() => {});
  }
  return expired.length;
}

/* ── Payments ─────────────────────────────────────────────────────────────── */

/**
 * Marks an online order paid after the payment has been verified with Razorpay.
 * Idempotent: safe to call from both the checkout callback and the webhook.
 */
export async function confirmRazorpayPayment(razorpayOrderId: string, paymentId: string) {
  const payment = await fetchPayment(paymentId);
  const [pay] = await db.select().from(schema.payments).where(eq(schema.payments.providerOrderId, razorpayOrderId));
  if (!pay) throw new OrderError("Payment record not found.", "payment");
  if (payment.order_id !== razorpayOrderId || payment.amount !== pay.amount * 100 || payment.currency !== "INR") {
    throw new OrderError("Payment details did not match the order.", "payment");
  }
  if (payment.status !== "captured") {
    // Authorised but not yet captured — the webhook will confirm it once captured.
    return { paid: false as const, orderId: pay.orderId };
  }

  return db.transaction(async (tx) => {
    await tx
      .update(schema.payments)
      .set({ providerPaymentId: paymentId, status: "captured", updatedAt: new Date() })
      .where(eq(schema.payments.id, pay.id));
    const [cur] = await tx.select().from(schema.orders).where(eq(schema.orders.id, pay.orderId)).for("update");
    if (!cur) throw new OrderError("Order not found.");
    if (cur.paymentStatus === "paid") return { paid: true as const, orderId: cur.id };

    if (cur.status === "pending_payment") {
      await tx
        .update(schema.orders)
        .set({ status: "placed", paymentStatus: "paid", reservationExpiresAt: null, updatedAt: new Date() })
        .where(eq(schema.orders.id, cur.id));
      await tx.insert(schema.orderEvents).values({ orderId: cur.id, status: "placed", note: `Payment received (${paymentId})` });
      return { paid: true as const, orderId: cur.id };
    }

    if (cur.status === "cancelled") {
      // Paid after the reservation expired: re-reserve stock if still available, else flag a refund.
      try {
        await tx.transaction(async (sp) => {
          const items = await sp.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, cur.id));
          for (const i of [...items].sort((a, b) => a.variantId.localeCompare(b.variantId))) {
            await applyStockChange(sp, { variantId: i.variantId, delta: -i.quantity, reason: "sale", orderId: cur.id, note: `Order ${cur.number} (late payment)` });
          }
        });
        await tx.update(schema.orders).set({ status: "placed", paymentStatus: "paid", updatedAt: new Date() }).where(eq(schema.orders.id, cur.id));
        await tx.insert(schema.orderEvents).values({ orderId: cur.id, status: "placed", note: `Late payment received (${paymentId}) — order reinstated` });
        return { paid: true as const, orderId: cur.id };
      } catch (e) {
        if (!(e instanceof StockError)) throw e;
        await tx.update(schema.orders).set({ paymentStatus: "refund_pending", updatedAt: new Date() }).where(eq(schema.orders.id, cur.id));
        await tx.insert(schema.orderEvents).values({
          orderId: cur.id,
          status: "cancelled",
          note: `Late payment received (${paymentId}) but stock is no longer available — refund required`,
        });
        return { paid: false as const, orderId: cur.id, refund: true };
      }
    }
    return { paid: false as const, orderId: cur.id };
  });
}
