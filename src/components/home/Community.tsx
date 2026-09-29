import Image from "next/image";
import { media } from "@/data/media";
import { site } from "@/data/site";
import { Marquee } from "@/components/ui/Marquee";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

const tiles = [
  { image: media.communityTrack, label: "Run", note: "Early laps, empty tracks." },
  { image: media.communityPlates, label: "Lift", note: "Heavy days, done right." },
  { image: media.communityChalk, label: "Grip", note: "Chalk up. Go again." },
  { image: media.communityRest, label: "Recover", note: "Rest is part of the plan." },
];

export function Community() {
  return (
    <section aria-labelledby="community-title" className="overflow-hidden bg-ink py-20 text-bone md:py-32">
      <div className="container-x">
        <SectionHeader
          eyebrow={`Community / ${site.city}`}
          title={["Train with", "the collective."]}
          lead={
            <>
              BRO&rsquo;S is built for people who train. Community sessions across {site.city} are in the works — join the list below to hear
              first.
            </>
          }
          className="mb-12 md:mb-20"
        />
        <span id="community-title" className="sr-only">
          The BRO&rsquo;S collective
        </span>

        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {tiles.map((t, i) => (
            <Reveal as="li" key={t.label} delay={i * 0.08} className={i % 2 === 1 ? "mt-10 md:mt-24" : ""}>
              <figure className="group">
                <div className="relative aspect-[4/5] overflow-hidden bg-graphite">
                  <Image
                    src={t.image.src}
                    alt={t.image.alt}
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover grayscale transition-[transform,filter] duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:grayscale-0"
                  />
                  <span className="absolute left-3 top-3 font-mono text-[0.625rem] text-bone/60">0{i + 1}</span>
                </div>
                <figcaption className="mt-3 flex items-baseline justify-between gap-2">
                  <span className="display text-2xl sm:text-3xl">{t.label}</span>
                  <span className="hidden text-xs text-mist sm:block">{t.note}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>

      <Marquee
        items={["#TRAINWITHBROS", "HYDERABAD", "DROP 001", "MOVE FREE", "TRAIN HARD"]}
        separator="✕"
        duration={50}
        reverse
        className="mt-20 border-y border-line py-5 md:mt-28"
        itemClassName="display-wide text-[clamp(1.75rem,4vw,3.25rem)] text-bone/15"
      />
    </section>
  );
}
