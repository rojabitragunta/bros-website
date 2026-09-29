import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { Parallax, Reveal, TextReveal } from "@/components/ui/Reveal";
import { formatPrice } from "@/lib/utils";

function Header({ total }: { total: number }) {
  return (
    <div className="relative mb-12 grid gap-6 md:mb-20 md:grid-cols-12 md:items-end">
      <div className="md:col-span-8">
        <p className="eyebrow mb-4 text-ink/50">Collection / {total ? `${String(total).padStart(2, "0")} pieces` : "Arriving soon"}</p>
        <TextReveal as="h2" lines={["Drop 001"]} className="display whitespace-nowrap text-[clamp(4rem,21vw,15rem)] leading-[0.8] md:text-[12vw] 2xl:text-[11rem]" />
      </div>
      <div className="md:col-span-4 md:pb-3">
        <p className="display text-3xl sm:text-4xl" id="drop-title">
          Built for the rep.
        </p>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/65">
          One idea: kit that moves the way you do. Technical knits, considered fits, nothing you don&rsquo;t need.
        </p>
      </div>
    </div>
  );
}

const sectionCls = "on-light relative isolate overflow-hidden bg-paper py-20 text-ink md:py-32";

/**
 * Editorial, asymmetric product composition when 5+ products are available
 * ([hero, small, small, secondary, lifestyle]); a simple grid for 1–4; and an
 * "arriving soon" state when the catalogue is empty.
 */
export function FeaturedDrop({ products, total }: { products: Product[]; total: number }) {
  if (products.length < 5) {
    return (
      <section aria-labelledby="drop-title" className={sectionCls}>
        <div className="container-x">
          <Header total={total} />
          {products.length ? (
            <ul className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-5">
              {products.map((p, i) => (
                <li key={p.id}>
                  <Reveal delay={i * 0.08}>
                    <ProductCard product={p} preload={i < 2} sizes="(min-width: 768px) 25vw, 50vw" />
                  </Reveal>
                </li>
              ))}
            </ul>
          ) : (
            <div className="border border-ink/15 px-6 py-16 text-center md:py-24">
              <p className="eyebrow text-ink/50">Drop 001</p>
              <p className="display mt-4 text-[clamp(2.25rem,5vw,4rem)]">Pieces landing soon.</p>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink/65">
                We&rsquo;re photographing the collection now. Join the list below to hear first when it goes live.
              </p>
            </div>
          )}
          {products.length > 0 && (
            <div className="mt-16 flex justify-center md:mt-24">
              <ButtonLink href="/shop" variant="ink" size="lg" icon={<ArrowRight className="size-4" strokeWidth={1.5} />}>
                Shop all
              </ButtonLink>
            </div>
          )}
        </div>
      </section>
    );
  }

  const [hero, a, b, c, d] = products;
  const lifestyle = d.images.find((i) => i.view === "lifestyle") ?? d.images[0];

  return (
    <section aria-labelledby="drop-title" className={sectionCls}>
      <div className="container-x">
        <Header total={total} />

        {/* Row A — hero product + stacked text/products */}
        <div className="grid gap-x-5 gap-y-12 md:grid-cols-12">
          <Reveal className="md:col-span-7">
            <ProductCard
              product={hero}
              size="large"
              preload
              sizes="(min-width: 768px) 58vw, 100vw"
            />
          </Reveal>

          <div className="flex flex-col justify-between gap-12 md:col-span-5">
            <Reveal delay={0.1} className="hidden md:block">
              <div className="border-t border-ink/15 pt-5">
                <div className="flex items-baseline justify-between">
                  <p className="eyebrow text-ink/50">Hero piece / 01</p>
                  <p className="font-mono text-xs text-ink/50">{formatPrice(hero.price)}</p>
                </div>
                <p className="display mt-6 text-[clamp(2.5rem,4.5vw,4.5rem)]">{hero.tagline}</p>
                <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink/65">{hero.description}</p>
                <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-ink/15 py-5 font-mono text-xs uppercase">
                  <div>
                    <dt className="text-ink/45">Weight</dt>
                    <dd className="mt-1">{hero.gsm} GSM</dd>
                  </div>
                  <div>
                    <dt className="text-ink/45">Stretch</dt>
                    <dd className="mt-1">{hero.stretch}</dd>
                  </div>
                  <div>
                    <dt className="text-ink/45">Fit</dt>
                    <dd className="mt-1">{hero.fit.split(" —")[0]}</dd>
                  </div>
                </dl>
              </div>
            </Reveal>
            <div className="grid grid-cols-2 gap-x-3 sm:gap-x-5">
              <Reveal delay={0.15}>
                <ProductCard product={a} sizes="(min-width: 768px) 20vw, 50vw" />
              </Reveal>
              <Reveal delay={0.25} className="mt-10 md:mt-16">
                <ProductCard product={b} sizes="(min-width: 768px) 20vw, 50vw" />
              </Reveal>
            </div>
          </div>
        </div>

        {/* Row B — offset product + lifestyle frame */}
        <div className="mt-16 grid gap-x-5 gap-y-12 md:mt-28 md:grid-cols-12 md:items-end">
          <Reveal className="grid grid-cols-2 gap-x-3 md:col-span-4 md:block">
            <ProductCard product={c} sizes="(min-width: 768px) 33vw, 50vw" />
            <div className="md:hidden">
              <p className="eyebrow text-ink/50">Women / Drop 001</p>
              <p className="display mt-3 text-3xl">Second-skin support.</p>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-7 md:col-start-6">
            <Link href={`/products/${d.slug}`} className="group relative block">
              <Parallax className="aspect-[4/5] bg-graphite sm:aspect-[16/11]" strength={8}>
                <Image
                  src={lifestyle.src}
                  alt={lifestyle.alt}
                  fill
                  sizes="(min-width: 768px) 58vw, 100vw"
                  className="object-cover object-[50%_40%] transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                />
              </Parallax>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/70 to-transparent p-5 text-bone sm:p-8">
                <div>
                  <p className="eyebrow text-bone/60">Gym to street</p>
                  <p className="display mt-2 text-[clamp(2rem,4vw,3.5rem)]">{d.name.replace("BRO'S ", "")}</p>
                </div>
                <span className="label hidden items-center gap-2 sm:flex">
                  {formatPrice(d.price)}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} aria-hidden />
                </span>
              </div>
            </Link>
          </Reveal>
        </div>

        <div className="mt-16 flex justify-center md:mt-24">
          <ButtonLink href="/shop?collection=drop-001" variant="ink" size="lg" icon={<ArrowRight className="size-4" strokeWidth={1.5} />}>
            Shop all of Drop 001
          </ButtonLink>
        </div>
      </div>

      <p aria-hidden className="display-wide pointer-events-none absolute -right-[4vw] top-[38%] -z-10 hidden select-none text-[26vw] leading-none text-ink/[0.035] lg:block">
        001
      </p>
    </section>
  );
}
