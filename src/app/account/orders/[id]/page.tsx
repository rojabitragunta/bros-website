import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { OrderActions } from "@/components/orders/OrderActions";
import { Badge } from "@/components/ui/Badge";
import { requireUser } from "@/lib/auth/session";
import { ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL, TRACK_STEPS, trackStepIndex } from "@/lib/order-display";
import { razorpayEnabled, razorpayKeyId } from "@/lib/payments/razorpay";
import { getUserOrder } from "@/lib/services/account";
import { releaseExpiredReservations } from "@/lib/services/orders";
import { pageMetadata } from "@/lib/seo";
import { cn, formatPrice } from "@/lib/utils";

export const metadata = pageMetadata({ title: "Order", path: "/account", noIndex: true });

const dateTime = (d: Date) => d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ placed?: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/account/orders/${id}`);
  await releaseExpiredReservations();
  const data = await getUserOrder(user.id, id);
  if (!data) notFound();
  const { row: o, items, events, payment } = data;
  const justPlaced = (await searchParams).placed === "1";
  const step = trackStepIndex(o.status);
  const a = o.shippingAddress;
  const canPay = o.status === "pending_payment" && payment && razorpayEnabled();

  return (
    <div className="bg-ink text-bone">
      <div className="container-x pb-24 pt-8 md:pt-12">
        <Link href="/account" className="label mb-8 inline-flex min-h-11 items-center gap-2 text-mist hover:text-bone">
          <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden /> All orders
        </Link>

        {justPlaced && o.status !== "pending_payment" && o.status !== "cancelled" && (
          <div role="status" className="mb-10 border border-emerald-400/30 bg-emerald-400/10 p-5">
            <p className="label text-emerald-200">Thank you — your order is confirmed.</p>
            <p className="mt-1 text-sm text-mist">
              {o.paymentMethod === "cod" ? `Please keep ${formatPrice(o.total)} ready to pay on delivery. ` : "Payment received. "}
              We&apos;ll email updates to {o.email}.
            </p>
          </div>
        )}
        {o.status === "pending_payment" && (
          <div role="alert" className="mb-10 border border-amber-300/40 bg-amber-300/10 p-5">
            <p className="label text-amber-200">Payment not completed</p>
            <p className="mt-1 text-sm text-mist">
              Your items are reserved until {o.reservationExpiresAt ? dateTime(o.reservationExpiresAt) : "shortly"}. Complete the payment to confirm the order, or it will be cancelled
              automatically.
            </p>
          </div>
        )}

        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-3 text-mist">Placed {dateTime(o.createdAt)}</p>
            <h1 className="display text-[clamp(3rem,10vw,6.5rem)]">#{o.number}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="light">{ORDER_STATUS_LABEL[o.status]}</Badge>
            <Badge tone="outline">{PAYMENT_STATUS_LABEL[o.paymentStatus]}</Badge>
          </div>
        </div>

        {/* Tracking */}
        {step >= 0 && (
          <ol className="mb-12 grid grid-cols-4 border border-line" aria-label="Order progress">
            {TRACK_STEPS.map((s, i) => {
              const done = i <= step;
              const at = [...events].reverse().find((e) => e.status === s)?.createdAt;
              return (
                <li key={s} className={cn("border-line p-3 sm:p-5", i > 0 && "border-l", done ? "bg-graphite" : "opacity-50")} aria-current={i === step ? "step" : undefined}>
                  <span className={cn("mb-3 grid size-6 place-items-center rounded-full border", done ? "border-bone bg-bone text-ink" : "border-line")}>
                    {done && <Check className="size-3.5" strokeWidth={2} aria-hidden />}
                  </span>
                  <p className="label text-[0.625rem] sm:text-xs">{ORDER_STATUS_LABEL[s]}</p>
                  {at && <p className="mt-1 hidden font-mono text-[0.625rem] text-mist sm:block">{dateTime(at)}</p>}
                </li>
              );
            })}
          </ol>
        )}

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-10 lg:col-span-7">
            <section aria-labelledby="items-title">
              <h2 id="items-title" className="label mb-4">
                Items
              </h2>
              <ul className="divide-y divide-line border border-line">
                {items.map((i) => (
                  <li key={i.id} className="flex items-center gap-4 p-4">
                    <span className="relative h-20 w-16 shrink-0 overflow-hidden bg-[#e4e2dd]">
                      {i.image && <Image src={i.image} alt="" fill sizes="64px" className="object-cover" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <Link href={`/products/${i.slug}`} className="block truncate text-sm hover:underline">
                        {i.name}
                      </Link>
                      <span className="mt-1 block font-mono text-[0.6875rem] uppercase text-mist">
                        {i.colourName} / {i.size} / Qty {i.quantity}
                      </span>
                    </span>
                    <span className="font-mono text-sm tabular-nums">{formatPrice(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="history-title">
              <h2 id="history-title" className="label mb-4">
                History
              </h2>
              <ol className="space-y-3 border-l border-line pl-5">
                {events.map((e) => (
                  <li key={e.id} className="text-sm">
                    <span className="font-mono text-[0.6875rem] text-mist">{dateTime(e.createdAt)}</span>
                    <p>
                      {ORDER_STATUS_LABEL[e.status]}
                      {e.note && <span className="text-mist"> — {e.note}</span>}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            <OrderActions
              orderId={o.id}
              number={o.number}
              canCancel={o.status === "placed" || o.status === "pending_payment"}
              pay={
                canPay
                  ? {
                      keyId: razorpayKeyId(),
                      razorpayOrderId: payment.providerOrderId,
                      amount: o.total * 100,
                      email: o.email,
                      name: a.name,
                      phone: a.phone,
                    }
                  : undefined
              }
            />
          </div>

          <aside className="space-y-6 lg:col-span-5">
            <div className="border border-line bg-graphite p-5 sm:p-7">
              <h2 className="label mb-5">Summary</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-mist">Subtotal</dt>
                  <dd className="font-mono tabular-nums">{formatPrice(o.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-mist">Shipping</dt>
                  <dd className="font-mono uppercase">{o.shipping ? formatPrice(o.shipping) : "Free"}</dd>
                </div>
                <div className="flex justify-between text-xs">
                  <dt className="text-steel">GST included</dt>
                  <dd className="font-mono tabular-nums text-steel">{formatPrice(o.taxIncluded)}</dd>
                </div>
                <div className="flex justify-between border-t border-line pt-4 text-base">
                  <dt>Total</dt>
                  <dd className="font-mono tabular-nums">{formatPrice(o.total)}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-mist">{PAYMENT_METHOD_LABEL[o.paymentMethod]}</p>
            </div>
            <div className="border border-line p-5 sm:p-7">
              <h2 className="label mb-4">Delivery address</h2>
              <address className="text-sm not-italic leading-relaxed text-bone/80">
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
              {(o.courier || o.trackingNumber) && (
                <p className="mt-5 border-t border-line pt-4 text-sm">
                  <span className="text-mist">Shipment:</span> {o.courier} {o.trackingNumber && <span className="font-mono">{o.trackingNumber}</span>}
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
