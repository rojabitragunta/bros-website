"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/types";

/**
 * Cart — local state persisted to localStorage (Phase 1).
 * Phase 2: sync with the cart API; keep this store as the optimistic layer.
 */
interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, "key" | "quantity">, quantity?: number) => void;
  remove: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
}

export const MAX_QTY = 10;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, quantity = 1) =>
        set((s) => {
          const key = `${item.productId}:${item.colour}:${item.size}`;
          const existing = s.items.find((i) => i.key === key);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.key === key ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + quantity) } : i,
              ),
            };
          }
          return { items: [{ ...item, key, quantity }, ...s.items] };
        }),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      setQuantity: (key, quantity) =>
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((i) => i.key !== key)
              : s.items.map((i) => (i.key === key ? { ...i, quantity: Math.min(MAX_QTY, quantity) } : i)),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "bros-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);

export const selectCount = (s: CartState) => s.items.reduce((n, i) => n + i.quantity, 0);
export const selectSubtotal = (s: CartState) => s.items.reduce((n, i) => n + i.quantity * i.price, 0);
