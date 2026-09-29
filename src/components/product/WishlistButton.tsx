"use client";

import { motion, AnimatePresence } from "motion/react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUI } from "@/store/ui";
import { useWishlist } from "@/store/wishlist";
import type { Product } from "@/types";

export function WishlistButton({
  product,
  className,
  variant = "icon",
}: {
  product: Pick<Product, "id" | "name" | "images">;
  className?: string;
  variant?: "icon" | "full";
}) {
  const active = useWishlist((s) => s.items.some((i) => i.productId === product.id));
  const toggle = useWishlist((s) => s.toggle);
  const toast = useUI((s) => s.toast);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggle(product.id);
    toast({
      title: added ? "Saved to wishlist" : "Removed from wishlist",
      description: product.name,
      image: product.images[0]?.src,
      action: added ? { label: "View wishlist", href: "/wishlist" } : undefined,
    });
  };

  const heart = (
    <span className="relative grid place-items-center">
      <motion.span
        key={String(active)}
        initial={{ scale: active ? 0.6 : 1 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
        className="grid place-items-center"
      >
        <Heart className={cn("size-[1.125rem] transition-colors", active && "fill-current")} strokeWidth={1.5} aria-hidden />
      </motion.span>
      <AnimatePresence>
        {active && (
          <motion.span
            aria-hidden
            initial={{ scale: 0.4, opacity: 0.6 }}
            animate={{ scale: 2.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute size-4 rounded-full border border-current"
          />
        )}
      </AnimatePresence>
    </span>
  );

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={cn(
          "label flex h-14 items-center justify-center gap-3 border border-bone/25 px-5 transition-colors hover:border-bone",
          className,
        )}
      >
        {heart}
        <span>{active ? "Saved" : "Wishlist"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
      className={cn("grid size-11 place-items-center transition-colors", className)}
    >
      {heart}
    </button>
  );
}
