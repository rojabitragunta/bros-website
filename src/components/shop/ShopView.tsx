"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { colourMap } from "@/data/colours";
import { shopCategories } from "@/data/categories";
import { media } from "@/data/media";
import { filterProducts, matchesCategory } from "@/lib/services/catalog";
import { cn } from "@/lib/utils";
import type { Product, SortOption } from "@/types";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductGrid } from "@/components/product/ProductGrid";
import { FilterPanel, type ShopFilterState } from "./FilterPanel";

const SORTS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price Low → High" },
  { value: "price-desc", label: "Price High → Low" },
];

export interface ShopInitial extends ShopFilterState {
  sort: SortOption;
}

function toQuery(s: ShopInitial, bounds: { max: number }) {
  const q = new URLSearchParams();
  if (s.category !== "all") q.set("category", s.category);
  if (s.collection) q.set("collection", s.collection);
  if (s.sizes.length) q.set("size", s.sizes.join(","));
  if (s.colours.length) q.set("colour", s.colours.join(","));
  if (s.priceMax < bounds.max) q.set("max", String(s.priceMax));
  if (s.sort !== "featured") q.set("sort", s.sort);
  const str = q.toString();
  return str ? `?${str}` : "";
}

export function ShopView({ products, initial, bounds }: { products: Product[]; initial: ShopInitial; bounds: { min: number; max: number } }) {
  const [state, setState] = useState<ShopInitial>(initial);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebar, setSidebar] = useState(true);
  const first = useRef(true);

  // Keep the URL shareable without triggering a navigation.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.history.replaceState(null, "", `/shop${toQuery(state, bounds)}`);
  }, [state, bounds]);

  const results = useMemo(
    () =>
      filterProducts([...products], {
        category: state.category,
        collection: state.collection,
        sizes: state.sizes,
        colours: state.colours,
        priceMax: state.priceMax,
        sort: state.sort,
      }),
    [products, state],
  );

  const counts = useMemo(
    () => Object.fromEntries(shopCategories.map((c) => [c.slug, products.filter((p) => matchesCategory(p, c.slug)).length])),
    [products],
  );

  const update = (next: Partial<ShopInitial>) => setState((s) => ({ ...s, ...next }));
  const reset = () => setState({ category: "all", sizes: [], colours: [], priceMax: bounds.max, sort: state.sort, collection: undefined });

  const activeChips: { key: string; label: string; clear: () => void }[] = [
    ...(state.collection ? [{ key: "col", label: "Drop 001", clear: () => update({ collection: undefined }) }] : []),
    ...(state.category !== "all"
      ? [{ key: "cat", label: shopCategories.find((c) => c.slug === state.category)?.label ?? state.category, clear: () => update({ category: "all" }) }]
      : []),
    ...state.sizes.map((s) => ({ key: `s-${s}`, label: `Size ${s}`, clear: () => update({ sizes: state.sizes.filter((x) => x !== s) }) })),
    ...state.colours.map((c) => ({ key: `c-${c}`, label: colourMap[c].name, clear: () => update({ colours: state.colours.filter((x) => x !== c) }) })),
    ...(state.priceMax < bounds.max ? [{ key: "p", label: `Under ₹${state.priceMax.toLocaleString("en-IN")}`, clear: () => update({ priceMax: bounds.max }) }] : []),
  ];
  const filterCount = activeChips.length;
  const pristine = filterCount === 0;

  const title = state.collection
    ? "Drop 001"
    : state.category === "all"
      ? "Shop All"
      : (shopCategories.find((c) => c.slug === state.category)?.label ?? "Shop");

  const editorialTile = (
    <Link href="/lookbook" className="group relative block h-full min-h-[320px] overflow-hidden bg-graphite">
      <Image src={media.lookMove.src} alt={media.lookMove.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-8">
        <div>
          <p className="eyebrow text-bone/60">Campaign 001</p>
          <p className="display mt-2 text-[clamp(2.5rem,5vw,4.5rem)] text-bone">Move free.</p>
        </div>
        <span className="label flex items-center gap-2 text-bone">
          Lookbook <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} aria-hidden />
        </span>
      </div>
    </Link>
  );

  const sortSelect = (
    <div className="relative">
      <label htmlFor="sort" className="sr-only">
        Sort by
      </label>
      <select
        id="sort"
        value={state.sort}
        onChange={(e) => update({ sort: e.target.value as SortOption })}
        className="label h-11 cursor-pointer appearance-none border border-line bg-ink pl-4 pr-10 text-bone/85 transition-colors hover:border-bone/50 focus:outline-none focus-visible:border-bone"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-mist" strokeWidth={1.5} aria-hidden />
    </div>
  );

  return (
    <div className="bg-ink pb-24 text-bone">
      {/* Header */}
      <header className="container-x pb-8 pt-10 md:pb-12 md:pt-16">
        <nav aria-label="Breadcrumb" className="eyebrow mb-6 text-steel">
          <Link href="/" className="hover:text-bone">
            Home
          </Link>{" "}
          / <span className="text-mist">Shop</span>
        </nav>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h1 className="display text-[clamp(3.5rem,13vw,10rem)]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={title} className="block" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                {title}
              </motion.span>
            </AnimatePresence>
          </h1>
          <p className="max-w-xs text-sm text-mist md:text-right">
            Drop 001 — performance knits and considered fits. <span className="text-steel">Demo catalogue.</span>
          </p>
        </div>
        {/* Quick category pills */}
        <ul className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Quick categories">
          {shopCategories.map((c) => {
            const active = state.category === c.slug;
            return (
              <li key={c.slug} className="shrink-0">
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => update({ category: c.slug })}
                  className={cn(
                    "label h-10 border px-4 transition-colors",
                    active ? "border-bone bg-bone text-ink" : "border-line text-bone/70 hover:border-bone/50 hover:text-bone",
                  )}
                >
                  {c.label}
                </button>
              </li>
            );
          })}
        </ul>
      </header>

      {/* Toolbar */}
      <div className="sticky top-[var(--nav-h)] z-30 border-y border-line bg-ink/90 backdrop-blur-xl">
        <div className="container-x flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => (window.matchMedia("(min-width: 1024px)").matches ? setSidebar((v) => !v) : setMobileOpen(true))}
              className="label flex h-11 items-center gap-2.5 text-bone/85 hover:text-bone"
              aria-expanded={mobileOpen || undefined}
            >
              <SlidersHorizontal className="size-4" strokeWidth={1.5} aria-hidden />
              <span className="lg:hidden">Filter</span>
              <span className="hidden lg:inline">{sidebar ? "Hide filters" : "Show filters"}</span>
              {filterCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-bone font-mono text-[0.625rem] text-ink">{filterCount}</span>}
            </button>
            <p className="hidden font-mono text-xs text-steel sm:block" aria-live="polite">
              {results.length} {results.length === 1 ? "product" : "products"}
            </p>
          </div>
          {sortSelect}
        </div>
      </div>

      <div className="container-x mt-8 flex gap-10">
        {/* Desktop sidebar */}
        <AnimatePresence initial={false}>
          {sidebar && (
            <motion.aside
              aria-label="Filters"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="hidden shrink-0 overflow-hidden lg:block"
            >
              <div className="sticky top-[calc(var(--nav-h)+5rem)] w-[260px]">
                <FilterPanel state={state} onChange={update} counts={counts} bounds={bounds} />
                {!pristine && (
                  <button type="button" onClick={reset} className="label mt-6 min-h-10 text-mist underline underline-offset-4 hover:text-bone">
                    Clear all
                  </button>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <div className="min-w-0 flex-1">
          {/* Active chips */}
          <AnimatePresence initial={false}>
            {!pristine && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-8 flex flex-wrap items-center gap-2 overflow-hidden"
                aria-label="Active filters"
              >
                {activeChips.map((c) => (
                  <li key={c.key}>
                    <button
                      type="button"
                      onClick={c.clear}
                      className="flex h-9 items-center gap-2 border border-line bg-graphite pl-3 pr-2 text-xs text-bone/85 hover:border-bone/50"
                      aria-label={`Remove filter: ${c.label}`}
                    >
                      {c.label}
                      <X className="size-3.5" strokeWidth={1.5} aria-hidden />
                    </button>
                  </li>
                ))}
                <li>
                  <button type="button" onClick={reset} className="h-9 px-2 text-xs text-mist underline underline-offset-4 hover:text-bone">
                    Clear all
                  </button>
                </li>
              </motion.ul>
            )}
          </AnimatePresence>

          {results.length ? (
            <ProductGrid products={results} insert={pristine ? editorialTile : undefined} insertAt={4} columns={sidebar ? "three" : "default"} />
          ) : (
            <EmptyState
              className="border border-line py-20"
              index="0 results"
              title="Nothing matches — yet."
              body="Try removing a filter or two."
              action={{ label: "Explore Drop 001", href: "/shop?collection=drop-001" }}
            />
          )}
          {!results.length && (
            <div className="mt-4 text-center">
              <button type="button" onClick={reset} className="label min-h-11 text-mist underline underline-offset-4 hover:text-bone">
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        title={`Filter${filterCount ? ` (${filterCount})` : ""}`}
        side="bottom"
        className="h-[88dvh] lg:hidden"
        footer={
          <div className="grid grid-cols-2 gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button variant="outline" size="lg" onClick={reset}>
              Clear
            </Button>
            <Button size="lg" onClick={() => setMobileOpen(false)}>
              Show {results.length}
            </Button>
          </div>
        }
      >
        <div className="px-5 py-6">
          <FilterPanel state={state} onChange={update} counts={counts} bounds={bounds} />
        </div>
      </Drawer>
    </div>
  );
}
