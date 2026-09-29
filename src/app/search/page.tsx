import { ProductGrid } from "@/components/product/ProductGrid";
import { SearchPageForm } from "@/components/search/SearchPageForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { getFeaturedProducts, getProducts } from "@/lib/services/catalog";
import { pageMetadata } from "@/lib/seo";

type SP = Promise<{ q?: string | string[] }>;

export async function generateMetadata({ searchParams }: { searchParams: SP }) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  return pageMetadata({ title: q ? `Search: ${q}` : "Search", path: "/search", noIndex: true });
}

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const raw = (await searchParams).q;
  const q = ((Array.isArray(raw) ? raw[0] : raw) ?? "").trim();
  const results = q ? await getProducts({ query: q }) : [];
  const featured = await getFeaturedProducts(4);

  return (
    <div className="bg-ink pb-24 text-bone">
      <div className="container-x pt-10 md:pt-16">
        <h1 className="eyebrow mb-6 text-mist">{q ? `Results for “${q}”` : "Search"}</h1>
        <SearchPageForm key={q} initial={q} />
        <p className="mt-10 font-mono text-xs text-steel" aria-live="polite">
          {q ? `${results.length} ${results.length === 1 ? "product" : "products"}` : "Try a product, fabric or colour."}
        </p>
        <div className="mt-8">
          {q && results.length > 0 && <ProductGrid products={results} />}
          {q && results.length === 0 && (
            <EmptyState className="border border-line py-20" index="0 results" title="No match. Yet." body="Check the spelling or try a broader term." action={{ label: "Shop all", href: "/shop" }} />
          )}
          {(!q || results.length === 0) && (
            <section aria-labelledby="featured-search" className="mt-16">
              <h2 id="featured-search" className="eyebrow mb-6 text-mist">
                Trending in Drop 001
              </h2>
              <ProductGrid products={featured} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
