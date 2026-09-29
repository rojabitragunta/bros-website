"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Heart, Search, ShoppingBag, User } from "lucide-react";
import { primaryNav } from "@/data/site";
import { useScrolled } from "@/hooks/use-scrolled";
import { cn } from "@/lib/utils";
import { selectCount, useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { useWishlist } from "@/store/wishlist";
import { Logo } from "@/components/ui/Logo";

/** Routes whose first section is a full-bleed dark image the nav can overlay. */
const OVERLAY_ROUTES = ["/", "/lookbook", "/about", "/technology"];

function Count({ n, className }: { n: number; className?: string }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {n > 0 && (
        <motion.span
          key={n}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 8, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn("font-mono text-[0.625rem] tabular-nums", className)}
        >
          {n}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const scrolled = useScrolled(12);
  const overlay = OVERLAY_ROUTES.includes(pathname);
  const solid = scrolled || !overlay;
  const open = useUI((s) => s.open);
  const cartCount = useCart(selectCount);
  const wishCount = useWishlist((s) => s.items.length);

  const iconBtn =
    "relative grid size-11 place-items-center text-bone/85 transition-colors hover:text-bone";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-[var(--nav-h)] transition-[background-color,border-color,backdrop-filter] duration-500",
        solid
          ? "border-b border-white/[0.07] bg-ink/85 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-gradient-to-b from-black/50 to-transparent",
      )}
    >
      <nav aria-label="Primary" className="container-x relative flex h-full items-center justify-between gap-6">
        <div className="flex items-center gap-10">
          <Link href="/" aria-label="BRO'S — home" className="-m-2 p-2">
            <Logo className="text-[1.375rem] lg:text-2xl" />
          </Link>
          <ul className="hidden items-center gap-7 lg:flex">
            {primaryNav.map((item) => {
              const active = item.href === pathname;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "label relative py-2 text-bone/75 transition-colors hover:text-bone",
                      "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-bone after:transition-transform after:duration-300 hover:after:scale-x-100",
                      active && "text-bone after:scale-x-100",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-1 lg:flex">
          <button
            type="button"
            onClick={() => open("search")}
            className="label mr-3 flex h-11 items-center gap-2 text-bone/75 transition-colors hover:text-bone"
            aria-label="Open search"
          >
            <Search className="size-4" strokeWidth={1.5} aria-hidden />
            <span>Search</span>
          </button>
          <Link href="/account" className={iconBtn} aria-label="Account">
            <User className="size-[1.125rem]" strokeWidth={1.5} />
          </Link>
          <Link href="/wishlist" className={iconBtn} aria-label={`Wishlist, ${wishCount} items`}>
            <Heart className="size-[1.125rem]" strokeWidth={1.5} />
            <Count n={wishCount} className="absolute right-0.5 top-1" />
          </Link>
          <button
            type="button"
            onClick={() => open("cart")}
            className="label ml-2 flex h-11 items-center gap-2 border border-bone/25 px-4 text-bone transition-colors hover:border-bone"
            aria-label={`Open bag, ${cartCount} items`}
          >
            <ShoppingBag className="size-4" strokeWidth={1.5} aria-hidden />
            <span>Bag</span>
            <span className="font-mono text-[0.6875rem] tabular-nums text-bone/60">({cartCount})</span>
          </button>
        </div>

        {/* Mobile actions */}
        <div className="-mr-2 flex items-center lg:hidden">
          <button type="button" onClick={() => open("search")} className={iconBtn} aria-label="Open search">
            <Search className="size-5" strokeWidth={1.5} />
          </button>
          <button type="button" onClick={() => open("cart")} className={iconBtn} aria-label={`Open bag, ${cartCount} items`}>
            <ShoppingBag className="size-5" strokeWidth={1.5} />
            <Count n={cartCount} className="absolute right-1 top-1.5 grid size-4 place-items-center rounded-full bg-bone text-ink" />
          </button>
          <button type="button" onClick={() => open("menu")} className={cn(iconBtn, "gap-1.5")} aria-label="Open menu" aria-haspopup="dialog">
            <span aria-hidden className="flex w-6 flex-col gap-[6px]">
              <span className="h-px w-full bg-current" />
              <span className="ml-auto h-px w-2/3 bg-current" />
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
}
