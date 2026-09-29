"use client";

import { useCallback } from "react";
import { colourMap } from "@/data/colours";
import { findVariant } from "@/lib/catalog-utils";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import type { ColourId, Product, SizeCode } from "@/types";

/** Adds a line to the bag and opens the cart drawer. Returns false if the variant is unavailable. */
export function useAddToBag() {
  const add = useCart((s) => s.add);
  const open = useUI((s) => s.open);
  const toast = useUI((s) => s.toast);
  return useCallback(
    (product: Product, colour: ColourId, size: SizeCode, quantity = 1, { openCart = true } = {}) => {
      const variant = findVariant(product, colour, size);
      if (!variant || variant.available <= 0) {
        toast({ title: "Out of stock", description: `${product.name} in ${colourMap[colour]?.name ?? colour}, size ${size} is sold out.` });
        return false;
      }
      const images = product.colours.find((c) => c.colour === colour)?.images ?? product.images;
      add(
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          colour,
          colourName: colourMap[colour]?.name ?? colour,
          size,
          image: (images.find((i) => i.view === "front") ?? images[0])?.src ?? "",
          max: variant.available,
        },
        quantity,
      );
      if (openCart) open("cart");
      return true;
    },
    [add, open, toast],
  );
}
