"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { MAX_QTY, useCart } from "@/store/cart";
import { cn, formatPrice } from "@/lib/utils";
import type { CartItem } from "@/types";
import { QuantityStepper } from "@/components/ui/QuantityStepper";

export function CartLine({ item, size = "sm", onNavigate }: { item: CartItem; size?: "sm" | "lg"; onNavigate?: () => void }) {
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const href = `/products/${item.slug}?colour=${item.colour}`;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, transition: { duration: 0.3 } }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn("flex gap-4 overflow-hidden border-b border-line", size === "lg" ? "py-6 sm:gap-6" : "py-5")}
    >
      <Link href={href} onClick={onNavigate} className={cn("relative shrink-0 overflow-hidden bg-[#e4e2dd]", size === "lg" ? "h-40 w-32 sm:h-48 sm:w-[154px]" : "h-32 w-[102px]")}>
        <Image src={item.image} alt={`${item.name} in ${item.colourName}`} fill sizes="160px" className="object-cover" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-medium leading-snug">
              <Link href={href} onClick={onNavigate} className="hover:underline hover:underline-offset-4">
                {item.name}
              </Link>
            </h3>
            <p className="mt-1.5 font-mono text-[0.6875rem] uppercase tracking-wider text-mist">
              {item.colourName} <span aria-hidden>/</span> <span className="sr-only">size</span> {item.size}
            </p>
          </div>
          <p className="shrink-0 font-mono text-sm tabular-nums">{formatPrice(item.price * item.quantity)}</p>
        </div>
        {item.quantity > 1 && <p className="mt-1 font-mono text-[0.6875rem] text-steel">{formatPrice(item.price)} each</p>}
        <div className="mt-auto flex items-center justify-between pt-4">
          <QuantityStepper value={item.quantity} max={MAX_QTY} onChange={(n) => setQuantity(item.key, n)} label={item.name} />
          <button
            type="button"
            onClick={() => remove(item.key)}
            className="min-h-10 text-xs text-mist underline underline-offset-4 transition-colors hover:text-bone"
          >
            Remove<span className="sr-only"> {item.name}</span>
          </button>
        </div>
      </div>
    </motion.li>
  );
}
