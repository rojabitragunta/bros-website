import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/data/categories";
import { CategoryCard } from "@/components/product/CategoryCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function CategorySection() {
  const [men, women, tees, shorts, joggers, newDrop] = categories;

  return (
    <section aria-labelledby="shop-heading" className="bg-graphite py-20 text-bone md:py-32">
      <div className="container-x">
        <SectionHeader
          eyebrow="Shop / 06 categories"
          title={["Shop the", "system."]}
          lead="Tops, bottoms and layers designed to work together — in the gym and out of it."
          className="mb-10 md:mb-16"
        />
        <span id="shop-heading" className="sr-only">
          Shop by category
        </span>

        {/* Mobile: snap carousel */}
        <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:hidden" aria-label="Categories">
          {categories.map((c) => (
            <li key={c.slug} className="w-[78vw] max-w-[340px] shrink-0 snap-start">
              <CategoryCard category={c} sizes="80vw" />
            </li>
          ))}
        </ul>

        {/* Tablet/desktop: editorial grid */}
        <div className="hidden gap-3 md:grid md:grid-cols-12 lg:gap-4">
          <Reveal className="md:col-span-6 md:row-span-2">
            <CategoryCard category={men} tall sizes="50vw" className="h-full" />
          </Reveal>
          <Reveal delay={0.05} className="md:col-span-3">
            <CategoryCard category={women} sizes="25vw" />
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-3">
            <CategoryCard category={tees} sizes="25vw" />
          </Reveal>
          <Reveal delay={0.15} className="md:col-span-3">
            <CategoryCard category={shorts} sizes="25vw" />
          </Reveal>
          <Reveal delay={0.2} className="md:col-span-3">
            <CategoryCard category={joggers} sizes="25vw" />
          </Reveal>
          <Reveal className="md:col-span-12">
            <Link href={newDrop.href} className="group/nd relative flex aspect-[21/8] items-end overflow-hidden bg-ink">
              <Image
                src={newDrop.image}
                alt={newDrop.imageAlt}
                fill
                sizes="100vw"
                className="object-cover object-[50%_28%] opacity-80 transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/nd:scale-[1.04]"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-black/60" />
              <div className="relative flex w-full items-end justify-between gap-6 p-8 lg:p-12">
                <div className="transition-transform duration-500 group-hover/nd:-translate-y-1.5">
                  <p className="eyebrow mb-3 text-bone/60">{newDrop.eyebrow}</p>
                  <p className="display text-[clamp(3.5rem,8vw,8rem)]">New Drop</p>
                </div>
                <span className="label flex items-center gap-3 border border-bone/30 px-5 py-4 transition-colors group-hover/nd:bg-bone group-hover/nd:text-ink">
                  Explore Drop 001
                  <ArrowUpRight className="size-4 transition-transform duration-500 group-hover/nd:rotate-45" strokeWidth={1.5} aria-hidden />
                </span>
              </div>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
