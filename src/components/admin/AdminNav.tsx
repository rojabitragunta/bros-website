"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { Boxes, ExternalLink, LayoutDashboard, LogOut, Package, ShoppingBag } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
];

export function AdminNav({ email }: { email: string }) {
  const path = usePathname();
  const [pending, start] = useTransition();
  return (
    <nav aria-label="Admin" className="flex flex-col gap-1 lg:h-full">
      <Link href="/admin" className="mb-4 hidden text-2xl font-black tracking-tight lg:block">
        BRO&apos;S <span className="font-mono text-[0.625rem] font-normal uppercase tracking-widest text-mist">Admin</span>
      </Link>
      <ul className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col">
        {LINKS.map((l) => {
          const active = l.exact ? path === l.href : path.startsWith(l.href);
          return (
            <li key={l.href} className="shrink-0">
              <Link
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn("flex h-10 items-center gap-3 px-3 text-sm transition-colors", active ? "bg-bone text-ink" : "text-bone/70 hover:bg-graphite hover:text-bone")}
              >
                <l.icon className="size-4" strokeWidth={1.5} aria-hidden />
                {l.label}
              </Link>
            </li>
          );
        })}
        <li className="shrink-0 lg:hidden">
          <button type="button" disabled={pending} onClick={() => start(() => logout())} className="flex h-10 items-center gap-2 px-3 text-sm text-bone/70">
            <LogOut className="size-4" strokeWidth={1.5} aria-hidden /> Sign out
          </button>
        </li>
      </ul>
      <div className="mt-auto hidden space-y-1 border-t border-line pt-4 text-xs text-mist lg:block">
        <p className="truncate px-3">{email}</p>
        <Link href="/" className="flex h-9 items-center gap-2 px-3 hover:text-bone">
          <ExternalLink className="size-3.5" strokeWidth={1.5} aria-hidden /> View store
        </Link>
        <button type="button" disabled={pending} onClick={() => start(() => logout())} className="flex h-9 items-center gap-2 px-3 hover:text-bone">
          <LogOut className="size-3.5" strokeWidth={1.5} aria-hidden /> Sign out
        </button>
      </div>
    </nav>
  );
}
