"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import { ProductCard } from "./ProductCard";

/**
 * Responsive product grid with animated filtering.
 * `insert` renders an editorial tile (spanning two columns on tablet+) at `insertAt`.
 */
export function ProductGrid({
  products,
  className,
  insert,
  insertAt = 4,
  columns = "default",
}: {
  products: Product[];
  className?: string;
  insert?: ReactNode;
  insertAt?: number;
  columns?: "default" | "three";
}) {
  const items: ({ type: "product"; product: Product } | { type: "insert" })[] = products.map((product) => ({ type: "product", product }));
  if (insert && products.length > insertAt) items.splice(insertAt, 0, { type: "insert" });

  return (
    <motion.ul
      layout
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-4 md:grid-cols-3 md:gap-x-5 md:gap-y-14",
        columns === "default" && "xl:grid-cols-4",
        className,
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {items.map((item, i) =>
          item.type === "insert" ? (
            <motion.li
              key="__insert"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-2 row-span-1"
            >
              {insert}
            </motion.li>
          ) : (
            <motion.li
              key={item.product.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProductCard product={item.product} preload={i < 4} />
            </motion.li>
          ),
        )}
      </AnimatePresence>
    </motion.ul>
  );
}
