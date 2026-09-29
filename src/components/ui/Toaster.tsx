"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useUI } from "@/store/ui";

export function Toaster() {
  const toasts = useUI((s) => s.toasts);
  const dismiss = useUI((s) => s.dismiss);
  const open = useUI((s) => s.open);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex flex-col items-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-end sm:p-6"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, transition: { duration: 0.2 } }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm items-center gap-4 border border-line bg-onyx/95 p-3 pr-2 text-bone shadow-2xl backdrop-blur"
          >
            {t.image && (
              <div className="relative h-16 w-[52px] shrink-0 overflow-hidden bg-[#e4e2dd]">
                <Image src={t.image} alt="" fill sizes="52px" className="object-cover" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="label truncate">{t.title}</p>
              {t.description && <p className="mt-1 truncate text-xs text-mist">{t.description}</p>}
              {t.action &&
                (t.action.href ? (
                  <Link href={t.action.href} className="mt-2 inline-block text-xs underline underline-offset-4" onClick={() => dismiss(t.id)}>
                    {t.action.label}
                  </Link>
                ) : t.action.overlay ? (
                  <button
                    type="button"
                    className="mt-2 text-xs underline underline-offset-4"
                    onClick={() => {
                      open(t.action!.overlay!);
                      dismiss(t.id);
                    }}
                  >
                    {t.action.label}
                  </button>
                ) : null)}
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismiss(t.id)}
              className="grid size-10 shrink-0 place-items-center text-mist hover:text-bone"
            >
              <X className="size-4" strokeWidth={1.5} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
