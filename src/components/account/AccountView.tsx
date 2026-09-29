"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Heart, LogOut, MapPin, Package, Settings, User } from "lucide-react";
import { useState } from "react";
import { demoAddresses, demoOrders, demoUser } from "@/data/account-demo";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import { useUI } from "@/store/ui";
import type { OrderStatus } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { WishlistGrid } from "./WishlistView";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "orders", label: "Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "preferences", label: "Preferences", icon: Settings },
] as const;
type Tab = (typeof TABS)[number]["id"];

const STATUS: Record<OrderStatus, string> = { placed: "Placed", packed: "Packed", shipped: "Shipped", delivered: "Delivered", returned: "Returned" };

/** Marks UI whose behaviour depends on the (future) backend. */
function Phase2({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[0.625rem] uppercase tracking-wider text-steel">{children}</span>;
}

function Panel({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`panel-${title}`}>
      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-5">
        <h2 id={`panel-${title}`} className="display text-4xl sm:text-5xl">
          {title}
        </h2>
        {note && <Phase2>{note}</Phase2>}
      </div>
      {children}
    </section>
  );
}

function Toggle({ label, desc, defaultOn }: { label: string; desc: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between gap-6 border-b border-line py-5">
      <div>
        <p className="text-sm">{label}</p>
        <p className="mt-1 text-xs text-mist">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => setOn(!on)}
        className={cn("relative h-7 w-12 shrink-0 rounded-full border transition-colors", on ? "border-bone bg-bone" : "border-line bg-graphite")}
      >
        <span className={cn("absolute top-1/2 size-5 -translate-y-1/2 rounded-full transition-all duration-300", on ? "left-6 bg-ink" : "left-1 bg-mist")} />
      </button>
    </div>
  );
}

export function AccountView() {
  const [tab, setTab] = useState<Tab>("profile");
  const toast = useUI((s) => s.toast);
  const u = demoUser;

  return (
    <div className="container-x pb-24 pt-10 md:pt-16">
      <div role="note" className="mb-10 border border-dashed border-bone/25 px-4 py-3 text-xs text-mist sm:flex sm:items-center sm:justify-between">
        <p>
          <span className="label mr-2 text-bone">Demo account</span> Sample data shown. Sign-in, orders and saved addresses connect to the backend in Phase 2.
        </p>
        <Phase2>Frontend preview</Phase2>
      </div>

      <div className="mb-10 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow mb-4 text-mist">Member since {formatDate(u.memberSince)}</p>
          <h1 className="display text-[clamp(3.5rem,12vw,8.5rem)]">Hi, {u.firstName}.</h1>
        </div>
        <Button variant="outline" onClick={() => toast({ title: "Sign-out is a Phase 2 feature" })} icon={<LogOut className="size-4" strokeWidth={1.5} />}>
          Sign out
        </Button>
      </div>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <nav aria-label="Account sections" className="min-w-0 lg:col-span-3">
          <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:block lg:space-y-1 lg:px-0" role="tablist">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <li key={t.id} className="shrink-0">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-controls="account-panel"
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "label flex h-11 w-full items-center gap-3 border px-4 text-left transition-colors lg:h-12 lg:border-0 lg:border-l-2 lg:px-5",
                      active ? "border-bone bg-bone text-ink lg:bg-graphite lg:text-bone" : "border-line text-bone/60 hover:text-bone lg:border-transparent",
                    )}
                  >
                    <t.icon className="size-4" strokeWidth={1.5} aria-hidden />
                    {t.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div id="account-panel" role="tabpanel" className="min-w-0 lg:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
              {tab === "profile" && (
                <Panel title="Profile" note="Editing — Phase 2">
                  <dl className="grid gap-px bg-line sm:grid-cols-2">
                    {[
                      ["Name", `${u.firstName} ${u.lastName}`],
                      ["Email", u.email],
                      ["Phone", u.phone],
                      ["Member since", formatDate(u.memberSince)],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-ink p-5">
                        <dt className="eyebrow text-steel">{k}</dt>
                        <dd className="mt-2 text-sm">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </Panel>
              )}

              {tab === "orders" && (
                <Panel title="Orders" note="Sample orders — not real">
                  <ul className="space-y-4">
                    {demoOrders.map((o) => (
                      <li key={o.id} className="border border-line">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-graphite px-5 py-4">
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-xs">
                            <span>{o.id}</span>
                            <span className="text-mist">{formatDate(o.placedAt)}</span>
                            <span>{formatPrice(o.total)}</span>
                          </div>
                          <Badge tone={o.status === "delivered" ? "light" : "outline"}>{STATUS[o.status]}</Badge>
                        </div>
                        <ul className="divide-y divide-line">
                          {o.lines.map((l) => (
                            <li key={l.productId} className="flex items-center gap-4 p-5">
                              <span className="relative h-20 w-16 shrink-0 overflow-hidden bg-[#e4e2dd]">
                                <Image src={l.image} alt="" fill sizes="64px" className="object-cover" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm">{l.name}</span>
                                <span className="mt-1 block font-mono text-[0.6875rem] uppercase text-mist">
                                  {l.colourName} / {l.size} / Qty {l.quantity}
                                </span>
                              </span>
                              <span className="font-mono text-sm">{formatPrice(l.price)}</span>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </Panel>
              )}

              {tab === "wishlist" && (
                <Panel title="Wishlist" note="Stored on this device">
                  <WishlistGrid compact />
                  <Link href="/wishlist" className="label mt-8 inline-flex min-h-11 items-center text-mist underline underline-offset-4 hover:text-bone">
                    Open full wishlist
                  </Link>
                </Panel>
              )}

              {tab === "addresses" && (
                <Panel title="Addresses" note="Saving — Phase 2">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {demoAddresses.map((a) => (
                      <div key={a.id} className="border border-line p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <p className="label">{a.label}</p>
                          {a.isDefault && <Badge tone="outline">Default</Badge>}
                        </div>
                        <address className="text-sm not-italic leading-relaxed text-bone/80">
                          {a.name}
                          <br />
                          {a.line1}
                          {a.line2 && (
                            <>
                              <br />
                              {a.line2}
                            </>
                          )}
                          <br />
                          {a.city}, {a.state} {a.pincode}
                        </address>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => toast({ title: "Address book is a Phase 2 feature" })}
                      className="label grid min-h-40 place-items-center border border-dashed border-line text-mist transition-colors hover:border-bone hover:text-bone"
                    >
                      + Add address
                    </button>
                  </div>
                </Panel>
              )}

              {tab === "preferences" && (
                <Panel title="Preferences" note="Local demo — not saved">
                  <div className="mb-8 grid gap-px bg-line sm:grid-cols-3">
                    {[
                      ["Preferred fit", u.preferences.fit],
                      ["Top size", u.preferences.sizeTop],
                      ["Bottom size", u.preferences.sizeBottom],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-ink p-5">
                        <p className="eyebrow text-steel">{k}</p>
                        <p className="display mt-2 text-3xl">{v}</p>
                      </div>
                    ))}
                  </div>
                  <Toggle label="Drop alerts" desc="Hear first when new drops go live." defaultOn={u.preferences.dropAlerts} />
                  <Toggle label="Newsletter" desc="Training notes and restocks." defaultOn={u.preferences.newsletter} />
                </Panel>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
