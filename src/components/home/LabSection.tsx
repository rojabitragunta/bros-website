import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { labSpecs } from "@/data/technology";
import { media } from "@/data/media";
import { ButtonLink } from "@/components/ui/Button";
import { Parallax, TextReveal } from "@/components/ui/Reveal";
import { CompositionBar, TechOverlay, TechSpecs } from "@/components/technology/TechSpecs";

export function LabSection() {
  return (
    <section aria-labelledby="lab-title" className="relative overflow-hidden bg-ink py-20 text-bone md:py-32">
      <div aria-hidden className="hairline-grid absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      <div className="container-x relative">
        <div className="mb-12 flex flex-col gap-6 md:mb-20 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-4 flex items-center gap-3 text-mist">
              <span aria-hidden className="h-px w-8 bg-mist" /> R&amp;D / Fabric programme
            </p>
            <TextReveal as="h2" lines={["BRO’S Lab"]} className="display-wide text-[clamp(3rem,11vw,10rem)] leading-[0.85]" />
            <span id="lab-title" className="sr-only">
              BRO&rsquo;S Lab — engineered for performance
            </span>
            <p className="label mt-5 text-bone/70 md:text-sm">Engineered for performance.</p>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-mist">
            We start with the knit, then build the garment around how it moves. Here&rsquo;s what goes into the Performance Tee.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
              <div className="relative">
                <Parallax className="aspect-[4/5] bg-graphite" strength={6}>
                  <Image src={media.techKnitBone.src} alt={media.techKnitBone.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover brightness-[0.55] grayscale" />
                </Parallax>
                <TechOverlay />
              </div>
              <div className="mt-4 flex items-center justify-between font-mono text-[0.625rem] uppercase tracking-[0.16em] text-steel">
                <span>Fig. 01 — Interlock knit, macro</span>
                <span>×40</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <TechSpecs specs={labSpecs} />
            <div className="mt-px grid gap-px bg-line sm:grid-cols-[1.4fr_1fr]">
              <div className="bg-ink p-5 sm:p-6">
                <p className="eyebrow mb-5 text-mist">Composition</p>
                <CompositionBar
                  parts={[
                    { material: "Polyester", percent: 88 },
                    { material: "Elastane", percent: 12 },
                  ]}
                />
              </div>
              <div className="flex flex-col justify-between gap-6 bg-ink p-5 sm:p-6">
                <p className="text-xs leading-relaxed text-steel">
                  Specifications shown are sample product data for the demo Performance Tee and are for illustration only.
                </p>
                <ButtonLink href="/technology" variant="outline" icon={<ArrowRight className="size-4" strokeWidth={1.5} />}>
                  Explore the tech
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
