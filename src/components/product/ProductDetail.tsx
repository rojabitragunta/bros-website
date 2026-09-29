"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { Check, RotateCcw, Ruler, Truck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { colourMap } from "@/data/colours";
import { useAddToBag } from "@/hooks/use-add-to-bag";
import { cn, formatPrice } from "@/lib/utils";
import { useUI } from "@/store/ui";
import type { ColourId, Product, SizeCode } from "@/types";
import { ProductBadgeLabel } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Rating } from "@/components/ui/Rating";
import { ImageGallery } from "./ImageGallery";
import { WishlistButton } from "./WishlistButton";

export function ProductDetail({ product }: { product: Product }) {
  const [colour, setColour] = useState<ColourId>(product.colours[0].colour);
  const [size, setSize] = useState<SizeCode | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const addToBag = useAddToBag();
  const openOverlay = useUI((s) => s.open);
  const router = useRouter();
  const shake = useAnimationControls();
  const ctaRef = useRef<HTMLDivElement>(null);

  // Honour ?colour= from product cards without making the page dynamic.
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("colour") as ColourId | null;
    if (c && product.colours.some((v) => v.colour === c)) setColour(c);
  }, [product]);

  // Sticky mobile CTA appears once the main CTA scrolls out of view.
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const variant = product.colours.find((c) => c.colour === colour) ?? product.colours[0];

  const selectColour = (c: ColourId) => {
    setColour(c);
    const url = new URL(window.location.href);
    if (c === product.colours[0].colour) url.searchParams.delete("colour");
    else url.searchParams.set("colour", c);
    window.history.replaceState(null, "", url);
  };

  const requireSize = () => {
    if (size) return true;
    setSizeError(true);
    shake.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.4 } });
    document.getElementById("size-picker")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  };

  const onAdd = () => {
    if (!requireSize()) return;
    addToBag(product, colour, size!);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const onBuyNow = () => {
    if (!requireSize()) return;
    addToBag(product, colour, size!, 1, { openCart: false });
    router.push("/checkout");
  };

  const addLabel = added ? "Added" : size ? `Add to Bag — ${formatPrice(product.price)}` : "Add to Bag";

  return (
    <>
      <div className="md:container-x grid gap-8 md:grid-cols-12 md:gap-8 md:pt-8 lg:gap-14">
        <div className="min-w-0 md:col-span-7">
          <div className="md:sticky md:top-[calc(var(--nav-h)+1.5rem)]">
            <ImageGallery images={variant.images} name={product.name} />
          </div>
        </div>

        <div className="container-x min-w-0 md:col-span-5 md:px-0">
          <div className="md:sticky md:top-[calc(var(--nav-h)+1.5rem)]">
            <nav aria-label="Breadcrumb" className="eyebrow mb-6 text-steel">
              <Link href="/shop" className="hover:text-bone">
                Shop
              </Link>{" "}
              /{" "}
              <Link href={`/shop?category=${product.category}`} className="hover:text-bone">
                {product.category.replace("-", " ")}
              </Link>
            </nav>

            <div className="mb-4 flex flex-wrap gap-2">
              {product.badges.map((b) => (
                <ProductBadgeLabel key={b} badge={b} />
              ))}
            </div>

            <h1 className="display text-[clamp(2.75rem,9vw,4.75rem)]">{product.name.replace("BRO'S ", "")}</h1>
            <p className="mt-3 text-sm text-mist">{product.tagline}</p>

            <div className="mt-6 flex items-center justify-between gap-4 border-y border-line py-4">
              <p className="font-mono text-xl tabular-nums">{formatPrice(product.price)}</p>
              <div className="text-right">
                <Rating value={product.rating.average} count={product.rating.count} />
                <p className="mt-1 font-mono text-[0.5625rem] uppercase tracking-wider text-steel">Sample rating · demo</p>
              </div>
            </div>
            <p className="mt-2 text-[0.6875rem] text-steel">Inclusive of all taxes</p>

            {/* Colour */}
            <fieldset className="mt-8">
              <legend className="mb-3 flex w-full items-baseline justify-between">
                <span className="eyebrow text-mist">Colour</span>
                <span className="text-sm">{colourMap[colour].name}</span>
              </legend>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Colour">
                {product.colours.map((c) => {
                  const active = c.colour === colour;
                  return (
                    <button
                      key={c.colour}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      aria-label={colourMap[c.colour].name}
                      onClick={() => selectColour(c.colour)}
                      className={cn("grid size-12 place-items-center border transition-colors", active ? "border-bone" : "border-line hover:border-bone/50")}
                    >
                      <span className="size-7" style={{ backgroundColor: colourMap[c.colour].hex }} />
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Size */}
            <motion.fieldset id="size-picker" className="mt-8" animate={shake}>
              <legend className="mb-3 flex w-full items-baseline justify-between">
                <span className={cn("eyebrow", sizeError ? "text-red-400" : "text-mist")}>{sizeError ? "Select a size" : "Size"}</span>
                <button
                  type="button"
                  onClick={() => openOverlay("size-guide")}
                  className="flex min-h-10 items-center gap-2 text-xs text-bone/80 underline underline-offset-4 hover:text-bone"
                >
                  <Ruler className="size-3.5" strokeWidth={1.5} aria-hidden /> Size guide
                </button>
              </legend>
              <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="Size" aria-describedby={sizeError ? "size-error" : undefined}>
                {product.sizes.map((s) => {
                  const soldOut = product.soldOutSizes.includes(s);
                  const active = size === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      disabled={soldOut}
                      aria-label={soldOut ? `${s} — sold out` : s}
                      onClick={() => {
                        setSize(s);
                        setSizeError(false);
                      }}
                      className={cn(
                        "relative h-14 border font-mono text-sm transition-colors",
                        active ? "border-bone bg-bone text-ink" : "border-line hover:border-bone/60",
                        sizeError && !active && "border-red-400/50",
                        soldOut && "cursor-not-allowed text-steel hover:border-line",
                      )}
                    >
                      {s}
                      {soldOut && <span aria-hidden className="absolute inset-0 m-auto h-px w-[70%] -rotate-[20deg] bg-steel" />}
                    </button>
                  );
                })}
              </div>
              {sizeError && (
                <p id="size-error" role="alert" className="mt-2 text-xs text-red-400">
                  Please choose a size to continue.
                </p>
              )}
              {product.soldOutSizes.length > 0 && <p className="mt-2 text-xs text-steel">Crossed-out sizes are sold out.</p>}
            </motion.fieldset>

            {/* CTAs */}
            <div ref={ctaRef} className="mt-8 grid gap-2">
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Button size="lg" onClick={onAdd} aria-live="polite" className="h-14 sm:h-14">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={addLabel} className="flex items-center gap-2" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.2 }}>
                      {added && <Check className="size-4" strokeWidth={2} aria-hidden />}
                      {addLabel}
                    </motion.span>
                  </AnimatePresence>
                </Button>
                <WishlistButton product={product} variant="full" className="w-14 px-0 sm:w-auto sm:px-5 [&>span:last-child]:hidden sm:[&>span:last-child]:inline" />
              </div>
              <Button size="lg" variant="outline" onClick={onBuyNow} className="h-14 sm:h-14">
                Buy Now
              </Button>
            </div>

            <p className="mt-8 text-sm leading-relaxed text-bone/75">{product.description}</p>

            <ul className="mt-8 grid gap-px border border-line bg-line text-xs sm:grid-cols-2">
              <li className="flex items-center gap-3 bg-ink p-4">
                <Truck className="size-4 shrink-0 text-mist" strokeWidth={1.5} aria-hidden /> Free shipping across India
              </li>
              <li className="flex items-center gap-3 bg-ink p-4">
                <RotateCcw className="size-4 shrink-0 text-mist" strokeWidth={1.5} aria-hidden /> 7-day easy returns
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sticky mobile add-to-bag */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ink/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden"
          >
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{product.name.replace("BRO'S ", "")}</p>
                <p className="font-mono text-xs text-mist">
                  {formatPrice(product.price)} · {colourMap[colour].name}
                  {size ? ` · ${size}` : ""}
                </p>
              </div>
              <Button size="md" onClick={onAdd} className="h-12 shrink-0">
                {added ? "Added" : size ? "Add to Bag" : "Select size"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
