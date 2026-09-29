"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { gsmScale } from "@/data/technology";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Horizontal GSM bars across the demo range. */
export function GsmScale() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const max = 320;
  return (
    <div ref={ref} className="space-y-5" role="list" aria-label="Fabric weight by product (sample data)">
      {gsmScale.map((g, i) => (
        <div key={g.name} role="listitem" className="grid grid-cols-[1fr_auto] items-end gap-x-4 gap-y-2">
          <p className="text-sm">
            {g.name} <span className="text-xs text-steel">— {g.use}</span>
          </p>
          <p className="font-mono text-sm tabular-nums">{g.gsm} GSM</p>
          <div className="col-span-2 h-1.5 bg-line">
            <motion.div
              className="h-full bg-bone"
              initial={{ width: 0 }}
              animate={inView ? { width: `${(g.gsm / max) * 100}%` } : undefined}
              transition={{ duration: 1.2, ease: EASE, delay: i * 0.1 }}
            />
          </div>
        </div>
      ))}
      <div className="flex justify-between border-t border-line pt-3 font-mono text-[0.625rem] uppercase tracking-wider text-steel">
        <span>Light</span>
        <span>Heavy</span>
      </div>
    </div>
  );
}

/** A mesh grid that breathes in four directions. */
export function StretchGrid() {
  const reduce = useReducedMotion();
  const lines = Array.from({ length: 9 }, (_, i) => i * 12.5);
  return (
    <div className="relative grid aspect-square place-items-center overflow-hidden border border-line bg-graphite" aria-hidden>
      <motion.svg
        viewBox="0 0 100 100"
        className="size-[62%] text-bone"
        animate={reduce ? undefined : { scaleX: [1, 1.28, 1, 1, 1], scaleY: [1, 1, 1, 1.28, 1] }}
        transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
      >
        {lines.map((p) => (
          <g key={p}>
            <line x1={p} y1="0" x2={p} y2="100" stroke="currentColor" strokeWidth="0.4" opacity="0.6" />
            <line x1="0" y1={p} x2="100" y2={p} stroke="currentColor" strokeWidth="0.4" opacity="0.6" />
          </g>
        ))}
        <rect x="0" y="0" width="100" height="100" fill="none" stroke="currentColor" strokeWidth="1" />
      </motion.svg>
      {["top-4 left-1/2 -translate-x-1/2", "bottom-4 left-1/2 -translate-x-1/2", "left-4 top-1/2 -translate-y-1/2", "right-4 top-1/2 -translate-y-1/2"].map((pos, i) => (
        <span key={pos} className={cn("absolute font-mono text-[0.625rem] text-mist", pos)}>
          {["↑ Warp", "↓ Warp", "← Weft", "Weft →"][i]}
        </span>
      ))}
    </div>
  );
}

/** Particles passing through an open knit. */
export function Airflow() {
  const reduce = useReducedMotion();
  return (
    <div className="relative aspect-square overflow-hidden border border-line bg-graphite" aria-hidden>
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full text-bone">
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={42 + i * 3.2} y1="8" x2={42 + i * 3.2} y2="92" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <motion.circle
            key={i}
            r="0.9"
            cy={16 + i * 11}
            fill="currentColor"
            initial={{ cx: 6, opacity: 0 }}
            animate={reduce ? { cx: 30, opacity: 0.8 } : { cx: [6, 94], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "linear", delay: i * 0.45 }}
          />
        ))}
      </svg>
      <span className="absolute bottom-4 left-4 font-mono text-[0.625rem] text-mist">Air → open knit → out</span>
    </div>
  );
}

/** A droplet spreading across the fabric surface. */
export function MoistureSpread() {
  const reduce = useReducedMotion();
  return (
    <div className="relative grid aspect-square place-items-center overflow-hidden border border-line bg-graphite" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute size-1/2 rounded-full border border-bone/50"
          initial={{ scale: 0.2, opacity: 0.8 }}
          animate={reduce ? { scale: 0.8, opacity: 0.4 } : { scale: [0.2, 1.6], opacity: [0.8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: i }}
        />
      ))}
      <span className="size-3 rounded-full bg-bone" />
      <span className="absolute bottom-4 left-4 font-mono text-[0.625rem] text-mist">Wick → spread → evaporate</span>
    </div>
  );
}

/** Cross-section: flatlock vs. standard seam. */
export function SeamDiagram() {
  return (
    <div className="grid aspect-square grid-rows-2 border border-line bg-graphite" aria-hidden>
      {[
        { label: "Standard seam", flat: false },
        { label: "Flatlock seam", flat: true },
      ].map((s) => (
        <div key={s.label} className="relative flex items-center justify-center border-b border-line last:border-0">
          <svg viewBox="0 0 120 40" className="w-3/4 text-bone">
            <line x1="0" y1="24" x2={s.flat ? 60 : 56} y2="24" stroke="currentColor" strokeWidth="2.4" />
            <line x1={s.flat ? 60 : 64} y1="24" x2="120" y2="24" stroke="currentColor" strokeWidth="2.4" />
            {s.flat ? (
              <path d="M52 24 q4 -5 8 0 t8 0" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1.5" />
            ) : (
              <path d="M56 24 L56 10 M64 24 L64 10 M56 10 q4 -4 8 0" fill="none" stroke="currentColor" strokeWidth="2.4" />
            )}
          </svg>
          <span className="absolute bottom-3 left-4 font-mono text-[0.625rem] text-mist">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
