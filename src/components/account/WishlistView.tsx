"use client";

import { AnimatePresence, motion } from "motion/react";
import { catalog } from "@/lib/services/catalog";
import { useUI } from "@/store/ui";
import { useWishlist } from "@/store/wishlist";
import type { Product } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { ProductCard } from "@/components/product/ProductCard";

export function WishlistGrid({ compact }: { compact?: boolean }) {
  const hydrated = useUI((s) => s.hydrated);
  const items = useWishlist((s) => s.items);
  const products = items.map((i) => catalog.byId(i.productId)).filter((p): p is Product => Boolean(p));

  if (!hydrated) return <ProductGridSkeleton count={4} />;
  if (!products.length)
    return (
      <EmptyState
        className="border border-line py-20 md:py-28"
        title="Save what moves you."
        body="Tap the heart on any product to keep it here."
        action={{ label: "Explore Drop 001", href: "/shop?collection=drop-001" }}
      />
    );

  return (
    <ul className={compact ? "grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3" : "grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4"}>
      <AnimatePresence initial={false} mode="popLayout">
        {products.map((p) => (
          <motion.li key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.35 }}>
            <ProductCard product={p} />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

export function WishlistView() {
  const count = useWishlist((s) => s.items.length);
  const hydrated = useUI((s) => s.hydrated);
  return (
    <div className="container-x pb-24 pt-10 md:pt-16">
      <div className="mb-10 flex items-end justify-between gap-4 md:mb-14">
        <div>
          <p className="eyebrow mb-4 text-mist">Saved locally on this device</p>
          <h1 className="display text-[clamp(3.5rem,13vw,9rem)]">Wishlist</h1>
        </div>
        {hydrated && count > 0 && <p className="mb-2 font-mono text-sm text-mist">{count} saved</p>}
      </div>
      <WishlistGrid />
    </div>
  );
}
