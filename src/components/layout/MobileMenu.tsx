"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, X } from "lucide-react";
import { primaryNav, secondaryNav, site } from "@/data/site";
import { useDialog } from "@/hooks/use-dialog";
import { useUI } from "@/store/ui";
import { InstagramIcon, YouTubeIcon } from "@/components/ui/Icons";
import { Logo } from "@/components/ui/Logo";

const EASE = [0.16, 1, 0.3, 1] as const;

export function MobileMenu() {
  const open = useUI((s) => s.overlay === "menu");
  const close = useUI((s) => s.close);
  const ref = useDialog<HTMLDivElement>(open, close);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          tabIndex={-1}
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.55, ease: EASE }}
          className="fixed inset-0 z-[75] flex flex-col bg-ink text-bone outline-none lg:hidden"
        >
          <div className="container-x flex h-[var(--nav-h)] shrink-0 items-center justify-between border-b border-line">
            <Link href="/" onClick={close} aria-label="BRO'S — home">
              <Logo className="text-[1.375rem]" />
            </Link>
            <button type="button" onClick={close} aria-label="Close menu" className="-mr-2 grid size-11 place-items-center">
              <X className="size-6" strokeWidth={1.25} />
            </button>
          </div>

          <nav aria-label="Mobile" className="container-x flex min-h-0 flex-1 flex-col overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <ul className="py-6">
              {primaryNav.map((item, i) => (
                <li key={item.href} className="overflow-hidden border-b border-line/60">
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.6, ease: EASE, delay: 0.15 + i * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={close}
                      className="group flex items-center justify-between py-3"
                    >
                      <span className="display text-[clamp(2.75rem,14vw,4.5rem)]">{item.label}</span>
                      <span className="font-mono text-xs text-mist">0{i + 1}</span>
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="mt-auto space-y-8"
            >
              <ul className="grid grid-cols-2 gap-x-4">
                {secondaryNav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} onClick={close} className="label flex min-h-12 items-center gap-1 text-bone/75">
                      {item.label}
                      <ArrowUpRight className="size-3.5" strokeWidth={1.5} aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-line pt-6">
                <p className="eyebrow text-mist">Made in {site.city}</p>
                <div className="flex gap-2">
                  <a href={site.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="grid size-11 place-items-center text-bone/75">
                    <InstagramIcon className="size-5" />
                  </a>
                  <a href={site.social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="grid size-11 place-items-center text-bone/75">
                    <YouTubeIcon className="size-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
