import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { media } from "@/data/media";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "404 — Missed the rep", robots: { index: false } };

export default function NotFound() {
  return (
    <section className="relative -mt-[var(--nav-h)] flex min-h-[calc(100svh-var(--announce-h))] items-end overflow-hidden bg-ink pt-[var(--nav-h)] text-bone">
      <Image src={media.lookTrain.src} alt="" fill sizes="100vw" className="object-cover opacity-40" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />
      <div className="container-x relative pb-12 sm:pb-20">
        <p aria-hidden className="display-wide select-none text-[38vw] leading-[0.75] tracking-[-0.06em] text-bone/[0.08] md:text-[30vw]">
          404
        </p>
        <div className="-mt-[8vw] max-w-2xl">
          <p className="eyebrow mb-4 text-mist">Error 404 / Page not found</p>
          <h1 className="display text-[clamp(3.5rem,12vw,9rem)]">Missed the rep.</h1>
          <p className="mt-5 text-sm text-mist sm:text-base">The page you&rsquo;re looking for doesn&rsquo;t exist.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/shop" size="lg" icon={<ArrowRight className="size-4" strokeWidth={1.5} />}>
              Back to shop
            </ButtonLink>
            <ButtonLink href="/" size="lg" variant="outline">
              Home
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
