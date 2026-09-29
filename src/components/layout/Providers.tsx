"use client";

import { MotionConfig } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useSearchHistory, useUI } from "@/store/ui";
import { CartSync } from "./CartSync";

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const close = useUI((s) => s.close);
  const setHydrated = useUI((s) => s.setHydrated);

  // Rehydrate persisted stores after mount to avoid SSR mismatches.
  useEffect(() => {
    Promise.all([
      useCart.persist.rehydrate(),
      useWishlist.persist.rehydrate(),
      useSearchHistory.persist.rehydrate(),
    ]).finally(setHydrated);
  }, [setHydrated]);

  // Close any overlay when navigating.
  useEffect(() => {
    close();
  }, [pathname, close]);

  return (
    <MotionConfig reducedMotion="user" transition={{ ease: [0.16, 1, 0.3, 1] }}>
      {children}
      <CartSync />
    </MotionConfig>
  );
}
