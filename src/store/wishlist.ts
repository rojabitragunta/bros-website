"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { WishlistItem } from "@/types";

interface WishlistState {
  items: WishlistItem[];
  toggle: (productId: string) => boolean;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (productId) => {
        const exists = get().items.some((i) => i.productId === productId);
        set((s) => ({
          items: exists
            ? s.items.filter((i) => i.productId !== productId)
            : [{ productId, addedAt: Date.now() }, ...s.items],
        }));
        return !exists;
      },
      remove: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      has: (productId) => get().items.some((i) => i.productId === productId),
    }),
    {
      name: "bros-wishlist",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
