import { revalidateTag } from "next/cache";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";
import { CATALOG_TAG } from "@/lib/services/catalog";
import { OrderError, confirmRazorpayPayment } from "@/lib/services/orders";

/**
 * Razorpay webhook (configure in Razorpay Dashboard → Webhooks):
 *   URL:    https://<your-domain>/api/payments/razorpay/webhook
 *   Events: payment.captured, order.paid
 *   Secret: RAZORPAY_WEBHOOK_SECRET
 * Confirms payments even if the customer closes the tab before the callback.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  if (!verifyWebhookSignature(raw, signature)) return new Response("Invalid signature", { status: 401 });

  let event: { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string } } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  const payment = event.payload?.payment?.entity;
  if ((event.event === "payment.captured" || event.event === "order.paid") && payment?.id && payment.order_id) {
    try {
      // Re-fetches the payment from Razorpay and is idempotent.
      await confirmRazorpayPayment(payment.order_id, payment.id);
      revalidateTag(CATALOG_TAG, { expire: 0 });
    } catch (e) {
      // Not one of our orders (or amount mismatch): acknowledge so Razorpay stops retrying.
      if (e instanceof OrderError) return new Response("ignored");
      console.error("[razorpay webhook]", e);
      return new Response("Retry", { status: 500 });
    }
  }
  return new Response("ok");
}
