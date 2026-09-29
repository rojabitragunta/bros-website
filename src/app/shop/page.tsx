import { ShopView, type ShopInitial } from "@/components/shop/ShopView";
import { SIZE_OPTIONS } from "@/components/shop/FilterPanel";
import { colours } from "@/data/colours";
import { shopCategories } from "@/data/categories";
import { getProducts, priceBounds } from "@/lib/services/catalog";
import { pageMetadata } from "@/lib/seo";
import type { ColourId, SizeCode, SortOption } from "@/types";

type SP = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

function parse(sp: SP): ShopInitial {
  const category = one(sp.category);
  const sort = one(sp.sort) as SortOption | undefined;
  const max = Number(one(sp.max));
  return {
    category: category && shopCategories.some((c) => c.slug === category) ? category : "all",
    collection: one(sp.collection) === "drop-001" ? "drop-001" : undefined,
    sizes: (one(sp.size)?.split(",") ?? []).filter((s): s is SizeCode => SIZE_OPTIONS.includes(s as SizeCode)),
    colours: (one(sp.colour)?.split(",") ?? []).filter((c): c is ColourId => colours.some((x) => x.id === c)),
    priceMax: Number.isFinite(max) && max > 0 ? Math.min(max, priceBounds.max) : priceBounds.max,
    sort: sort && ["featured", "newest", "price-asc", "price-desc"].includes(sort) ? sort : "featured",
  };
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }) {
  const s = parse(await searchParams);
  const label = s.collection ? "Drop 001" : s.category === "all" ? "Shop All" : shopCategories.find((c) => c.slug === s.category)?.label;
  return pageMetadata({
    title: `${label} — Performance Activewear`,
    description: "Shop BRO'S performance tees, training shorts, joggers, leggings and more. Free shipping across India.",
    path: "/shop",
  });
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
  const initial = parse(await searchParams);
  const products = await getProducts();
  // Keyed by the query so client state resets when the nav links change filters.
  return <ShopView key={JSON.stringify(initial)} products={products} initial={initial} bounds={priceBounds} />;
}
