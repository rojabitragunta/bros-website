import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategorySection } from "@/components/home/CategorySection";
import { Community } from "@/components/home/Community";
import { FeaturedDrop } from "@/components/home/FeaturedDrop";
import { Hero } from "@/components/home/Hero";
import { LabSection } from "@/components/home/LabSection";
import { Newsletter } from "@/components/home/Newsletter";
import { LookbookPanel } from "@/components/lookbook/LookbookSection";
import { Marquee } from "@/components/ui/Marquee";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { lookbookChapters } from "@/data/lookbook";
import { marqueeWords, site } from "@/data/site";
import { getProductBySlug, getProducts } from "@/lib/services/catalog";
import { pageMetadata } from "@/lib/seo";
import type { Product } from "@/types";

export const metadata = pageMetadata({ title: site.title, path: "/" });

const FEATURED = [
  "bros-performance-tee",
  "bros-oversized-essential-tee",
  "bros-training-shorts",
  "bros-sculpt-legging",
  "bros-everyday-jogger",
];

export default async function HomePage() {
  const featured = (await Promise.all(FEATURED.map(getProductBySlug))).filter((p): p is Product => Boolean(p));
  const total = (await getProducts()).length;

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: `${site.url}/icon.svg`,
    sameAs: Object.values(site.social),
    address: { "@type": "PostalAddress", addressLocality: site.city, addressCountry: "IN" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <Hero />

      <Marquee
        items={marqueeWords}
        duration={45}
        className="border-b border-line bg-ink py-4 text-bone sm:py-5"
        itemClassName="display-wide text-[clamp(1.5rem,3.5vw,2.75rem)] text-bone/80"
      />

      <FeaturedDrop products={featured} total={total} />

      <CategorySection />

      <LabSection />

      <section aria-labelledby="lookbook-title" className="bg-[#141414] pt-20 text-bone md:pt-32">
        <div className="container-x mb-12 md:mb-20">
          <SectionHeader
            eyebrow="Lookbook / Campaign 001"
            title={["Outside", "the lines."]}
            lead="Three chapters from the Drop 001 campaign."
            action={
              <Link href="/lookbook" className="label group inline-flex min-h-11 items-center gap-2 text-bone/80 hover:text-bone">
                View the lookbook
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} aria-hidden />
              </Link>
            }
          />
          <span id="lookbook-title" className="sr-only">
            Lookbook
          </span>
        </div>
        <div className="space-y-2">
          {lookbookChapters.map((c) => (
            <LookbookPanel key={c.id} chapter={c} />
          ))}
        </div>
      </section>

      <Community />
      <Newsletter />
    </>
  );
}
