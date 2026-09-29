"use client";

import dynamic from "next/dynamic";
import { Toaster } from "@/components/ui/Toaster";

// Overlays are client-only and code-split out of the initial bundle.
const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer").then((m) => m.CartDrawer), { ssr: false });
const SearchOverlay = dynamic(() => import("@/components/search/SearchOverlay").then((m) => m.SearchOverlay), { ssr: false });
const MobileMenu = dynamic(() => import("./MobileMenu").then((m) => m.MobileMenu), { ssr: false });
const SizeGuideModal = dynamic(() => import("@/components/product/SizeGuide").then((m) => m.SizeGuideModal), { ssr: false });

export function Overlays() {
  return (
    <>
      <CartDrawer />
      <SearchOverlay />
      <MobileMenu />
      <SizeGuideModal />
      <Toaster />
    </>
  );
}
