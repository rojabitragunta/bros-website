import Image from "next/image";
import { ArrowRight, Droplets, Shirt, ThermometerSnowflake, Wind } from "lucide-react";
import { labSpecs, techPillars } from "@/data/technology";
import { media } from "@/data/media";
import { productImagePath } from "@/lib/catalog-utils";
import { pageMetadata } from "@/lib/seo";
import { ButtonLink } from "@/components/ui/Button";
import { Parallax, Reveal, TextReveal } from "@/components/ui/Reveal";
import { CompositionBar, TechOverlay, TechSpecs } from "@/components/technology/TechSpecs";
import { Airflow, GsmScale, MoistureSpread, SeamDiagram, StretchGrid } from "@/components/technology/TechVisuals";

export const metadata = pageMetadata({
  title: "Fabric & Technology",
  description: "Inside BRO'S Lab — fabric weight, stretch, breathability, moisture management, construction, fit and care.",
  path: "/technology",
  image: media.techKnit,
});

function FitCompare() {
  const items = [
    { label: "Athletic", src: productImagePath("bros-performance-tee", "onyx", "model"), note: "Close through chest and arms" },
    { label: "Oversized", src: productImagePath("bros-oversized-essential-tee", "bone", "model"), note: "Dropped shoulder, boxy body" },
  ];
  return (
    <div className="grid aspect-square grid-cols-2 gap-px border border-line bg-line">
      {items.map((i) => (
        <figure key={i.label} className="relative bg-graphite">
          <Image src={i.src} alt={`${i.label} fit on a form`} fill sizes="(min-width: 1024px) 20vw, 45vw" className="object-cover" />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <span className="label block text-bone">{i.label}</span>
            <span className="text-[0.6875rem] text-bone/70">{i.note}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function CareIcons() {
  const care = [
    { icon: ThermometerSnowflake, label: "Wash cold" },
    { icon: Shirt, label: "Inside out" },
    { icon: Wind, label: "Line dry" },
    { icon: Droplets, label: "No softener" },
  ];
  return (
    <ul className="grid aspect-square grid-cols-2 gap-px border border-line bg-line">
      {care.map((c) => (
        <li key={c.label} className="flex flex-col items-center justify-center gap-3 bg-graphite text-center">
          <c.icon className="size-7 text-bone" strokeWidth={1.25} aria-hidden />
          <span className="label text-bone/80">{c.label}</span>
        </li>
      ))}
    </ul>
  );
}

function FabricMacro() {
  return (
    <div className="relative aspect-square overflow-hidden border border-line">
      <Image src={media.techKnitMoss.src} alt={media.techKnitMoss.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover brightness-75" />
      <TechOverlay />
    </div>
  );
}

const VISUALS: Record<string, React.ReactNode> = {
  fabric: <FabricMacro />,
  gsm: (
    <div className="border border-line bg-graphite p-6 sm:p-8">
      <GsmScale />
    </div>
  ),
  stretch: <StretchGrid />,
  breathability: <Airflow />,
  moisture: <MoistureSpread />,
  construction: <SeamDiagram />,
  fit: <FitCompare />,
  care: <CareIcons />,
};

export default function TechnologyPage() {
  return (
    <div className="bg-ink text-bone">
      <section className="relative -mt-[var(--nav-h)] flex h-[calc(100svh-var(--announce-h))] min-h-[560px] items-end overflow-hidden">
        <Parallax className="absolute inset-0" strength={10}>
          <Image src={media.techKnit.src} alt={media.techKnit.alt} fill preload sizes="100vw" className="object-cover" />
        </Parallax>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-black/30" />
        <div aria-hidden className="hairline-grid absolute inset-0 opacity-40" />
        <div className="container-x relative pb-12 sm:pb-20">
          <p className="eyebrow mb-6 text-bone/60">BRO&rsquo;S Lab / Fabric &amp; Technology</p>
          <TextReveal as="h1" immediate lines={["Engineered", "for performance."]} className="display text-[clamp(3.5rem,12vw,11rem)]" />
          <p className="mt-6 max-w-md text-sm leading-relaxed text-bone/70">
            What goes into the kit, and why. Every number on this page is sample data for the demo catalogue.
          </p>
        </div>
      </section>

      {/* Index */}
      <nav aria-label="Topics" className="sticky top-[var(--nav-h)] z-20 border-y border-line bg-ink/90 backdrop-blur-xl">
        <ol className="no-scrollbar container-x flex gap-6 overflow-x-auto">
          {techPillars.map((p) => (
            <li key={p.id} className="shrink-0">
              <a href={`#${p.id}`} className="label flex h-14 items-center gap-2 text-bone/60 transition-colors hover:text-bone">
                <span className="font-mono text-[0.625rem] text-steel">{p.index}</span>
                {p.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <section aria-labelledby="spec-sheet" className="py-20 md:py-28">
        <div className="container-x grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow mb-4 text-mist">Spec sheet / Performance Tee</p>
            <h2 id="spec-sheet" className="display text-[clamp(2.75rem,6vw,5rem)]">
              The numbers.
            </h2>
            <CompositionBar
              className="mt-10 max-w-sm"
              parts={[
                { material: "Polyester", percent: 88 },
                { material: "Elastane", percent: 12 },
              ]}
            />
          </div>
          <div className="lg:col-span-8">
            <TechSpecs specs={labSpecs} />
          </div>
        </div>
      </section>

      <div className="border-t border-line">
        {techPillars.map((p, i) => (
          <section key={p.id} id={p.id} aria-labelledby={`${p.id}-h`} className="scroll-mt-[calc(var(--nav-h)+3.5rem)] border-b border-line py-16 md:py-24">
            <div className="container-x grid items-center gap-10 md:grid-cols-12 md:gap-12">
              <div className={i % 2 ? "md:order-2 md:col-span-5 md:col-start-8" : "md:col-span-5"}>
                <p className="font-mono text-xs text-steel">{p.index} / 08</p>
                <TextReveal as="h2" lines={[p.title]} className="display mt-4 text-[clamp(2.5rem,12vw,4.5rem)] md:text-[5.2vw] 2xl:text-[5.5rem]" />
                <span id={`${p.id}-h`} className="sr-only">
                  {p.title}
                </span>
                <p className="label mt-6 text-bone/85">{p.lead}</p>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-bone/65 sm:text-base">{p.body}</p>
              </div>
              <Reveal className={i % 2 ? "md:order-1 md:col-span-6" : "md:col-span-6 md:col-start-7"}>
                <div className="mx-auto max-w-[520px]">{VISUALS[p.id]}</div>
              </Reveal>
            </div>
          </section>
        ))}
      </div>

      <section className="py-20 text-center md:py-28">
        <div className="container-x">
          <TextReveal lines={["Feel the difference."]} className="display text-[clamp(3rem,9vw,7rem)]" />
          <ButtonLink href="/products/bros-performance-tee" size="lg" className="mt-10" icon={<ArrowRight className="size-4" strokeWidth={1.5} />}>
            Shop the Performance Tee
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
