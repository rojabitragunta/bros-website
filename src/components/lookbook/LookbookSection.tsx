"use client";

import { getImageProps } from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import type { LookbookChapter } from "@/data/lookbook";
import { useCatalog } from "@/store/catalog";
import { cn } from "@/lib/utils";
import { TextReveal } from "@/components/ui/Reveal";

function ArtDirected({ chapter }: { chapter: LookbookChapter }) {
  const { image, imageTall } = chapter;
  const common = { alt: image.alt, sizes: "100vw", quality: 70 } as const;
  const wide = getImageProps({ ...common, src: image.src, width: image.width, height: image.height }).props;
  const { srcSet: tall, ...rest } = getImageProps({ ...common, src: imageTall.src, width: imageTall.width, height: imageTall.height }).props;
  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={wide.srcSet} />
      <source media="(max-width: 767px)" srcSet={tall} />
      <img {...rest} loading="lazy" className="absolute inset-0 size-full object-cover" />
    </picture>
  );
}

/** One cinematic full-bleed chapter panel. */
export function LookbookPanel({ chapter, headingLevel = "h3" }: { chapter: LookbookChapter; headingLevel?: "h2" | "h3" }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.15, 1.05, 1.12]);
  const all = useCatalog().products;
  const products = chapter.products.map((s) => all.find((p) => p.slug === s)).filter(Boolean);

  return (
    <article ref={ref} aria-label={chapter.headline} className="relative h-[92svh] min-h-[560px] overflow-hidden bg-ink text-bone">
      <motion.div className="absolute inset-[-10%_0]" style={reduce ? undefined : { y, scale }}>
        <ArtDirected chapter={chapter} />
      </motion.div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40" />

      <div
        className={cn(
          "container-x relative flex h-full flex-col justify-end pb-10 sm:pb-16",
          chapter.align === "right" && "items-end text-right",
          chapter.align === "center" && "items-center justify-center pb-0 text-center sm:pb-0",
        )}
      >
        <p className="eyebrow mb-5 text-bone/60">{chapter.kicker}</p>
        <TextReveal
          as={headingLevel}
          lines={chapter.headline.split(/(?<=\.)\s|\s(?=Outside)/)}
          className={cn("display max-w-[14ch] text-[clamp(4rem,14vw,13rem)] leading-[0.82]", chapter.align === "center" && "mx-auto")}
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className={cn("mt-8 flex max-w-md flex-col gap-5", chapter.align === "right" && "items-end", chapter.align === "center" && "items-center")}
        >
          <p className="text-sm leading-relaxed text-bone/75 sm:text-base">{chapter.body}</p>
          <ul className={cn("flex flex-wrap gap-2", chapter.align === "right" && "justify-end", chapter.align === "center" && "justify-center")}>
            {products.map((p) => (
              <li key={p!.id}>
                <Link
                  href={`/products/${p!.slug}`}
                  className="label group inline-flex h-10 items-center gap-2 border border-bone/30 bg-black/20 px-4 backdrop-blur-sm transition-colors hover:border-bone hover:bg-bone hover:text-ink"
                >
                  {p!.name.replace("BRO'S ", "")}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <span aria-hidden className="absolute right-4 top-6 font-mono text-xs text-bone/50 sm:right-10 sm:top-10">
        {chapter.index} / 03
      </span>
    </article>
  );
}
