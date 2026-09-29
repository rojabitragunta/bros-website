/**
 * Catalogue domain types.
 *
 * These mirror the shape we expect from the future catalogue API, so the
 * service layer (src/lib/services) can swap mock data for real fetches
 * without touching any component.
 */

export type ColourId =
  | "onyx"
  | "graphite"
  | "bone"
  | "ash"
  | "moss"
  | "midnight"
  | "clay";

export interface Colour {
  id: ColourId;
  name: string;
  hex: string;
}

export type SizeCode = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export type Gender = "men" | "women";

export type CategorySlug =
  | "tees"
  | "tanks"
  | "long-sleeves"
  | "shorts"
  | "joggers"
  | "leggings"
  | "bras";

export type CollectionSlug = "drop-001" | "essentials";

/** Garment silhouette used by the placeholder render pipeline (scripts/). */
export type GarmentType =
  | "tee"
  | "oversized"
  | "crop"
  | "longsleeve"
  | "tank"
  | "muscle"
  | "bra"
  | "shorts"
  | "short-shorts"
  | "jogger"
  | "legging";

export type ImageView =
  | "front"
  | "back"
  | "side"
  | "detail"
  | "lifestyle"
  | "model";

export interface ProductImage {
  src: string;
  alt: string;
  view: ImageView;
  width: number;
  height: number;
}

export interface ColourVariant {
  colour: ColourId;
  images: ProductImage[];
}

export interface CompositionPart {
  material: string;
  percent: number;
}

export type StretchLevel = "2-way" | "4-way" | "minimal";

export type ProductBadge = "new" | "bestseller" | "limited" | "low-stock";

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** One-line hook shown under the product name. */
  tagline: string;
  /** Price in whole rupees (INR). */
  price: number;
  compareAtPrice?: number;
  category: CategorySlug;
  gender: Gender[];
  collections: CollectionSlug[];
  /** Primary / default colour name, e.g. "Onyx Black". */
  colour: string;
  colours: ColourVariant[];
  sizes: SizeCode[];
  soldOutSizes: SizeCode[];
  description: string;
  /** Images for the primary colourway (convenience alias of colours[0].images). */
  images: ProductImage[];
  fabric: string;
  gsm: number;
  composition: CompositionPart[];
  fit: string;
  stretch: StretchLevel;
  features: string[];
  care: string[];
  /** Demo-only rating. Replace with real review data from the backend. */
  rating: { average: number; count: number };
  badges: ProductBadge[];
  releasedAt: string;
  /** Lower = more prominent in "Featured" sort. */
  featuredRank: number;
  garment: GarmentType;
}

/**
 * Raw catalogue record as stored in src/data/products.ts. The service layer
 * hydrates it into a Product (resolving colour names and image URLs).
 */
export type ProductSeed = Omit<Product, "images" | "colours" | "colour"> & {
  colourIds: ColourId[];
};

export interface Category {
  slug: string;
  title: string;
  eyebrow: string;
  href: string;
  image: string;
  imageAlt: string;
}

export type SortOption = "featured" | "newest" | "price-asc" | "price-desc";

export interface ProductFilters {
  category?: string;
  collection?: string;
  sizes?: SizeCode[];
  colours?: ColourId[];
  priceMax?: number;
  sort?: SortOption;
  query?: string;
}
