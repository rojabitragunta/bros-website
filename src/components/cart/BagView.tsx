"use client";

import { AnimatePresence } from "motion/react";
import { ArrowRight, Lock, RotateCcw, Truck } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { catalog } from "@/lib/services/catalog";
import { selectCount, selectSubtotal, useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProductCard } from "@/components/product/ProductCard";
import { CartLine } from "./CartLine";

export function OrderSummary({ cta }: { cta?: React.ReactNode }) {
  const subtotal = useCart(selectSubtotal);
  const count = useCart(selectCount);
  return (
    <div className="border border-line bg-graphite p-5 sm:p-7">
      <h2 className="label mb-6">Order summary</h2>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-mist">
            Subtotal ({count} {count === 1 ? "item" : "items"})
          </dt>
          <dd className="font-mono tabular-nums">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-mist">Shipping</dt>
          <dd className="font-mono uppercase">Free</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-4 text-base">
          <dt>Total</dt>
          <dd className="font-mono tabular-nums">{formatPrice(subtotal)}</dd>
        </div>
      </dl>
      <p className="mt-2 text-[0.6875rem] text-steel">Inclusive of GST.</p>
      {cta && <div className="mt-6">{cta}</div>}
      <ul className="mt-6 space-y-3 border-t border-line pt-5 text-xs text-mist">
        <li className="flex items-center gap-3">
          <Truck className="size-4" strokeWidth={1.5} aria-hidden /> Free shipping across India
        </li>
        <li className="flex items-center gap-3">
          <RotateCcw className="size-4" strokeWidth={1.5} aria-hidden /> 7-day easy returns
        </li>
        <li className="flex items-center gap-3">
          <Lock className="size-4" strokeWidth={1.5} aria-hidden /> Secure checkout — coming in Phase 2
        </li>
      </ul>
    </div>
  );
}

export function BagView() {
  const hydrated = useUI((s) => s.hydrated);
  const items = useCart((s) => s.items);
  const count = useCart(selectCount);
  const suggestions = catalog
    .all()
    .filter((p) => !items.some((i) => i.productId === p.id))
    .slice(0, 4);

  return (
    <div className="container-x pb-24 pt-10 md:pt-16">
      <div className="mb-10 flex items-end justify-between gap-4 md:mb-14">
        <h1 className="display text-[clamp(3.5rem,13vw,9rem)]">Your Bag</h1>
        {hydrated && items.length > 0 && <p className="mb-2 font-mono text-sm text-mist">{count} items</p>}
      </div>

      {!hydrated ? (
        <div className="grid gap-10 lg:grid-cols-12" role="status" aria-label="Loading bag">
          <div className="space-y-4 lg:col-span-8">
            {[0, 1].map((i) => (
              <div key={i} className="flex gap-4 border-b border-line py-6">
                <Skeleton className="h-40 w-32" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-80 lg:col-span-4" />
        </div>
      ) : items.length === 0 ? (
        <>
          <EmptyState className="border border-line py-20 md:py-28" title="Your bag is waiting." body="Nothing here yet." action={{ label: "Explore Drop 001", href: "/shop?collection=drop-001" }} />
          <section aria-labelledby="bag-suggest" className="mt-20">
            <h2 id="bag-suggest" className="eyebrow mb-6 text-mist">
              Start with the essentials
            </h2>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-5">
              {suggestions.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <ul className="border-t border-line lg:col-span-8">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <CartLine key={item.key} item={item} size="lg" />
              ))}
            </AnimatePresence>
          </ul>
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)]">
              <OrderSummary
                cta={
                  <ButtonLink href="/checkout" size="lg" full icon={<ArrowRight className="size-4" strokeWidth={1.5} />}>
                    Checkout
                  </ButtonLink>
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
