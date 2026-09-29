import Link from "next/link";
import { STOCK_LABEL } from "@/lib/catalog-utils";
import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL } from "@/lib/order-display";
import { cn } from "@/lib/utils";
import type { OrderStatus, PaymentStatus, StockStatus } from "@/types";

export const inputCls =
  "h-11 w-full border border-line bg-transparent px-3 text-sm text-bone placeholder:text-steel hover:border-bone/40 focus:border-bone focus:outline-none";
export const selectCls = cn(inputCls, "bg-ink");
export const labelCls = "mb-1.5 block text-[0.6875rem] font-medium uppercase tracking-wider text-mist";
export const btnCls =
  "inline-flex h-10 items-center justify-center gap-2 border border-bone bg-bone px-4 text-xs font-medium uppercase tracking-wider text-ink transition-colors hover:bg-white disabled:opacity-40";
export const btnOutlineCls =
  "inline-flex h-10 items-center justify-center gap-2 border border-line px-4 text-xs font-medium uppercase tracking-wider text-bone transition-colors hover:border-bone disabled:opacity-40";

export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div>
        <h1 className="display text-4xl sm:text-5xl">{title}</h1>
        {sub && <p className="mt-2 text-sm text-mist">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, children, className, actions }: { title?: string; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <section className={cn("border border-line bg-graphite/40 p-5", className)}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="label">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, href, tone }: { label: string; value: React.ReactNode; href?: string; tone?: "warn" | "bad" }) {
  const body = (
    <>
      <p className="eyebrow text-steel">{label}</p>
      <p className={cn("display mt-2 text-4xl", tone === "warn" && "text-amber-300", tone === "bad" && "text-red-400")}>{value}</p>
    </>
  );
  return href ? (
    <Link href={href} className="block border border-line p-5 transition-colors hover:border-bone/50">
      {body}
    </Link>
  ) : (
    <div className="border border-line p-5">{body}</div>
  );
}

const pill = "inline-flex h-6 items-center whitespace-nowrap px-2 font-mono text-[0.625rem] uppercase tracking-wider";

export function StockPill({ status, stock }: { status: StockStatus; stock?: number }) {
  return (
    <span
      className={cn(
        pill,
        status === "in_stock" && "bg-emerald-400/15 text-emerald-300",
        status === "low_stock" && "bg-amber-300/15 text-amber-200",
        status === "out_of_stock" && "bg-red-400/15 text-red-300",
      )}
    >
      {STOCK_LABEL[status]}
      {stock !== undefined && ` · ${stock}`}
    </span>
  );
}

export function OrderStatusPill({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        pill,
        "border border-line",
        (status === "placed" || status === "packed") && "border-amber-300/50 text-amber-200",
        status === "shipped" && "border-sky-300/50 text-sky-200",
        status === "delivered" && "border-emerald-400/50 text-emerald-300",
        (status === "cancelled" || status === "returned") && "border-red-400/40 text-red-300",
        status === "pending_payment" && "text-mist",
      )}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}

export function PaymentPill({ status }: { status: PaymentStatus }) {
  return (
    <span className={cn(pill, "text-mist", status === "paid" && "text-emerald-300", status === "refund_pending" && "text-red-300")}>{PAYMENT_STATUS_LABEL[status]}</span>
  );
}

/** GET search/filter form — works without JavaScript. */
export function Filters({ q, placeholder, children }: { q?: string; placeholder: string; children?: React.ReactNode }) {
  return (
    <form className="mb-6 flex flex-wrap gap-2" role="search">
      <input name="q" defaultValue={q} placeholder={placeholder} aria-label={placeholder} className={cn(inputCls, "max-w-sm flex-1")} />
      {children}
      <button className={btnOutlineCls}>Apply</button>
    </form>
  );
}

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full min-w-[480px] text-left text-sm [&_td]:border-t [&_td]:border-line [&_td]:px-3 [&_td]:py-2.5 [&_th]:px-3 [&_th]:py-2.5 [&_th]:text-[0.625rem] [&_th]:font-medium [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-mist">
        {children}
      </table>
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="border border-dashed border-line px-4 py-10 text-center text-sm text-mist">{children}</p>;
}
