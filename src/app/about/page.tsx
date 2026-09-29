import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { media } from "@/data/media";
import { site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";
import { ButtonLink } from "@/components/ui/Button";
import { Marquee } from "@/components/ui/Marquee";
import { Parallax, Reveal, TextReveal } from "@/components/ui/Reveal";

export const metadata = pageMetadata({
  title: "About — Hyderabad-born performance",
  description: "BRO'S is a Hyderabad-born performance activewear label built around movement, training, craft, fabric and community.",
  path: "/about",
});

const pillars = [
  { title: "Movement", body: "Everything starts with how the body moves. We design for squats, sprints, presses and the walk home — not for the hanger.", image: media.lookMove },
  { title: "Training", body: "Built for people who show up. Kit that stays out of the way so the session gets all your attention.", image: media.lookTrain },
  { title: "Craft", body: "Flatlock seams, bonded necklines, considered hems. Small details that add up to garments you reach for first.", image: media.techKnitBone },
  { title: "Fabric", body: "We choose knits for how they stretch, recover, breathe and dry — and we tell you exactly what's in them.", image: media.techKnitMoss },
  { title: "Community", body: `Made in ${site.city} for everyone who trains. The people who wear BRO'S shape what comes next.`, image: media.communityTrack },
];

export default function AboutPage() {
  return (
    <div className="bg-ink text-bone">
      {/* Hero */}
      <section className="relative -mt-[var(--nav-h)] flex h-[calc(100svh-var(--announce-h))] min-h-[560px] items-end overflow-hidden">
        <Image src={media.aboutArches.src} alt={media.aboutArches.alt} fill preload sizes="100vw" className="object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-black/40" />
        <div className="container-x relative pb-12 sm:pb-20">
          <p className="eyebrow mb-6 text-bone/60">About / {site.city}</p>
          <TextReveal as="h1" immediate lines={["Born in", site.city + "."]} className="display text-[clamp(3.75rem,14vw,12rem)]" />
          <p className="label mt-6 text-bone/70 md:text-sm">Built for movement.</p>
        </div>
      </section>

      {/* Manifesto */}
      <section aria-label="Manifesto" className="on-light bg-paper py-24 text-ink md:py-40">
        <div className="container-x grid gap-10 md:grid-cols-12">
          <p className="eyebrow text-ink/50 md:col-span-3">Manifesto</p>
          <div className="md:col-span-9">
            <Reveal>
              <p className="text-[clamp(1.75rem,4vw,3.5rem)] font-medium leading-[1.1] tracking-[-0.02em]">
                BRO&rsquo;S is a performance label from {site.city}. We make training kit with the discipline of sportswear and the restraint of
                good design — <span className="text-ink/40">fewer pieces, better fabric, honest specs.</span>
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-10 max-w-xl text-sm leading-relaxed text-ink/65 sm:text-base">
                Drop 001 is where it starts: tees, tanks, shorts, joggers and training essentials for men and women, engineered to move with you
                from the first rep to the rest of your day.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <Marquee
        items={["MOVEMENT", "TRAINING", "CRAFT", "FABRIC", "COMMUNITY"]}
        className="border-b border-line py-5"
        itemClassName="display-wide text-[clamp(1.75rem,4vw,3rem)] text-bone/70"
      />

      {/* Pillars */}
      <section aria-labelledby="pillars" className="py-20 md:py-32">
        <h2 id="pillars" className="sr-only">
          What we stand for
        </h2>
        <ol className="container-x space-y-20 md:space-y-32">
          {pillars.map((p, i) => (
            <li key={p.title} className="grid items-center gap-8 md:grid-cols-12 md:gap-10">
              <Reveal className={i % 2 ? "md:order-2 md:col-span-6 md:col-start-7" : "md:col-span-6"}>
                <Parallax className="aspect-[4/5] bg-graphite sm:aspect-[5/4]" strength={8}>
                  <Image src={p.image.src} alt={p.image.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                </Parallax>
              </Reveal>
              <div className={i % 2 ? "md:order-1 md:col-span-5 md:col-start-1" : "md:col-span-5 md:col-start-8"}>
                <p className="font-mono text-xs text-steel">0{i + 1} / 05</p>
                <TextReveal lines={[p.title]} as="h3" className="display mt-4 text-[clamp(3rem,8vw,6.5rem)]" />
                <p className="mt-6 max-w-md text-sm leading-relaxed text-bone/70 sm:text-base">{p.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-line py-20 text-center md:py-32">
        <div className="container-x">
          <TextReveal lines={["Move with us."]} className="display text-[clamp(3rem,10vw,8rem)]" />
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/shop?collection=drop-001" size="lg" icon={<ArrowRight className="size-4" strokeWidth={1.5} />}>
              Shop Drop 001
            </ButtonLink>
            <ButtonLink href="/technology" size="lg" variant="outline">
              Our fabrics
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
