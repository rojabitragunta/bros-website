"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface AccordionItem {
  id: string;
  title: string;
  meta?: string;
  content: ReactNode;
}

export function Accordion({
  items,
  defaultOpen,
  className,
  tone = "dark",
}: {
  items: AccordionItem[];
  defaultOpen?: string;
  className?: string;
  tone?: "dark" | "light";
}) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);
  const baseId = useId();
  return (
    <div className={cn("border-t", tone === "dark" ? "border-line" : "border-ink/15", className)}>
      {items.map((item) => {
        const isOpen = open === item.id;
        const panelId = `${baseId}-${item.id}`;
        return (
          <div key={item.id} className={cn("border-b", tone === "dark" ? "border-line" : "border-ink/15")}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : item.id)}
                className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left"
              >
                <span className="label">{item.title}</span>
                <span className="flex items-center gap-4">
                  {item.meta && <span className="font-mono text-[0.6875rem] uppercase tracking-wider opacity-60">{item.meta}</span>}
                  <Plus
                    aria-hidden
                    strokeWidth={1.5}
                    className={cn("size-4 transition-transform duration-300", isOpen && "rotate-45")}
                  />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pb-6 text-sm leading-relaxed opacity-80">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
