import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/types";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Awaiting payment",
  placed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "Payment pending",
  paid: "Paid",
  failed: "Payment failed",
  cod_pending: "Pay on delivery",
  refund_pending: "Refund pending",
  refunded: "Refunded",
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cod: "Cash on Delivery",
  razorpay: "Online (Razorpay)",
};

/** Customer-facing tracking steps. */
export const TRACK_STEPS: OrderStatus[] = ["placed", "packed", "shipped", "delivered"];

export function trackStepIndex(status: OrderStatus) {
  return TRACK_STEPS.indexOf(status);
}
