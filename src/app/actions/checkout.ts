"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { db, schema } from "@/lib/db";
import { AuthError, assertUser } from "@/lib/auth/session";
import { verifyPaymentSignature } from "@/lib/payments/razorpay";
import { CATALOG_TAG } from "@/lib/services/catalog";
import { OrderError, cancelOrder, confirmRazorpayPayment, placeOrder } from "@/lib/services/orders";
import { checkoutSchema, fieldErrors } from "@/lib/validation";

export type CheckoutResult =
  | { ok: true; orderId: string; number: string; paymentMethod: "cod" | "razorpay"; razorpay?: { orderId: string; amount: number; keyId: string } }
  | { ok: false; error: string; code?: string; fields?: Record<string, string> };

export async function placeOrderAction(input: unknown): Promise<CheckoutResult> {
  try {
    const user = await assertUser();
    const parsed = checkoutSchema.safeParse(input);
    if (!parsed.success) {
      const fields = fieldErrors(parsed.error);
      return { ok: false, error: "Please check the highlighted fields.", fields };
    }
    const { saveAddress, ...order } = parsed.data;
    const placed = await placeOrder(user, order);
    updateTag(CATALOG_TAG);

    if (saveAddress) {
      const a = order.address;
      const existing = await db.select().from(schema.addresses).where(eq(schema.addresses.userId, user.id));
      const same = existing.some((e) => e.line1 === a.line1 && e.pincode === a.pincode && e.name === a.name);
      if (!same) await db.insert(schema.addresses).values({ ...a, label: "Home", userId: user.id, isDefault: existing.length === 0 });
    }
    revalidatePath("/account");
    return {
      ok: true,
      orderId: placed.id,
      number: placed.number,
      paymentMethod: placed.paymentMethod,
      razorpay: placed.razorpayOrderId ? { orderId: placed.razorpayOrderId, amount: placed.total * 100, keyId: process.env.RAZORPAY_KEY_ID ?? "" } : undefined,
    };
  } catch (e) {
    return failure(e);
  }
}

/** Called by the Razorpay checkout handler. Verifies the signature and the payment itself before marking paid. */
export async function verifyPaymentAction(input: { orderId: string; razorpayOrderId: string; paymentId: string; signature: string }) {
  try {
    const user = await assertUser();
    const [o] = await db
      .select({ id: schema.orders.id })
      .from(schema.orders)
      .innerJoin(schema.payments, eq(schema.payments.orderId, schema.orders.id))
      .where(and(eq(schema.orders.id, input.orderId), eq(schema.orders.userId, user.id), eq(schema.payments.providerOrderId, input.razorpayOrderId)));
    if (!o) return { ok: false as const, error: "Order not found." };
    if (!verifyPaymentSignature(input.razorpayOrderId, input.paymentId, input.signature)) {
      return { ok: false as const, error: "We couldn't verify this payment. If money was deducted, it will be confirmed or refunded automatically." };
    }
    const result = await confirmRazorpayPayment(input.razorpayOrderId, input.paymentId);
    updateTag(CATALOG_TAG);
    revalidatePath("/account");
    return { ok: true as const, paid: result.paid };
  } catch (e) {
    return failure(e);
  }
}

export async function cancelMyOrder(orderId: string) {
  try {
    const user = await assertUser();
    await cancelOrder(orderId, { actorId: user.id, ownerId: user.id, note: "Cancelled by customer" });
    updateTag(CATALOG_TAG);
    revalidatePath("/account");
    revalidatePath(`/account/orders/${orderId}`);
    return { ok: true as const };
  } catch (e) {
    return failure(e);
  }
}

function failure(e: unknown): { ok: false; error: string; code?: string } {
  if (e instanceof AuthError) return { ok: false, error: e.message, code: "auth" };
  if (e instanceof OrderError) return { ok: false, error: e.message, code: e.code };
  console.error("[checkout]", e);
  return { ok: false, error: "Something went wrong on our side. Your order was not placed — please try again." };
}
