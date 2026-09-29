"use client";

import { useCallback } from "react";
import { colourMap } from "@/data/colours";
import { productImagePath } from "@/lib/services/catalog";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import type { ColourId, Product, SizeCode } from "@/types";

/** Adds a line to the bag and opens the cart drawer. */
export function useAddToBag() {
  const add = useCart((s) => s.add);
  const open = useUI((s) => s.open);
  return useCallback(
    (product: Product, colour: ColourId, size: SizeCode, quantity = 1, { openCart = true } = {}) => {
      add(
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          colour,
          colourName: colourMap[colour].name,
          size,
          image: productImagePath(product.slug, colour, "front"),
        },
        quantity,
      );
      if (openCart) open("cart");
    },
    [add, open],
  );
}
