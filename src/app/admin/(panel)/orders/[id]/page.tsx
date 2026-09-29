import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CancelForm, MarkRefundedButton, StatusForm, TrackingForm } from "@/components/admin/OrderAdminForms";
import { Card, OrderStatusPill, PageHeader, PaymentPill } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/session";
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from "@/lib/order-display";
import { getAdminOrder } from "@/lib/services/admin";
import { NEXT_STATUSES } from "@/lib/services/orders";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const dt = (d: Date) => d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const data = await getAdminOrder((await params).id);
  if (!data) notFound();
  const { order: o, items, events, payment, customer } = data;
  const a = o.shippingAddress;
  const next = NEXT_STATUSES[o.status];
  const cancellable = ["pending_payment", "placed", "packed"].includes(o.status);

  return (
    <>
      <PageHeader
        title={`#${o.number}`}
        sub={`Placed ${dt(o.createdAt)} · ${PAYMENT_METHOD_LABEL[o.paymentMethod]}`}
        actions={
          <>
            <OrderStatusPill status={o.status} />
            <PaymentPill status={o.paymentStatus} />
          </>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          <Card title="Items">
            <ul className="divide-y divide-line">
              {items.map((i) => (
                <li key={i.id} className="flex items-center gap-4 py-3">
                  <span className="relative h-16 w-12 shrink-0 overflow-hidden bg-[#e4e2dd]">
                    {i.image && <Image src={i.image} alt="" fill sizes="48px" className="object-cover" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <Link href={`/admin/products/${i.productId}`} className="block truncate text-sm hover:underline">
                      {i.name}
                    </Link>
                    <span className="font-mono text-[0.6875rem] uppercase text-mist">
                      {i.sku} · {i.colourName} / {i.size}
                    </span>
                  </span>
                  <span className="font-mono text-sm">
                    {i.quantity} × {formatPrice(i.price)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-mist">Subtotal</dt>
                <dd className="font-mono">{formatPrice(o.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mist">Shipping</dt>
                <dd className="font-mono">{o.shipping ? formatPrice(o.shipping) : "Free"}</dd>
              </div>
              <div className="flex justify-between text-xs">
                <dt className="text-steel">GST included</dt>
                <dd className="font-mono text-steel">{formatPrice(o.taxIncluded)}</dd>
              </div>
              <div className="flex justify-between text-base">
                <dt>Total</dt>
                <dd className="font-mono">{formatPrice(o.total)}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Update status">
            <StatusForm orderId={o.id} next={next} courier={o.courier} trackingNumber={o.trackingNumber} />
          </Card>

          {!next.length && o.status !== "cancelled" && (
            <Card title="Shipment tracking">
              <TrackingForm orderId={o.id} courier={o.courier} trackingNumber={o.trackingNumber} />
            </Card>
          )}

          <Card title="History">
            <ol className="space-y-3 border-l border-line pl-4 text-sm">
              {events.map((e) => (
                <li key={e.id}>
                  <span className="font-mono text-[0.6875rem] text-mist">
                    {dt(e.createdAt)} · {e.actor ?? "system"}
                  </span>
                  <p>
                    {ORDER_STATUS_LABEL[e.status]}
                    {e.note && <span className="text-mist"> — {e.note}</span>}
                  </p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Customer">
            <p className="text-sm">
              {customer ? `${customer.firstName} ${customer.lastName}` : a.name}
              <br />
              <span className="text-mist">{o.email}</span>
              {customer?.phone && (
                <>
                  <br />
                  <span className="text-mist">{customer.phone}</span>
                </>
              )}
            </p>
          </Card>
          <Card title="Ship to">
            <address className="text-sm not-italic leading-relaxed">
              {a.name}
              <br />
              {a.line1}
              {a.line2 && (
                <>
                  <br />
                  {a.line2}
                </>
              )}
              <br />
              {a.city}, {a.state} {a.pincode}
              <br />
              {a.phone}
            </address>
          </Card>
          <Card title="Payment">
            <p className="text-sm">
              {PAYMENT_METHOD_LABEL[o.paymentMethod]} · <PaymentPill status={o.paymentStatus} />
            </p>
            {payment && (
              <p className="mt-2 break-all font-mono text-[0.6875rem] text-mist">
                Razorpay order {payment.providerOrderId}
                {payment.providerPaymentId && <> · payment {payment.providerPaymentId}</>}
              </p>
            )}
            {o.paymentStatus === "refund_pending" && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-red-300">Issue the refund from the Razorpay dashboard, then mark it completed here.</p>
                <MarkRefundedButton orderId={o.id} />
              </div>
            )}
          </Card>
          {cancellable && (
            <Card title="Cancel order">
              <CancelForm orderId={o.id} />
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
