"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useId, type ReactNode } from "react";
import { useDialog } from "@/hooks/use-dialog";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Visually hide the title (still announced). */
  hideTitle?: boolean;
  side?: "right" | "left" | "top" | "bottom";
  className?: string;
  children: ReactNode;
  footer?: ReactNode;
  headerExtra?: ReactNode;
  initialFocus?: string;
}

export function Drawer({ open, onClose, title, hideTitle, side = "right", className, children, footer, headerExtra, initialFocus }: DrawerProps) {
  const titleId = useId();
  const ref = useDialog<HTMLDivElement>(open, onClose, { initialFocus });
  const offscreen =
    side === "right" ? { x: "100%" } : side === "left" ? { x: "-100%" } : side === "top" ? { y: "-100%" } : { y: "100%" };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={offscreen}
            animate={{ x: 0, y: 0 }}
            exit={offscreen}
            transition={{ duration: 0.45, ease: EASE }}
            className={cn(
              "absolute flex flex-col bg-onyx text-bone shadow-2xl outline-none",
              side === "right" && "inset-y-0 right-0 w-full sm:w-[440px] sm:border-l sm:border-line",
              side === "left" && "inset-y-0 left-0 w-full sm:w-[440px]",
              side === "top" && "inset-x-0 top-0 max-h-[100dvh]",
              side === "bottom" && "inset-x-0 bottom-0 max-h-[90dvh]",
              className,
            )}
          >
            <div className="flex h-[var(--nav-h)] shrink-0 items-center justify-between gap-4 border-b border-line px-5 sm:px-6">
              <h2 id={titleId} className={cn("label", hideTitle && "sr-only")}>
                {title}
              </h2>
              {headerExtra}
              <button
                type="button"
                onClick={onClose}
                className="-mr-2 grid size-11 place-items-center text-bone/70 transition-colors hover:text-bone"
                aria-label={`Close ${title.toLowerCase()}`}
              >
                <X className="size-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
            {footer && <div className="shrink-0 border-t border-line">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
