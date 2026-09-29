"use client";

import { AnimatePresence } from "motion/react";
import { ArrowRight, Truck } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { selectCount, selectSubtotal, useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { CartLine } from "./CartLine";
import { EmptyState } from "@/components/ui/EmptyState";

export function CartDrawer() {
  const open = useUI((s) => s.overlay === "cart");
  const close = useUI((s) => s.close);
  const items = useCart((s) => s.items);
  const count = useCart(selectCount);
  const subtotal = useCart(selectSubtotal);

  return (
    <Drawer
      open={open}
      onClose={close}
      title={`Bag (${count})`}
      footer={
        items.length > 0 ? (
          <div className="space-y-4 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-6">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-mist">Subtotal</dt>
                <dd className="font-mono tabular-nums">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mist">Shipping</dt>
                <dd className="font-mono uppercase">Free</dd>
              </div>
            </dl>
            <p className="text-[0.6875rem] text-steel">Prices include GST. Checkout is a preview — no payment is taken.</p>
            <div className="grid grid-cols-2 gap-2">
              <ButtonLink href="/bag" variant="outline" size="lg" onClick={close}>
                View Bag
              </ButtonLink>
              <ButtonLink href="/checkout" size="lg" onClick={close} icon={<ArrowRight className="size-4" strokeWidth={1.5} />}>
                Checkout
              </ButtonLink>
            </div>
          </div>
        ) : undefined
      }
    >
      <div className="flex items-center gap-3 border-b border-line bg-graphite px-5 py-3 sm:px-6">
        <Truck className="size-4 text-mist" strokeWidth={1.5} aria-hidden />
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-bone/80">Free shipping across India</p>
      </div>
      {items.length === 0 ? (
        <EmptyState
          className="px-6 py-20"
          title="Your bag is waiting."
          body="Nothing here yet."
          action={{ label: "Explore Drop 001", href: "/shop?collection=drop-001", onClick: close }}
        />
      ) : (
        <ul className="px-5 sm:px-6">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <CartLine key={item.key} item={item} onNavigate={close} />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </Drawer>
  );
}
