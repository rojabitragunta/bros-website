"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { announcement } from "@/data/site";

export function AnnouncementBar() {
  const [i, setI] = useState(0);
  const { messages } = announcement;

  useEffect(() => {
    if (messages.length < 2) return;
    const id = setInterval(() => setI((n) => (n + 1) % messages.length), 4000);
    return () => clearInterval(id);
  }, [messages.length]);

  if (!announcement.enabled) return null;

  return (
    <div className="relative z-50 h-[var(--announce-h)] border-b border-white/[0.06] bg-ink text-bone">
      <Link
        href={announcement.href}
        className="container-x flex h-full items-center justify-center font-mono text-[0.625rem] uppercase tracking-[0.22em] text-bone/80 transition-colors hover:text-bone sm:text-[0.6875rem]"
      >
        {/* Desktop: all messages inline */}
        <span className="hidden items-center gap-4 md:flex">
          {messages.map((m, idx) => (
            <span key={m} className="flex items-center gap-4">
              {idx > 0 && <span aria-hidden className="size-1 rounded-full bg-bone/40" />}
              {m}
            </span>
          ))}
        </span>
        {/* Mobile: rotate */}
        <span className="relative h-4 w-full overflow-hidden md:hidden" aria-live="off">
          <span className="sr-only">{messages.join(" • ")}</span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              aria-hidden
              key={i}
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 text-center"
            >
              {messages[i]}
            </motion.span>
          </AnimatePresence>
        </span>
      </Link>
    </div>
  );
}
