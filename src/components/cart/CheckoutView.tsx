"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Lock, Wallet } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { priceCart } from "@/app/actions/cart";
import { placeOrderAction, verifyPaymentAction } from "@/app/actions/checkout";
import { computeTotals } from "@/lib/pricing";
import { openRazorpay } from "@/lib/razorpay-client";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import type { Address } from "@/types";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, FormError } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Skeleton";
import { OrderSummary } from "./BagView";

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`step-${n}`} className="border-t border-line py-8">
      <h2 id={`step-${n}`} className="mb-6 flex items-baseline gap-4">
        <span className="font-mono text-xs text-steel">{n}</span>
        <span className="label">{title}</span>
      </h2>
      {children}
    </section>
  );
}

const EMPTY_ADDRESS = { name: "", line1: "", line2: "", city: "", state: "", pincode: "", phone: "" };

export function CheckoutView({
  user,
  addresses,
  onlinePayments,
}: {
  user: { email: string; name: string; phone: string };
  addresses: Address[];
  onlinePayments: boolean;
}) {
  const router = useRouter();
  const hydrated = useUI((s) => s.hydrated);
  const items = useCart((s) => s.items);
  const { replace, clear } = useCart.getState();
  const [addressId, setAddressId] = useState<string>(addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? "new");
  const [draft, setDraft] = useState({ ...EMPTY_ADDRESS, name: user.name, phone: user.phone });
  const [saveAddress, setSaveAddress] = useState(true);
  const [pay, setPay] = useState<"cod" | "razorpay">(onlinePayments ? "razorpay" : "cod");
  const [error, setError] = useState<string>();
  const [fields, setFields] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  // One key per checkout visit: retries and double-clicks return the same order.
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const totals = useMemo(() => computeTotals(items), [items]);

  if (!hydrated) {
    return (
      <div className="container-x grid gap-10 py-16 lg:grid-cols-12" role="status" aria-label="Loading checkout">
        <div className="space-y-4 lg:col-span-7">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
        <Skeleton className="h-96 lg:col-span-5" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="container-x py-24">
        <EmptyState title="Nothing to check out." body="Your bag is empty." action={{ label: "Explore Drop 001", href: "/shop?collection=drop-001" }} />
      </div>
    );
  }

  const address = addressId === "new" ? draft : (addresses.find((a) => a.id === addressId) ?? draft);
  const set = (k: keyof typeof draft) => (e: React.ChangeEvent<HTMLInputElement>) => setDraft((d) => ({ ...d, [k]: e.target.value }));
  const fe = (k: string) => fields[`address.${k}`];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    setFields({});
    start(async () => {
      const lines = items.map(({ productId, colour, size, quantity }) => ({ productId, colour, size, quantity }));
      const { name, line1, line2, city, state, pincode, phone } = address;
      const res = await placeOrderAction({
        idempotencyKey,
        items: lines,
        address: { name, line1, line2, city, state, pincode, phone },
        saveAddress: addressId === "new" && saveAddress,
        paymentMethod: pay,
        expectedTotal: totals.total,
      });
      if (!res.ok) {
        if (res.code === "auth") return router.push("/login?next=/checkout");
        setError(res.error);
        setFields(res.fields ?? {});
        // Refresh prices/stock so the customer sees what changed.
        if (res.code === "price_changed" || res.code === "insufficient" || res.code === "unavailable") replace(await priceCart(lines));
        return;
      }
      clear();
      if (res.paymentMethod === "razorpay" && res.razorpay) {
        try {
          const r = await openRazorpay({
            keyId: res.razorpay.keyId,
            orderId: res.razorpay.orderId,
            amount: res.razorpay.amount,
            description: `Order #${res.number}`,
            prefill: { name, email: user.email, contact: phone },
          });
          if (r) await verifyPaymentAction({ orderId: res.orderId, razorpayOrderId: r.razorpay_order_id, paymentId: r.razorpay_payment_id, signature: r.razorpay_signature });
        } catch {
          // Fall through: the order page shows the payment state and a retry button.
        }
      }
      router.push(`/account/orders/${res.orderId}?placed=1`);
    });
  };

  return (
    <div className="container-x pb-24 pt-8 md:pt-12">
      <Link href="/bag" className="label mb-8 inline-flex min-h-11 items-center gap-2 text-mist hover:text-bone">
        <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden /> Back to bag
      </Link>

      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <form className="lg:col-span-7" onSubmit={submit} noValidate>
          <h1 className="display mb-8 text-[clamp(3rem,10vw,6.5rem)]">Checkout</h1>
          <Step n="01" title="Contact">
            <p className="text-sm">
              {user.email}
              <span className="ml-3 text-xs text-mist">Order updates are sent here.</span>
            </p>
          </Step>

          <Step n="02" title="Delivery">
            {addresses.length > 0 && (
              <div className="mb-4 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Saved addresses">
                {addresses.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    role="radio"
                    aria-checked={addressId === a.id}
                    onClick={() => setAddressId(a.id)}
                    className={cn("border p-4 text-left text-sm transition-colors", addressId === a.id ? "border-bone" : "border-line hover:border-bone/40")}
                  >
                    <span className="label block text-xs">{a.label}</span>
                    <span className="mt-2 block text-bone/80">
                      {a.name}, {a.line1}, {a.city} {a.pincode}
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  role="radio"
                  aria-checked={addressId === "new"}
                  onClick={() => setAddressId("new")}
                  className={cn("label border border-dashed p-4 text-left text-xs transition-colors", addressId === "new" ? "border-bone" : "border-line hover:border-bone/40")}
                >
                  + New address
                </button>
              </div>
            )}
            {addressId === "new" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Full name" value={draft.name} onChange={set("name")} autoComplete="name" className="sm:col-span-2" error={fe("name")} />
                <Field label="Address" value={draft.line1} onChange={set("line1")} autoComplete="address-line1" className="sm:col-span-2" error={fe("line1")} />
                <Field label="Apartment, landmark (optional)" value={draft.line2} onChange={set("line2")} autoComplete="address-line2" className="sm:col-span-2" />
                <Field label="City" value={draft.city} onChange={set("city")} autoComplete="address-level2" error={fe("city")} />
                <Field label="PIN code" value={draft.pincode} onChange={set("pincode")} inputMode="numeric" autoComplete="postal-code" maxLength={6} error={fe("pincode")} />
                <Field label="State" value={draft.state} onChange={set("state")} autoComplete="address-level1" error={fe("state")} />
                <Field label="Mobile (+91)" value={draft.phone} onChange={set("phone")} type="tel" inputMode="tel" autoComplete="tel" error={fe("phone")} />
                <label className="flex items-center gap-3 text-sm sm:col-span-2">
                  <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="size-4 accent-[#e3ddd1]" />
                  Save to my address book
                </label>
              </div>
            )}
          </Step>

          <Step n="03" title="Payment">
            <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Payment method">
              <button
                type="button"
                role="radio"
                aria-checked={pay === "razorpay"}
                disabled={!onlinePayments}
                onClick={() => setPay("razorpay")}
                className={cn(
                  "flex min-h-16 items-center gap-3 border px-4 py-3 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                  pay === "razorpay" ? "border-bone" : "border-line hover:border-bone/40",
                )}
              >
                <CreditCard className="size-4 shrink-0 text-mist" strokeWidth={1.5} aria-hidden />
                <span>
                  UPI, cards &amp; netbanking
                  <span className="block text-xs text-mist">{onlinePayments ? "Secured by Razorpay" : "Coming soon"}</span>
                </span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={pay === "cod"}
                onClick={() => setPay("cod")}
                className={cn("flex min-h-16 items-center gap-3 border px-4 py-3 text-left text-sm transition-colors", pay === "cod" ? "border-bone" : "border-line hover:border-bone/40")}
              >
                <Wallet className="size-4 shrink-0 text-mist" strokeWidth={1.5} aria-hidden />
                <span>
                  Cash on Delivery
                  <span className="block text-xs text-mist">Pay when your order arrives</span>
                </span>
              </button>
            </div>
          </Step>

          <div className="grid gap-3">
            <FormError>{error}</FormError>
            <Button type="submit" size="lg" full disabled={pending} icon={<Lock className="size-4" strokeWidth={1.5} />}>
              {pending ? "Placing order…" : pay === "cod" ? `Place order — ${formatPrice(totals.total)}` : `Pay ${formatPrice(totals.total)}`}
            </Button>
            <p className="text-center text-xs text-steel">
              By placing your order you agree to our{" "}
              <Link href="/info/terms" className="underline underline-offset-4">
                terms
              </Link>{" "}
              and{" "}
              <Link href="/info/refunds" className="underline underline-offset-4">
                refund policy
              </Link>
              .
            </p>
          </div>
        </form>

        <aside className="lg:col-span-5" aria-label="Order">
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)]">
            <ul className="mb-4 divide-y divide-line border border-line">
              {items.map((i) => (
                <li key={i.key} className="flex items-center gap-4 p-4">
                  <span className="relative h-20 w-16 shrink-0 overflow-hidden bg-[#e4e2dd]">
                    {i.image && <Image src={i.image} alt="" fill sizes="64px" className="object-cover" />}
                    <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-ink font-mono text-[0.625rem] text-bone">{i.quantity}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{i.name}</span>
                    <span className="mt-1 block font-mono text-[0.6875rem] uppercase text-mist">
                      {i.colourName} / {i.size}
                    </span>
                  </span>
                  <span className="font-mono text-sm tabular-nums">{formatPrice(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <OrderSummary />
          </div>
        </aside>
      </div>
    </div>
  );
}
