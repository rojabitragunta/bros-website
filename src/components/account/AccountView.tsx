"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, Heart, LogOut, MapPin, Package, User } from "lucide-react";
import { useActionState, useEffect, useState, useTransition } from "react";
import { changePassword, deleteAddress, saveAddress, setDefaultAddress, updateProfile } from "@/app/actions/account";
import { logout, type FormState } from "@/app/actions/auth";
import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL } from "@/lib/order-display";
import { keepValues } from "@/lib/forms";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import { useCart } from "@/store/cart";
import type { Address, Order } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, FormError, FormSuccess } from "@/components/ui/Field";
import { WishlistGrid } from "./WishlistView";

const TABS = [
  { id: "orders", label: "Orders", icon: Package },
  { id: "profile", label: "Profile", icon: User },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "wishlist", label: "Wishlist", icon: Heart },
] as const;
type Tab = (typeof TABS)[number]["id"];

export interface AccountUser {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  memberSince: string;
  preferences: { newsletter?: boolean; dropAlerts?: boolean };
}

function Panel({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`panel-${title}`}>
      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-5">
        <h2 id={`panel-${title}`} className="display text-4xl sm:text-5xl">
          {title}
        </h2>
        {note && <span className="font-mono text-[0.625rem] uppercase tracking-wider text-steel">{note}</span>}
      </div>
      {children}
    </section>
  );
}

function Check({ name, label, desc, defaultChecked }: { name: string; label: string; desc: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-6 border-b border-line py-5">
      <span>
        <span className="block text-sm">{label}</span>
        <span className="mt-1 block text-xs text-mist">{desc}</span>
      </span>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-5 shrink-0 accent-[#e3ddd1]" />
    </label>
  );
}

export function SignOutButton({ className }: { className?: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="outline"
      className={className}
      disabled={pending}
      onClick={() =>
        start(async () => {
          // Clear the local bag on shared devices; it stays saved to the account.
          useCart.getState().clear();
          await logout();
        })
      }
      icon={<LogOut className="size-4" strokeWidth={1.5} />}
    >
      Sign out
    </Button>
  );
}

export function AccountView({ user, orders, addresses }: { user: AccountUser; orders: Order[]; addresses: Address[] }) {
  const [tab, setTab] = useState<Tab>("orders");

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab") as Tab | null;
    if (t && TABS.some((x) => x.id === t)) setTab(t);
  }, []);

  return (
    <div className="container-x pb-24 pt-10 md:pt-16">
      <div className="mb-10 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow mb-4 text-mist">Member since {formatDate(user.memberSince)}</p>
          <h1 className="display text-[clamp(3.5rem,12vw,8.5rem)]">Hi, {user.firstName}.</h1>
        </div>
        <SignOutButton />
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
            <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              {tab === "orders" && <OrdersPanel orders={orders} />}
              {tab === "profile" && <ProfilePanel user={user} />}
              {tab === "addresses" && <AddressesPanel addresses={addresses} />}
              {tab === "wishlist" && (
                <Panel title="Wishlist" note="Saved on this device">
                  <WishlistGrid compact />
                  <Link href="/wishlist" className="label mt-8 inline-flex min-h-11 items-center text-mist underline underline-offset-4 hover:text-bone">
                    Open full wishlist
                  </Link>
                </Panel>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function OrdersPanel({ orders }: { orders: Order[] }) {
  return (
    <Panel title="Orders" note={`${orders.length} ${orders.length === 1 ? "order" : "orders"}`}>
      {!orders.length ? (
        <div className="border border-line px-6 py-16 text-center">
          <p className="text-sm text-mist">No orders yet.</p>
          <Link href="/shop" className="label mt-4 inline-flex min-h-11 items-center underline underline-offset-4">
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o.id} className="border border-line">
              <Link href={`/account/orders/${o.id}`} className="group block">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-graphite px-5 py-4">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-xs">
                    <span>#{o.number}</span>
                    <span className="text-mist">{formatDate(o.placedAt)}</span>
                    <span>{formatPrice(o.total)}</span>
                    <span className="text-mist">{PAYMENT_STATUS_LABEL[o.paymentStatus]}</span>
                  </div>
                  <span className="flex items-center gap-2">
                    <Badge tone={o.status === "delivered" ? "light" : "outline"} className={cn(o.status === "cancelled" && "text-red-300")}>
                      {ORDER_STATUS_LABEL[o.status]}
                    </Badge>
                    <ChevronRight className="size-4 text-mist transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} aria-hidden />
                  </span>
                </div>
                <ul className="divide-y divide-line">
                  {o.lines.map((l, i) => (
                    <li key={i} className="flex items-center gap-4 p-5">
                      <span className="relative h-20 w-16 shrink-0 overflow-hidden bg-[#e4e2dd]">
                        {l.image && <Image src={l.image} alt="" fill sizes="64px" className="object-cover" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">{l.name}</span>
                        <span className="mt-1 block font-mono text-[0.6875rem] uppercase text-mist">
                          {l.colourName} / {l.size} / Qty {l.quantity}
                        </span>
                      </span>
                      <span className="font-mono text-sm">{formatPrice(l.price * l.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function ProfilePanel({ user }: { user: AccountUser }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfile, {});
  const [pw, pwAction, pwPending] = useActionState<FormState, FormData>(changePassword, {});
  const f = state.fields ?? {};
  const pf = pw.fields ?? {};
  return (
    <Panel title="Profile">
      <form onSubmit={keepValues(action)} className="grid gap-3" noValidate>
        <FormSuccess>{state.ok ? state.message : undefined}</FormSuccess>
        <FormError>{state.error}</FormError>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="First name" name="firstName" defaultValue={user.firstName} autoComplete="given-name" error={f.firstName} />
          <Field label="Last name" name="lastName" defaultValue={user.lastName} autoComplete="family-name" error={f.lastName} />
          <Field label="Email" value={user.email} readOnly disabled hint="Contact support to change your email." />
          <Field label="Mobile" name="phone" type="tel" inputMode="tel" defaultValue={user.phone} autoComplete="tel" error={f.phone} />
        </div>
        <div className="mt-4">
          <Check name="dropAlerts" label="Drop alerts" desc="Hear first when new drops go live." defaultChecked={user.preferences.dropAlerts} />
          <Check name="newsletter" label="Newsletter" desc="Training notes and restocks." defaultChecked={user.preferences.newsletter} />
        </div>
        <Button type="submit" disabled={pending} className="mt-4 justify-self-start">
          {pending ? "Saving…" : "Save profile"}
        </Button>
      </form>

      <form action={pwAction} className="mt-14 grid gap-3" noValidate>
        <h3 className="label mb-2">Change password</h3>
        <FormSuccess>{pw.ok ? pw.message : undefined}</FormSuccess>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Current password" name="current" type="password" autoComplete="current-password" error={pf.current} />
          <Field label="New password" name="next" type="password" autoComplete="new-password" error={pf.next} hint="At least 8 characters." />
        </div>
        <Button type="submit" variant="outline" disabled={pwPending} className="mt-2 justify-self-start">
          {pwPending ? "Updating…" : "Update password"}
        </Button>
      </form>
    </Panel>
  );
}

function AddressForm({ address, onDone }: { address?: Address; onDone: () => void }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveAddress, {});
  const f = state.fields ?? {};
  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);
  return (
    <form onSubmit={keepValues(action)} className="grid gap-3 border border-line p-5 sm:col-span-2" noValidate>
      {address && <input type="hidden" name="id" value={address.id} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Label (Home, Work…)" name="label" defaultValue={address?.label ?? "Home"} error={f.label} />
        <Field label="Full name" name="name" defaultValue={address?.name} autoComplete="name" error={f.name} />
        <Field label="Address" name="line1" defaultValue={address?.line1} autoComplete="address-line1" className="sm:col-span-2" error={f.line1} />
        <Field label="Apartment, landmark (optional)" name="line2" defaultValue={address?.line2} autoComplete="address-line2" className="sm:col-span-2" />
        <Field label="City" name="city" defaultValue={address?.city} autoComplete="address-level2" error={f.city} />
        <Field label="State" name="state" defaultValue={address?.state} autoComplete="address-level1" error={f.state} />
        <Field label="PIN code" name="pincode" inputMode="numeric" maxLength={6} defaultValue={address?.pincode} autoComplete="postal-code" error={f.pincode} />
        <Field label="Mobile" name="phone" type="tel" inputMode="tel" defaultValue={address?.phone} autoComplete="tel" error={f.phone} />
      </div>
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" name="isDefault" defaultChecked={address?.isDefault} className="size-4 accent-[#e3ddd1]" /> Make default
      </label>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save address"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function AddressesPanel({ addresses }: { addresses: Address[] }) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [pending, start] = useTransition();
  return (
    <Panel title="Addresses">
      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((a) =>
          editing === a.id ? (
            <AddressForm key={a.id} address={a} onDone={() => setEditing(null)} />
          ) : (
            <div key={a.id} className="flex flex-col border border-line p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="label">{a.label}</p>
                {a.isDefault && <Badge tone="outline">Default</Badge>}
              </div>
              <address className="flex-1 text-sm not-italic leading-relaxed text-bone/80">
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
                <br />
                {a.phone}
              </address>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
                <button type="button" className="min-h-10 underline underline-offset-4" onClick={() => setEditing(a.id)}>
                  Edit
                </button>
                {!a.isDefault && (
                  <button type="button" disabled={pending} className="min-h-10 underline underline-offset-4" onClick={() => start(() => setDefaultAddress(a.id))}>
                    Set as default
                  </button>
                )}
                <button
                  type="button"
                  disabled={pending}
                  className="min-h-10 text-red-300 underline underline-offset-4"
                  onClick={() => confirm("Delete this address?") && start(() => deleteAddress(a.id))}
                >
                  Delete
                </button>
              </div>
            </div>
          ),
        )}
        {editing === "new" ? (
          <AddressForm onDone={() => setEditing(null)} />
        ) : (
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="label grid min-h-40 place-items-center border border-dashed border-line text-mist transition-colors hover:border-bone hover:text-bone"
          >
            + Add address
          </button>
        )}
      </div>
    </Panel>
  );
}
