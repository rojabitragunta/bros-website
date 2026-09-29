"use client";

import { usePathname } from "next/navigation";

/** Renders storefront chrome everywhere except the admin area. */
export function StoreOnly({ children }: { children: React.ReactNode }) {
  return usePathname()?.startsWith("/admin") ? null : children;
}
