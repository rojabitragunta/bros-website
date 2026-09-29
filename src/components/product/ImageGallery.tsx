"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { ImageView, ProductImage } from "@/types";

const LABEL: Record<ImageView | "video", string> = {
  front: "Front",
  back: "Back",
  side: "Side",
  detail: "Detail",
  lifestyle: "Lifestyle",
  model: "Model",
  video: "Video",
};

type Slide = { kind: "image"; image: ProductImage } | { kind: "video"; poster: ProductImage };

function VideoSlide({ poster, sizes }: { poster: ProductImage; sizes: string }) {
  const [clicked, setClicked] = useState(false);
  return (
    <div className="absolute inset-0 bg-ink">
      <Image src={poster.src} alt="" fill sizes={sizes} className="object-cover opacity-60" />
      <div className="absolute inset-0 grid place-items-center">
        <button
          type="button"
          onClick={() => setClicked(true)}
          className="group flex flex-col items-center gap-4 text-bone"
          aria-label="Play product video (placeholder)"
        >
          <span className="grid size-20 place-items-center rounded-full border border-bone/40 bg-black/30 backdrop-blur transition-transform duration-500 group-hover:scale-110">
            <Play className="ml-1 size-6 fill-current" strokeWidth={1} aria-hidden />
          </span>
          <span className="label">{clicked ? "Campaign film coming soon" : "Watch in motion"}</span>
        </button>
      </div>
      <span className="eyebrow absolute bottom-4 left-4 text-bone/60">Video placeholder</span>
    </div>
  );
}

export function ImageGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const lifestyle = images.find((i) => i.view === "lifestyle") ?? images[0];
  const slides: Slide[] = [...images.map((image) => ({ kind: "image" as const, image })), { kind: "video", poster: lifestyle }];
  const [index, setIndex] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const count = slides.length;

  // Reset when the colourway (image set) changes.
  const key = images[0]?.src;
  useEffect(() => {
    setIndex(0);
    scroller.current?.scrollTo({ left: 0 });
  }, [key]);

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  // Mobile: sync index with native swipe position
  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) setIndex(i);
  };
  const scrollTo = (i: number) => {
    const el = scroller.current;
    el?.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  const renderSlide = (s: Slide, sizes: string, preload = false) =>
    s.kind === "image" ? (
      <Image src={s.image.src} alt={s.image.alt} fill sizes={sizes} preload={preload} className="object-cover" />
    ) : (
      <VideoSlide poster={s.poster} sizes={sizes} />
    );

  return (
    <div aria-roledescription="carousel" aria-label={`${name} images`}>
      {/* Mobile: native swipe */}
      <div className="relative md:hidden">
        <div
          ref={scroller}
          onScroll={onScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
          tabIndex={0}
          aria-label="Swipe for more images"
        >
          {slides.map((s, i) => (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}: ${LABEL[s.kind === "image" ? s.image.view : "video"]}`}
              className="relative aspect-[4/5] w-full shrink-0 snap-center bg-[#e4e2dd]"
            >
              {renderSlide(s, "100vw", i === 0)}
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
          <span className="rounded-full bg-black/55 px-3 py-1 font-mono text-[0.6875rem] text-bone backdrop-blur">
            {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <span key={i} className={cn("h-1 rounded-full bg-ink/60 transition-all duration-300", i === index ? "w-5 bg-ink" : "w-1")} />
            ))}
          </div>
        </div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 pt-3" role="tablist" aria-label="Choose image">
          {slides.map((s, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={LABEL[s.kind === "image" ? s.image.view : "video"]}
              onClick={() => scrollTo(i)}
              className={cn("relative h-16 w-[52px] shrink-0 overflow-hidden bg-[#e4e2dd] transition-opacity", i === index ? "opacity-100 ring-1 ring-bone" : "opacity-50")}
            >
              {s.kind === "image" ? (
                <Image src={s.image.src} alt="" fill sizes="52px" className="object-cover" />
              ) : (
                <span className="grid size-full place-items-center bg-graphite">
                  <Play className="size-4 text-bone" strokeWidth={1.5} aria-hidden />
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: thumbs + stage */}
      <div className="hidden gap-4 md:grid md:grid-cols-[72px_1fr] lg:grid-cols-[84px_1fr]">
        <div className="flex flex-col gap-2" role="tablist" aria-label="Choose image" aria-orientation="vertical">
          {slides.map((s, i) => {
            const label = LABEL[s.kind === "image" ? s.image.view : "video"];
            return (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={label}
                onClick={() => go(i)}
                className="group text-left"
              >
                <span className={cn("relative block aspect-[4/5] overflow-hidden bg-[#e4e2dd] transition-opacity duration-300", i === index ? "opacity-100" : "opacity-45 group-hover:opacity-80")}>
                  {s.kind === "image" ? (
                    <Image src={s.image.src} alt="" fill sizes="84px" className="object-cover" />
                  ) : (
                    <span className="grid size-full place-items-center bg-graphite">
                      <Play className="size-4 text-bone" strokeWidth={1.5} aria-hidden />
                    </span>
                  )}
                </span>
                <span className={cn("mt-1 block font-mono text-[0.5625rem] uppercase tracking-wider transition-colors", i === index ? "text-bone" : "text-steel")}>{label}</span>
              </button>
            );
          })}
        </div>

        <div
          className="group/stage relative aspect-[4/5] max-h-[calc(100svh-var(--nav-h)-3rem)] w-full overflow-hidden bg-[#e4e2dd]"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(index + 1);
            if (e.key === "ArrowLeft") go(index - 1);
          }}
          tabIndex={0}
          aria-label={`Image ${index + 1} of ${count}. Use arrow keys to navigate.`}
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={`${key}-${index}`}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderSlide(slides[index], "(min-width: 1024px) 55vw, 70vw", index === 0)}
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4 opacity-0 transition-opacity duration-300 group-hover/stage:opacity-100 group-focus-within/stage:opacity-100">
            <button type="button" onClick={() => go(index - 1)} aria-label="Previous image" className="grid size-11 place-items-center bg-bone/90 text-ink hover:bg-bone">
              <ChevronLeft className="size-5" strokeWidth={1.5} />
            </button>
            <span className="font-mono text-xs text-ink/70">
              {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
            <button type="button" onClick={() => go(index + 1)} aria-label="Next image" className="grid size-11 place-items-center bg-bone/90 text-ink hover:bg-bone">
              <ChevronRight className="size-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
