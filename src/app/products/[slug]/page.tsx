import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductSpecs } from "@/components/product/ProductSpecs";
import { ProductGrid } from "@/components/product/ProductGrid";
import { colourMap } from "@/data/colours";
import { site } from "@/data/site";
import { getProductBySlug, getProducts, getRelatedProducts } from "@/lib/services/catalog";
import { pageMetadata } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Params }) {
  const product = await getProductBySlug((await params).slug);
  if (!product) return {};
  const front = product.images[0];
  return pageMetadata({
    title: `${product.name} | Premium Activewear`,
    description: `${product.tagline} ${product.description}`.slice(0, 158),
    path: `/products/${product.slug}`,
    image: { src: front.src, alt: front.alt, width: front.width, height: front.height },
  });
}

export default async function ProductPage({ params }: { params: Params }) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  const related = await getRelatedProducts(product, 4);

  // Structured data placeholder — availability/price to come from inventory API.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.id,
    brand: { "@type": "Brand", name: site.name },
    color: product.colours.map((c) => colourMap[c.colour].name).join(", "),
    material: product.composition.map((c) => `${c.percent}% ${c.material}`).join(", "),
    image: product.images.slice(0, 4).map((i) => `${site.url}${i.src}`),
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: "https://schema.org/PreOrder",
      url: `${site.url}/products/${product.slug}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="bg-ink pb-16 text-bone md:pb-24">
        <ProductDetail product={product} />
      </div>
      <ProductSpecs product={product} />
      <section aria-labelledby="related-title" className="on-light bg-paper py-16 text-ink md:py-28">
        <div className="container-x">
          <div className="mb-10 flex items-end justify-between gap-6 md:mb-14">
            <div>
              <p className="eyebrow mb-4 text-ink/50">Pair it with</p>
              <h2 id="related-title" className="display text-[clamp(2.75rem,8vw,6.5rem)]">
                Complete the kit.
              </h2>
            </div>
            <Link href="/shop" className="label group hidden min-h-11 items-center gap-2 text-ink/70 hover:text-ink sm:flex">
              Shop all <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} aria-hidden />
            </Link>
          </div>
          <ProductGrid products={related} />
        </div>
      </section>
    </>
  );
}
