"use client";

import { getImageProps } from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { media } from "@/data/media";
import { ButtonLink } from "@/components/ui/Button";

const EASE = [0.16, 1, 0.3, 1] as const;

function HeroPicture() {
  const common = { alt: media.heroWide.alt, sizes: "100vw", quality: 75, preload: true } as const;
  const {
    props: { srcSet: wide },
  } = getImageProps({ ...common, src: media.heroWide.src, width: media.heroWide.width, height: media.heroWide.height });
  const {
    props: { srcSet: tall, ...rest },
  } = getImageProps({ ...common, src: media.heroTall.src, width: media.heroTall.width, height: media.heroTall.height });
  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={wide} />
      <source media="(max-width: 767px)" srcSet={tall} />
      <img {...rest} className="absolute inset-0 size-full object-cover object-[50%_60%] md:object-[70%_50%]" />
    </picture>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

  return (
    <section
      ref={ref}
      aria-labelledby="hero-title"
      className="relative -mt-[var(--nav-h)] h-[calc(100svh-var(--announce-h))] min-h-[560px] overflow-hidden bg-ink md:min-h-[640px]"
    >
      <motion.div className="absolute inset-0" style={reduce ? undefined : { y }}>
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { scale: 1.14, opacity: 0 }}
          animate={{ scale: 1.04, opacity: 1 }}
          transition={{ duration: 2.4, ease: EASE }}
        >
          <HeroPicture />
        </motion.div>
      </motion.div>

      {/* Legibility gradients */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/30" />
      <div aria-hidden className="absolute inset-0 hidden bg-gradient-to-r from-black/70 via-black/10 to-transparent md:block" />

      <motion.div
        className="container-x relative flex h-full flex-col justify-end pb-8 pt-[calc(var(--nav-h)+1.5rem)] sm:pb-12 lg:pb-14"
        style={reduce ? undefined : { y: textY, opacity: fade }}
      >
        <motion.div
          className="mb-auto flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <p className="eyebrow flex items-center gap-3 text-bone/70">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-bone/60 motion-reduce:hidden" />
              <span className="relative inline-flex size-1.5 rounded-full bg-bone" />
            </span>
            Drop 001 — Now live
          </p>
          <p className="eyebrow hidden text-bone/50 sm:block">Hyderabad / 17.38° N</p>
        </motion.div>

        <h1 id="hero-title" className="sr-only">
          BRO&rsquo;S Drop 001 — Engineered for movement.
        </h1>

        <div aria-hidden className="overflow-hidden">
          <motion.p
            className="display-wide text-[23vw] leading-[0.8] tracking-[-0.045em] text-bone md:text-[17.5vw] 2xl:text-[16.5vw]"
            initial={reduce ? false : { y: "100%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
          >
            BRO&rsquo;S
          </motion.p>
        </div>

        <div className="mt-6 grid gap-6 md:mt-8 md:grid-cols-[1fr_auto] md:items-end">
          <div aria-hidden className="overflow-hidden">
            <motion.div
              initial={reduce ? false : { y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.45 }}
              className="flex flex-wrap items-baseline gap-x-5 gap-y-1"
            >
              <span className="display text-[clamp(2.25rem,6vw,5rem)] text-bone">Drop 001</span>
              <span className="label text-bone/70 md:text-sm">Engineered for movement.</span>
            </motion.div>
          </div>
          <motion.div
            className="grid grid-cols-2 gap-2 sm:flex sm:gap-3"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.7 }}
          >
            <ButtonLink href="/shop?category=men" size="lg" icon={<ArrowRight className="size-4" strokeWidth={1.5} />}>
              Shop Men
            </ButtonLink>
            <ButtonLink href="/shop?category=women" size="lg" variant="outline" icon={<ArrowRight className="size-4" strokeWidth={1.5} />}>
              Shop Women
            </ButtonLink>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
