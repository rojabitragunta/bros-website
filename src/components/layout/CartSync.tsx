"use client";

import { useEffect, useRef } from "react";
import { priceCart, saveCart, syncCart } from "@/app/actions/cart";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";

const toLines = (items: ReturnType<typeof useCart.getState>["items"]) =>
  items.map(({ productId, colour, size, quantity }) => ({ productId, colour, size, quantity }));

/**
 * After the local cart rehydrates: merge it with the signed-in user's server
 * cart (or just re-price it for guests), then keep the server copy updated.
 */
export function CartSync() {
  const hydrated = useUI((s) => s.hydrated);
  const signedIn = useRef(false);
  const ready = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    const { items, replace } = useCart.getState();
    const lines = toLines(items);
    (async () => {
      try {
        const merged = await syncCart(lines);
        signedIn.current = merged !== null;
        const next = merged ?? (lines.length ? await priceCart(lines) : []);
        if (next.length < items.length) {
          useUI.getState().toast({ title: "Bag updated", description: "Some items sold out or are no longer available and were removed." });
        }
        replace(next);
      } catch {
        // Offline or server error: keep the local cart; checkout re-validates anyway.
      } finally {
        ready.current = true;
      }
    })();
  }, [hydrated]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsub = useCart.subscribe((s, prev) => {
      if (!ready.current || !signedIn.current || s.items === prev.items) return;
      clearTimeout(timer);
      timer = setTimeout(() => saveCart(toLines(s.items)).catch(() => {}), 800);
    });
    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, []);

  return null;
}
