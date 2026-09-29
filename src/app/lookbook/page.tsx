import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { LookbookPanel } from "@/components/lookbook/LookbookSection";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal, TextReveal } from "@/components/ui/Reveal";
import { lookbookChapters, lookbookGallery } from "@/data/lookbook";
import { media } from "@/data/media";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Lookbook — Campaign 001",
  description: "Train hard. Move free. Live outside the gym. The BRO'S Drop 001 campaign.",
  path: "/lookbook",
  image: media.lookTrain,
});

export default function LookbookPage() {
  return (
    <div className="bg-ink text-bone">
      {/* Title card */}
      <section className="relative -mt-[var(--nav-h)] flex min-h-[calc(100svh-var(--announce-h))] flex-col justify-between overflow-hidden pt-[calc(var(--nav-h)+2rem)]">
        <Image src={media.lookGraphite.src} alt="" fill preload sizes="100vw" className="object-cover opacity-50" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-ink" />
        <div className="container-x relative flex items-center justify-between">
          <p className="eyebrow text-bone/60">Lookbook</p>
          <nav aria-label="Chapters">
            <ol className="flex gap-4 font-mono text-xs">
              {lookbookChapters.map((c) => (
                <li key={c.id}>
                  <a href={`#${c.id}`} className="inline-flex min-h-11 items-center text-bone/60 transition-colors hover:text-bone">
                    {c.index}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
        <div className="container-x relative pb-12 sm:pb-20">
          <p className="eyebrow mb-4 text-bone/60">Campaign 001 / Drop 001</p>
          <TextReveal as="h1" immediate lines={["Train hard.", "Move free."]} className="display text-[clamp(4rem,15vw,14rem)] leading-[0.82]" />
          <p className="mt-6 max-w-sm text-sm text-bone/70">Three chapters, one idea: kit that moves the way you do.</p>
        </div>
      </section>

      <div className="space-y-2">
        {lookbookChapters.map((c) => (
          <div key={c.id} id={c.id} className="scroll-mt-[var(--nav-h)]">
            <LookbookPanel chapter={c} headingLevel="h2" />
          </div>
        ))}
      </div>

      {/* Gallery */}
      <section aria-labelledby="gallery-title" className="bg-[#141414] py-20 md:py-32">
        <div className="container-x">
          <div className="mb-12 flex items-end justify-between gap-6 md:mb-20">
            <h2 id="gallery-title" className="display text-[clamp(3rem,9vw,7rem)]">
              Frames.
            </h2>
            <p className="eyebrow text-mist">06 images</p>
          </div>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-12 md:gap-4">
            {lookbookGallery.map((g, i) => (
              <Reveal
                as="li"
                key={g.image.src}
                delay={(i % 3) * 0.06}
                className={cn(
                  g.span === "wide" ? "col-span-2 md:col-span-8" : "col-span-1 md:col-span-4",
                  i === 2 && "md:mt-24",
                )}
              >
                <figure className="group">
                  <div className={cn("relative overflow-hidden bg-graphite", g.span === "wide" ? "aspect-[16/10]" : "aspect-[4/5]")}>
                    <Image
                      src={g.image.src}
                      alt={g.image.alt}
                      fill
                      sizes={g.span === "wide" ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 768px) 33vw, 50vw"}
                      className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                    />
                  </div>
                  <figcaption className="mt-3 flex gap-3 text-xs text-mist">
                    <span className="font-mono text-steel">{String(i + 1).padStart(2, "0")}</span>
                    {g.caption}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-20 text-center md:py-28">
        <TextReveal lines={["Live outside the gym."]} className="display container-x text-[clamp(2.75rem,9vw,7rem)]" />
        <ButtonLink href="/shop?collection=drop-001" size="lg" className="mt-10" icon={<ArrowRight className="size-4" strokeWidth={1.5} />}>
          Shop the campaign
        </ButtonLink>
      </section>
    </div>
  );
}
