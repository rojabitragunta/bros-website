"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MAX_QTY } from "@/lib/catalog-utils";
import type { CartItem } from "@/types";

/**
 * Cart — local state persisted to localStorage (works for guests).
 * Signed-in customers are synced to the server cart by components/layout/CartSync.
 */
interface CartState {
  items: CartItem[];
  /** Replace all lines (server sync / validation). */
  replace: (items: CartItem[]) => void;
  add: (item: Omit<CartItem, "key" | "quantity">, quantity?: number) => void;
  remove: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
}

export { MAX_QTY };

const cap = (i: Pick<CartItem, "max">) => Math.min(MAX_QTY, i.max ?? MAX_QTY);

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      replace: (items) => set({ items }),
      add: (item, quantity = 1) =>
        set((s) => {
          const key = `${item.productId}:${item.colour}:${item.size}`;
          const existing = s.items.find((i) => i.key === key);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.key === key ? { ...i, max: item.max ?? i.max, quantity: Math.min(cap(item), i.quantity + quantity) } : i,
              ),
            };
          }
          return { items: [{ ...item, key, quantity: Math.min(cap(item), quantity) }, ...s.items] };
        }),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      setQuantity: (key, quantity) =>
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((i) => i.key !== key)
              : s.items.map((i) => (i.key === key ? { ...i, quantity: Math.min(cap(i), quantity) } : i)),
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
