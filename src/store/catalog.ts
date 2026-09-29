"use client";

import { useEffect } from "react";
import { create } from "zustand";
import type { Product } from "@/types";

/**
 * Client-side copy of the active catalogue (search overlay, wishlist, bag
 * suggestions, lookbook). Fetched once per page load from /api/products.
 */
interface CatalogState {
  products: Product[];
  loaded: boolean;
}

export const useCatalogStore = create<CatalogState>()(() => ({ products: [], loaded: false }));

let inflight: Promise<void> | null = null;

export function loadCatalog() {
  inflight ??= fetch("/api/products")
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
    .then((products: Product[]) => useCatalogStore.setState({ products, loaded: true }))
    .catch(() => {
      inflight = null;
      useCatalogStore.setState({ loaded: true });
    });
  return inflight;
}

export function useCatalog() {
  const state = useCatalogStore();
  useEffect(() => {
    if (!state.loaded) loadCatalog();
  }, [state.loaded]);
  return state;
}
