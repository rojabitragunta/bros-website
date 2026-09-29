"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Overlay = "cart" | "search" | "menu" | "size-guide" | null;

export interface Toast {
  id: number;
  title: string;
  description?: string;
  image?: string;
  action?: { label: string; href?: string; overlay?: Overlay };
}

interface UIState {
  overlay: Overlay;
  open: (o: Exclude<Overlay, null>) => void;
  close: () => void;
  toasts: Toast[];
  toast: (t: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
  /** Flips true once persisted stores have rehydrated on the client. */
  hydrated: boolean;
  setHydrated: () => void;
}

let toastId = 0;

export const useUI = create<UIState>()((set) => ({
  overlay: null,
  open: (overlay) => set({ overlay }),
  close: () => set({ overlay: null }),
  toasts: [],
  toast: (t) => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { ...t, id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 4200);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
  hydrated: false,
  setHydrated: () => set({ hydrated: true }),
}));

interface SearchHistoryState {
  recent: string[];
  push: (q: string) => void;
  clear: () => void;
}

export const useSearchHistory = create<SearchHistoryState>()(
  persist(
    (set) => ({
      recent: [],
      push: (q) => {
        const term = q.trim();
        if (term.length < 2) return;
        set((s) => ({ recent: [term, ...s.recent.filter((r) => r.toLowerCase() !== term.toLowerCase())].slice(0, 5) }));
      },
      clear: () => set({ recent: [] }),
    }),
    { name: "bros-recent-searches", storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);
