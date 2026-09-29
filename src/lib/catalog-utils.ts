/**
 * Pure catalogue helpers — safe to import from client components.
 * Data access lives in lib/services/catalog.ts (server only).
 */
import { colourMap } from "@/data/colours";
import type { ColourId, ImageView, Product, ProductFilters, SizeCode, StockStatus } from "@/types";

/** Maximum quantity of one variant per order line. */
export const MAX_QTY = 10;

/** Shown when a colourway has no photos yet. */
export const PLACEHOLDER_IMAGE = "/images/placeholder-product.svg";

export function productImagePath(slug: string, colour: ColourId, view: ImageView) {
  return `/images/products/${slug}/${colour}-${view}.webp`;
}

export function stockStatus(stock: number, lowThreshold: number): StockStatus {
  if (stock <= 0) return "out_of_stock";
  return stock <= lowThreshold ? "low_stock" : "in_stock";
}

export const STOCK_LABEL: Record<StockStatus, string> = {
  in_stock: "Available",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
};

export function findVariant(p: Product, colour: ColourId, size: SizeCode) {
  return p.variants.find((v) => v.colour === colour && v.size === size);
}

/** Sizes of one colourway that cannot be bought. */
export function soldOutSizesFor(p: Product, colour: ColourId): SizeCode[] {
  return p.sizes.filter((s) => (findVariant(p, colour, s)?.available ?? 0) <= 0);
}

export function isSoldOut(p: Product) {
  return p.variants.every((v) => v.available <= 0);
}

export function matchesCategory(p: Product, category?: string) {
  if (!category || category === "all") return true;
  if (category === "men" || category === "women") return p.gender.includes(category);
  if (category === "new-drop" || category === "drop-001") return p.collections.includes("drop-001");
  return p.category === category;
}

export function matchesQuery(p: Product, query?: string) {
  const norm = (s: string) => s.toLowerCase().replace(/['’"]/g, "").replace(/-/g, " ");
  const q = norm(query ?? "").trim();
  if (!q) return true;
  const hay = norm([
    p.name,
    p.category,
    p.tagline,
    p.fabric,
    p.fit,
    ...p.gender,
    ...p.variants.map((v) => v.sku),
    ...p.colours.map((c) => colourMap[c.colour]?.name ?? c.colour),
  ].join(" "));
  return q.split(/\s+/).every((term) => hay.includes(term));
}

export function filterProducts(list: Product[], f: ProductFilters): Product[] {
  const out = list.filter(
    (p) =>
      matchesCategory(p, f.category) &&
      (!f.collection || p.collections.includes(f.collection as Product["collections"][number])) &&
      matchesQuery(p, f.query) &&
      (!f.sizes?.length || f.sizes.some((s: SizeCode) => p.variants.some((v) => v.size === s && v.available > 0))) &&
      (!f.colours?.length || p.colours.some((c) => f.colours!.includes(c.colour))) &&
      (f.priceMax === undefined || p.price <= f.priceMax),
  );
  switch (f.sort) {
    case "newest":
      return out.sort((a, b) => b.releasedAt.localeCompare(a.releasedAt) || a.featuredRank - b.featuredRank);
    case "price-asc":
      return out.sort((a, b) => a.price - b.price);
    case "price-desc":
      return out.sort((a, b) => b.price - a.price);
    default:
      return out.sort((a, b) => a.featuredRank - b.featuredRank);
  }
}

export function priceBoundsOf(list: Product[]) {
  if (!list.length) return { min: 0, max: 0 };
  return { min: Math.min(...list.map((p) => p.price)), max: Math.max(...list.map((p) => p.price)) };
}

/**
 * Homepage feature selection: preferred slugs first (in order), then other
 * products by rank, up to `limit`. Never returns undefined entries.
 */
export function pickFeatured(all: Product[], preferred: string[], limit = 5): Product[] {
  const chosen = preferred.map((s) => all.find((p) => p.slug === s)).filter((p): p is Product => Boolean(p));
  for (const p of [...all].sort((a, b) => a.featuredRank - b.featuredRank)) {
    if (chosen.length >= limit) break;
    if (!chosen.includes(p)) chosen.push(p);
  }
  return chosen.slice(0, limit);
}
