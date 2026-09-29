"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { colourMap } from "@/data/colours";
import { useAddToBag } from "@/hooks/use-add-to-bag";
import { PLACEHOLDER_IMAGE, soldOutSizesFor } from "@/lib/catalog-utils";
import { cn, formatPrice } from "@/lib/utils";
import type { ColourId, Product } from "@/types";
import { ProductBadgeLabel } from "@/components/ui/Badge";
import { WishlistButton } from "./WishlistButton";

interface ProductCardProps {
  product: Product;
  /** Preload the image (first row above the fold). */
  preload?: boolean;
  sizes?: string;
  className?: string;
  /** Larger typography for editorial placements. */
  size?: "default" | "large";
  aspect?: string;
}

export function ProductCard({
  product,
  preload,
  sizes = "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw",
  className,
  size = "default",
  aspect = "aspect-[4/5]",
}: ProductCardProps) {
  const [colour, setColour] = useState<ColourId>(product.colours[0]?.colour ?? "onyx");
  const [quickOpen, setQuickOpen] = useState(false);
  const addToBag = useAddToBag();

  const images = (product.colours.find((c) => c.colour === colour) ?? product.colours[0])?.images ?? [];
  const primary = images.find((i) => i.view === "front") ?? images[0] ?? { src: PLACEHOLDER_IMAGE, alt: `${product.name} — photo coming soon` };
  const secondary = images.find((i) => i.view === "model") ?? images[1];
  const href = `/products/${product.slug}${colour !== product.colours[0].colour ? `?colour=${colour}` : ""}`;
  const badge = product.badges[0];
  const soldOut = soldOutSizesFor(product, colour);
  const allOut = soldOut.length === product.sizes.length;
  const lowStock = !allOut && product.variants.some((v) => v.colour === colour && v.status === "low_stock");

  return (
    <article className={cn("group/card relative", className)}>
      <div className={cn("relative overflow-hidden bg-[#e4e2dd]", aspect)}>
        <Link href={href} className="absolute inset-0 block" aria-label={`${product.name}, ${colourMap[colour].name}, ${formatPrice(product.price)}`}>
          <Image
            src={primary.src}
            alt={primary.alt}
            fill
            sizes={sizes}
            preload={preload}
            className="object-cover transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-[1.04] motion-reduce:transform-none"
          />
          {secondary && (
            <Image
              src={secondary.src}
              alt=""
              aria-hidden
              fill
              sizes={sizes}
              className="object-cover opacity-0 transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-[1.04] group-hover/card:opacity-100 motion-reduce:transform-none"
            />
          )}
        </Link>

        {badge && <ProductBadgeLabel badge={badge} className="pointer-events-none absolute left-3 top-3" />}

        <WishlistButton product={product} className="absolute right-1 top-1 text-ink hover:text-black" />

        {/* Quick add — hover reveal on pointer devices, toggle on touch */}
        <div
          className={cn(
            "absolute inset-x-2 bottom-2 hidden translate-y-3 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)]:block",
            "group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-within/card:translate-y-0 group-focus-within/card:opacity-100",
          )}
        >
          <QuickSizes product={product} soldOut={soldOut} onPick={(size) => addToBag(product, colour, size)} />
        </div>

        <button
          type="button"
          onClick={() => setQuickOpen((v) => !v)}
          aria-expanded={quickOpen}
          aria-label={quickOpen ? "Close quick add" : `Quick add ${product.name}`}
          className="absolute bottom-2 right-2 grid size-10 place-items-center bg-bone/95 text-ink shadow-sm [@media(hover:hover)]:hidden"
        >
          {quickOpen ? <X className="size-4" strokeWidth={1.5} /> : <Plus className="size-4" strokeWidth={1.5} />}
        </button>
        <AnimatePresence>
          {quickOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-x-2 bottom-14 [@media(hover:hover)]:hidden"
            >
              <QuickSizes
                product={product}
                soldOut={soldOut}
                compact
                onPick={(size) => {
                  addToBag(product, colour, size);
                  setQuickOpen(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={cn("pt-3", size === "large" && "pt-5")}>
        <div className="flex items-start justify-between gap-3">
          <h3 className={cn("font-medium leading-snug", size === "large" ? "text-base sm:text-lg" : "text-[0.8125rem] sm:text-sm")}>
            <Link href={href} className="hover:underline hover:underline-offset-4">
              {product.name.replace(/^BRO'S /, "")}
            </Link>
          </h3>
          <p className={cn("shrink-0 font-mono tabular-nums", size === "large" ? "text-sm sm:text-base" : "text-xs sm:text-[0.8125rem]")}>
            {formatPrice(product.price)}
          </p>
        </div>
        <p className="mt-1 text-xs opacity-60">{colourMap[colour]?.name ?? colour}</p>
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1" role="radiogroup" aria-label={`Colour for ${product.name}`}>
            {product.colours.map((c) => (
              <button
                key={c.colour}
                type="button"
                role="radio"
                aria-checked={c.colour === colour}
                aria-label={colourMap[c.colour].name}
                onClick={() => setColour(c.colour)}
                className="group/sw grid size-6 place-items-center"
              >
                <span
                  className={cn(
                    "size-3 rounded-full ring-1 ring-current/25 ring-offset-2 ring-offset-transparent transition-shadow",
                    c.colour === colour && "ring-current",
                  )}
                  style={{ backgroundColor: colourMap[c.colour].hex }}
                />
              </button>
            ))}
          </div>
          <p className={cn("font-mono text-[0.625rem] uppercase tracking-wider", allOut || lowStock ? "opacity-80" : "hidden opacity-50 sm:block")}>
            {allOut ? "Sold out" : lowStock ? "Low stock" : `${product.sizes[0]}–${product.sizes[product.sizes.length - 1]}`}
          </p>
        </div>
      </div>
    </article>
  );
}

function QuickSizes({ product, soldOut: out, onPick, compact }: { product: Product; soldOut: Product["sizes"]; onPick: (s: Product["sizes"][number]) => void; compact?: boolean }) {
  return (
    <div className="bg-bone/95 p-2 text-ink backdrop-blur" role="group" aria-label={`Quick add ${product.name} — choose size`}>
      {!compact && <p className="eyebrow mb-2 px-1 text-[0.5625rem] text-ink/60">Quick add</p>}
      <div className="grid grid-cols-5 gap-1">
        {product.sizes.map((s) => {
          const soldOut = out.includes(s);
          return (
            <button
              key={s}
              type="button"
              disabled={soldOut}
              onClick={(e) => {
                e.preventDefault();
                onPick(s);
              }}
              aria-label={soldOut ? `${s}, sold out` : `Add size ${s} to bag`}
              className="h-9 font-mono text-[0.6875rem] transition-colors hover:bg-ink hover:text-bone disabled:text-ink/30 disabled:line-through disabled:hover:bg-transparent"
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}
