/**
 * Catalogue service layer.
 *
 * Phase 1: reads the local demo catalogue.
 * Phase 2: replace each function body with a call to the catalogue API —
 * signatures are already async so no caller needs to change.
 */
import { colourMap } from "@/data/colours";
import { productSeeds } from "@/data/products";
import type {
  ColourId,
  ImageView,
  Product,
  ProductFilters,
  ProductImage,
  ProductSeed,
  SizeCode,
} from "@/types";

const VIEW_ORDER: ImageView[] = ["front", "model", "back", "side", "detail", "lifestyle"];
const VIEW_LABEL: Record<ImageView, string> = {
  front: "front",
  back: "back",
  side: "side",
  detail: "fabric detail",
  lifestyle: "lifestyle",
  model: "on form",
};

export function productImagePath(slug: string, colour: ColourId, view: ImageView) {
  return `/images/products/${slug}/${colour}-${view}.webp`;
}

function buildImages(seed: ProductSeed, colour: ColourId): ProductImage[] {
  const colourName = colourMap[colour].name;
  return VIEW_ORDER.map((view) => ({
    src: productImagePath(seed.slug, colour, view),
    alt: `${seed.name} in ${colourName} — ${VIEW_LABEL[view]}`,
    view,
    width: 1200,
    height: 1500,
  }));
}

function hydrate(seed: ProductSeed): Product {
  const { colourIds, ...rest } = seed;
  const colours = colourIds.map((colour) => ({ colour, images: buildImages(seed, colour) }));
  return {
    ...rest,
    colour: colourMap[colourIds[0]].name,
    colours,
    images: colours[0].images,
  };
}

const catalogue: Product[] = productSeeds.map(hydrate);
const bySlug = new Map(catalogue.map((p) => [p.slug, p]));
const byId = new Map(catalogue.map((p) => [p.id, p]));

/* Synchronous accessors — for client components working off local data. */
export const catalog = {
  all: () => catalogue,
  bySlug: (slug: string) => bySlug.get(slug),
  byId: (id: string) => byId.get(id),
};

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
    ...p.colours.map((c) => colourMap[c.colour].name),
  ].join(" "));
  return q.split(/\s+/).every((term) => hay.includes(term));
}

export function filterProducts(list: Product[], f: ProductFilters): Product[] {
  const out = list.filter(
    (p) =>
      matchesCategory(p, f.category) &&
      (!f.collection || p.collections.includes(f.collection as Product["collections"][number])) &&
      matchesQuery(p, f.query) &&
      (!f.sizes?.length || f.sizes.some((s: SizeCode) => p.sizes.includes(s) && !p.soldOutSizes.includes(s))) &&
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

/* Async API — the shape pages use today and the backend will implement. */

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  return filterProducts([...catalogue], filters);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return bySlug.get(slug);
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  return filterProducts([...catalogue], { sort: "featured" }).slice(0, limit);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const scored = catalogue
    .filter((p) => p.id !== product.id)
    .map((p) => ({
      p,
      score:
        (p.category === product.category ? 3 : 0) +
        (p.gender.some((g) => product.gender.includes(g)) ? 2 : 0) +
        (p.collections.some((c) => product.collections.includes(c)) ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.p.featuredRank - b.p.featuredRank);
  return scored.slice(0, limit).map((s) => s.p);
}

export async function searchProducts(query: string, limit = 8): Promise<Product[]> {
  return filterProducts([...catalogue], { query }).slice(0, limit);
}

export const priceBounds = {
  min: Math.min(...catalogue.map((p) => p.price)),
  max: Math.max(...catalogue.map((p) => p.price)),
};
