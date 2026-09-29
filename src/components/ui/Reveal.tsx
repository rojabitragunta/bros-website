"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Fade/slide in when scrolled into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "article";
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
}

/**
 * Line-by-line masked text reveal. Pass lines as an array so each line
 * slides up from behind its own mask.
 */
export function TextReveal({
  lines,
  className,
  lineClassName,
  delay = 0,
  as = "h2",
  immediate = false,
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p";
  /** Animate on mount rather than on scroll-into-view. */
  immediate?: boolean;
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  // The trigger lives on the (unclipped) heading; lines inherit via variants.
  // Observing the masked lines directly fails: once translated out of their
  // overflow-hidden mask they never intersect the viewport.
  const trigger = immediate ? { animate: "shown" } : { whileInView: "shown", viewport: { once: true, margin: "0px 0px -8% 0px" } };
  return (
    <Tag className={className} initial={reduce ? false : "hidden"} {...trigger}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.06em] -mb-[0.06em]">
          <motion.span
            className={cn("block will-change-transform", lineClassName)}
            variants={{ hidden: { y: "105%" }, shown: { y: "0%" } }}
            transition={{ duration: 0.9, ease: EASE, delay: delay + i * 0.08 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Vertical parallax for a child (usually an image) within its section. */
export function Parallax({ children, className, strength = 12 }: { children: ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div className="absolute inset-[-14%_0]" style={reduce ? undefined : { y }}>
        {children}
      </motion.div>
    </div>
  );
}
