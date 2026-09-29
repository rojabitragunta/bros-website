/**
 * Catalogue service (server only) — reads active products from PostgreSQL.
 *
 * The whole active catalogue is small, so it is loaded in one cached query set
 * tagged "catalog". Admin edits, stock changes and orders invalidate the tag
 * so storefront pages refresh immediately.
 */
import "server-only";
import { asc, eq, inArray } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { colourMap } from "@/data/colours";
import { db, schema } from "@/lib/db";
import { MAX_QTY, PLACEHOLDER_IMAGE, filterProducts, priceBoundsOf, stockStatus } from "@/lib/catalog-utils";
import type { ColourId, ImageView, Product, ProductFilters, ProductImage, SizeCode } from "@/types";

export const CATALOG_TAG = "catalog";

type Row = typeof schema.products.$inferSelect;
type ImageRow = typeof schema.productImages.$inferSelect;
type VariantRow = typeof schema.variants.$inferSelect;

export function toProduct(p: Row, images: ImageRow[], variants: VariantRow[]): Product {
  const colourIds = p.colourIds as ColourId[];
  const colours = colourIds.map((colour) => {
    const own = images
      .filter((i) => i.colour === colour)
      .sort((a, b) => a.position - b.position)
      .map<ProductImage>((i) => ({
        id: i.id,
        src: i.url,
        alt: i.alt || `${p.name} in ${colourMap[colour]?.name ?? colour}`,
        view: i.view as ImageView,
        width: i.width,
        height: i.height,
        placeholder: i.isPlaceholder,
      }));
    return {
      colour,
      images: own.length
        ? own
        : [{ src: PLACEHOLDER_IMAGE, alt: `${p.name} — photo coming soon`, view: "front" as const, width: 1200, height: 1500, placeholder: true }],
    };
  });
  const vs = variants
    .filter((v) => v.active && colourIds.includes(v.colour as ColourId) && p.sizes.includes(v.size))
    .map((v) => ({
      id: v.id,
      colour: v.colour as ColourId,
      size: v.size as SizeCode,
      sku: v.sku,
      available: Math.min(v.stock, MAX_QTY),
      status: stockStatus(v.stock, p.lowStockThreshold),
    }));
  const sizes = p.sizes as SizeCode[];
  const lowStock = vs.some((v) => v.status === "low_stock") && !vs.some((v) => v.status === "in_stock");
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? undefined,
    category: p.category as Product["category"],
    gender: p.gender as Product["gender"],
    collections: p.collections as Product["collections"],
    colour: colourMap[colourIds[0]]?.name ?? colourIds[0] ?? "",
    colours,
    images: colours[0]?.images ?? [],
    sizes,
    soldOutSizes: sizes.filter((s) => !vs.some((v) => v.size === s && v.available > 0)),
    variants: vs,
    description: p.description,
    fabric: p.fabric,
    gsm: p.gsm,
    composition: p.composition,
    fit: p.fit,
    stretch: p.stretch as Product["stretch"],
    features: p.features,
    care: p.care,
    rating: p.ratingAverage != null && p.ratingCount ? { average: p.ratingAverage / 10, count: p.ratingCount } : undefined,
    badges: [...(p.badges as Product["badges"]), ...(lowStock ? (["low-stock"] as const) : [])],
    releasedAt: p.releasedAt.toISOString().slice(0, 10),
    featuredRank: p.featuredRank,
    garment: (p.garment ?? undefined) as Product["garment"],
  };
}

/** Loads products (any status unless activeOnly) with their images and variants. */
export async function loadProducts(where?: { ids?: string[]; activeOnly?: boolean }): Promise<Product[]> {
  const rows = await db
    .select()
    .from(schema.products)
    .where(where?.ids ? inArray(schema.products.id, where.ids) : where?.activeOnly ? eq(schema.products.status, "active") : undefined)
    .orderBy(asc(schema.products.featuredRank));
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const [images, variants] = await Promise.all([
    db.select().from(schema.productImages).where(inArray(schema.productImages.productId, ids)),
    db.select().from(schema.variants).where(inArray(schema.variants.productId, ids)),
  ]);
  return rows.map((r) => toProduct(r, images.filter((i) => i.productId === r.id), variants.filter((v) => v.productId === r.id)));
}

const loadCatalogue = unstable_cache(() => loadProducts({ activeOnly: true }), ["catalogue-v1"], {
  tags: [CATALOG_TAG],
  revalidate: 300,
});

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  return filterProducts([...(await loadCatalogue())], filters);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return (await loadCatalogue()).find((p) => p.slug === slug);
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  return (await getProducts({ sort: "featured" })).slice(0, limit);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const scored = (await loadCatalogue())
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
  return (await getProducts({ query })).slice(0, limit);
}

export async function getPriceBounds() {
  return priceBoundsOf(await loadCatalogue());
}
