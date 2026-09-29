import { cn } from "@/lib/utils";
import type { ProductBadge } from "@/types";

const LABELS: Record<ProductBadge, string> = {
  new: "New",
  bestseller: "Bestseller",
  limited: "Limited",
  "low-stock": "Low stock",
};

export function Badge({
  children,
  tone = "light",
  className,
}: {
  children: React.ReactNode;
  tone?: "light" | "dark" | "outline";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center px-2 font-mono text-[0.625rem] uppercase tracking-[0.16em]",
        tone === "light" && "bg-bone text-ink",
        tone === "dark" && "bg-ink text-bone",
        tone === "outline" && "border border-current",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ProductBadgeLabel({ badge, className }: { badge: ProductBadge; className?: string }) {
  return (
    <Badge tone={badge === "new" ? "light" : "dark"} className={className}>
      {LABELS[badge]}
    </Badge>
  );
}
