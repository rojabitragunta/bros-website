"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, CreditCard, Smartphone, Wallet } from "lucide-react";
import { useId, useState } from "react";
import { cn, formatPrice } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { OrderSummary } from "./BagView";

function Field({ label, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const id = useId();
  return (
    <div className={cn("relative", className)}>
      <input
        id={id}
        placeholder=" "
        {...props}
        className="peer h-14 w-full border border-line bg-transparent px-4 pb-2 pt-6 text-sm text-bone transition-colors placeholder-transparent hover:border-bone/40 focus:border-bone focus:outline-none"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-2 text-[0.625rem] uppercase tracking-wider text-mist transition-all peer-placeholder-shown:top-[1.1rem] peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[0.625rem] peer-focus:uppercase peer-focus:tracking-wider"
      >
        {label}
      </label>
    </div>
  );
}

function Step({ n, title, children, muted }: { n: string; title: string; children: React.ReactNode; muted?: boolean }) {
  return (
    <section aria-labelledby={`step-${n}`} className={cn("border-t border-line py-8", muted && "opacity-90")}>
      <h2 id={`step-${n}`} className="mb-6 flex items-baseline gap-4">
        <span className="font-mono text-xs text-steel">{n}</span>
        <span className="label">{title}</span>
      </h2>
      {children}
    </section>
  );
}

const PAY = [
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "cod", label: "Cash on delivery", icon: Wallet },
];

export function CheckoutView() {
  const hydrated = useUI((s) => s.hydrated);
  const items = useCart((s) => s.items);
  const toast = useUI((s) => s.toast);
  const [pay, setPay] = useState("upi");

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

  return (
    <div className="container-x pb-24 pt-8 md:pt-12">
      <Link href="/bag" className="label mb-8 inline-flex min-h-11 items-center gap-2 text-mist hover:text-bone">
        <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden /> Back to bag
      </Link>

      <div role="note" className="mb-10 flex items-start gap-4 border border-bone/20 bg-graphite p-4 sm:p-5">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-bone" strokeWidth={1.5} aria-hidden />
        <div>
          <p className="label">Checkout preview</p>
          <p className="mt-1 text-sm text-mist">
            This is a frontend placeholder. No details are stored or sent, and no payment is taken. Payments and shipping arrive in Phase 2.
          </p>
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <form
          className="lg:col-span-7"
          onSubmit={(e) => {
            e.preventDefault();
            toast({ title: "Checkout isn't live yet", description: "Payments will be connected in the next phase." });
          }}
        >
          <h1 className="display mb-8 text-[clamp(3rem,10vw,6.5rem)]">Checkout</h1>
          <Step n="01" title="Contact">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Email" type="email" autoComplete="email" className="sm:col-span-2" />
              <Field label="Phone (+91)" type="tel" autoComplete="tel" inputMode="tel" className="sm:col-span-2" />
            </div>
          </Step>
          <Step n="02" title="Delivery">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="First name" autoComplete="given-name" />
              <Field label="Last name" autoComplete="family-name" />
              <Field label="Address" autoComplete="address-line1" className="sm:col-span-2" />
              <Field label="Apartment, suite (optional)" autoComplete="address-line2" className="sm:col-span-2" />
              <Field label="City" autoComplete="address-level2" />
              <Field label="PIN code" inputMode="numeric" autoComplete="postal-code" maxLength={6} />
              <Field label="State" autoComplete="address-level1" className="sm:col-span-2" />
            </div>
          </Step>
          <Step n="03" title="Payment" muted>
            <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Payment method">
              {PAY.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={pay === p.id}
                  onClick={() => setPay(p.id)}
                  className={cn("flex h-16 items-center gap-3 border px-4 text-left text-sm transition-colors", pay === p.id ? "border-bone" : "border-line hover:border-bone/40")}
                >
                  <p.icon className="size-4 text-mist" strokeWidth={1.5} aria-hidden />
                  {p.label}
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs text-steel">Payment gateway integration — not implemented in this phase.</p>
          </Step>
          <Button type="submit" size="lg" full className="mt-4">
            Place order — preview
          </Button>
        </form>

        <aside className="lg:col-span-5" aria-label="Order">
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)]">
            <ul className="mb-4 divide-y divide-line border border-line">
              {items.map((i) => (
                <li key={i.key} className="flex items-center gap-4 p-4">
                  <span className="relative h-20 w-16 shrink-0 overflow-hidden bg-[#e4e2dd]">
                    <Image src={i.image} alt="" fill sizes="64px" className="object-cover" />
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
