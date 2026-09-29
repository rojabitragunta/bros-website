"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useId, type ReactNode } from "react";
import { useDialog } from "@/hooks/use-dialog";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}

/** Centred dialog on desktop, bottom sheet on mobile. */
export function Modal({ open, onClose, title, eyebrow, children, className }: ModalProps) {
  const titleId = useId();
  const ref = useDialog<HTMLDivElement>(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "relative flex max-h-[92dvh] w-full flex-col overflow-hidden border-line bg-onyx text-bone outline-none sm:max-w-2xl sm:border",
              className,
            )}
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 py-5 sm:px-8">
              <div>
                {eyebrow && <p className="eyebrow mb-2 text-mist">{eyebrow}</p>}
                <h2 id={titleId} className="display text-3xl sm:text-4xl">
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="-mr-2 -mt-1 grid size-11 shrink-0 place-items-center text-bone/70 transition-colors hover:text-bone"
                aria-label="Close dialog"
              >
                <X className="size-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="min-h-0 overflow-y-auto overscroll-contain px-5 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
