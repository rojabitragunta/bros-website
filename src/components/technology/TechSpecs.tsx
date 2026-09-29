"use client";

import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Counts up numeric values ("170", "88%") when scrolled into view. */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const match = value.match(/^(\d+)(.*)$/);
  const [display, setDisplay] = useState(match && !reduce ? `0${match[2]}` : value);

  useEffect(() => {
    if (!match || !inView || reduce) return;
    const target = Number(match[1]);
    const controls = animate(0, target, {
      duration: 1.4,
      ease: EASE,
      onUpdate: (v) => setDisplay(`${Math.round(v)}${match[2]}`),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, value]);

  return (
    <span ref={ref} className={className} aria-label={value}>
      <span aria-hidden>{display}</span>
    </span>
  );
}

export interface Spec {
  value: string;
  unit: string;
  label: string;
  note: string;
}

/** Grid of technical specification cells. */
export function TechSpecs({ specs, className, tone = "dark" }: { specs: Spec[]; className?: string; tone?: "dark" | "light" }) {
  return (
    <dl className={cn("grid grid-cols-2 gap-px lg:grid-cols-3", tone === "dark" ? "bg-line" : "bg-ink/15", className)}>
      {specs.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 0.8, delay: (i % 3) * 0.08 }}
          className={cn("group relative flex min-h-[180px] flex-col justify-between p-4 sm:min-h-[220px] sm:p-6", tone === "dark" ? "bg-ink" : "bg-paper")}
        >
          <div className="flex items-start justify-between gap-2">
            <dt className="eyebrow opacity-50">
              <span className="font-mono">S/{String(i + 1).padStart(2, "0")}</span>
              <span className="mt-1 block">{s.label}</span>
            </dt>
            <span aria-hidden className="mt-1 size-1.5 bg-current opacity-30 transition-opacity group-hover:opacity-100" />
          </div>
          <dd>
            <p className="display text-[clamp(2.25rem,9vw,3.25rem)] leading-none sm:text-[clamp(2.5rem,5vw,3.75rem)] lg:text-[clamp(2.5rem,3.4vw,4rem)]">
              <CountUp value={s.value} />
            </p>
            <p className="label mt-2 opacity-80">{s.unit}</p>
            <p className="mt-3 hidden text-xs leading-relaxed opacity-55 sm:block">{s.note}</p>
          </dd>
          <span
            aria-hidden
            className="absolute bottom-0 left-0 h-px w-0 bg-current transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"
          />
        </motion.div>
      ))}
    </dl>
  );
}

/** Animated composition bar, e.g. 88% polyester / 12% elastane. */
export function CompositionBar({ parts, className }: { parts: { material: string; percent: number }[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className={className}>
      <div className="flex h-2 w-full gap-1" role="img" aria-label={parts.map((p) => `${p.percent}% ${p.material}`).join(", ")}>
        {parts.map((p, i) => (
          <motion.span
            key={p.material}
            className={cn("block h-full", i === 0 ? "bg-bone" : i === 1 ? "bg-mist" : "bg-steel")}
            initial={{ width: 0 }}
            animate={inView ? { width: `${p.percent}%` } : undefined}
            transition={{ duration: 1.4, ease: EASE, delay: 0.2 + i * 0.15 }}
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[0.6875rem] uppercase tracking-wider">
        {parts.map((p, i) => (
          <li key={p.material} className="flex items-center gap-2">
            <span aria-hidden className={cn("size-2", i === 0 ? "bg-bone" : i === 1 ? "bg-mist" : "bg-steel")} />
            {p.percent}% {p.material}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Technical annotation overlay drawn over an image. */
export function TechOverlay() {
  const reduce = useReducedMotion();
  const draw = (delay: number) => ({
    initial: reduce ? false : { pathLength: 0, opacity: 0 },
    whileInView: { pathLength: 1, opacity: 1 },
    viewport: { once: true },
    transition: { duration: 1.4, ease: EASE, delay },
  });
  const label = (delay: number) => ({
    initial: reduce ? false : { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { duration: 0.6, delay },
  });
  return (
    <svg aria-hidden viewBox="0 0 400 500" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full text-bone">
      <motion.circle cx="200" cy="230" r="70" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="3 4" {...draw(0.2)} />
      <motion.circle cx="200" cy="230" r="3" fill="currentColor" {...label(0.8)} />
      <motion.path d="M200 160 L200 60 L258 60" fill="none" stroke="currentColor" strokeWidth="0.6" {...draw(0.5)} />
      <motion.path d="M130 230 L40 230 L40 380" fill="none" stroke="currentColor" strokeWidth="0.6" {...draw(0.7)} />
      <motion.path d="M250 280 L330 380 L370 380" fill="none" stroke="currentColor" strokeWidth="0.6" {...draw(0.9)} />
      <motion.path d="M20 470 L380 470 M20 464 L20 476 M380 464 L380 476" fill="none" stroke="currentColor" strokeWidth="0.6" {...draw(1.1)} />
      <motion.g {...label(1.3)} fontFamily="var(--font-geist-mono)" fontSize="9" letterSpacing="1.5" fill="currentColor">
        <text x="264" y="63">KNIT / INTERLOCK</text>
        <text x="46" y="395">LOOP DENSITY</text>
        <text x="300" y="396">4-WAY</text>
        <text x="200" y="462" textAnchor="middle" opacity="0.7">SAMPLE — 10 MM</text>
      </motion.g>
    </svg>
  );
}
