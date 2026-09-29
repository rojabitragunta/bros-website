import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TextReveal } from "./Reveal";

export function SectionHeader({
  eyebrow,
  title,
  lead,
  action,
  className,
  align = "left",
  as = "h2",
}: {
  eyebrow?: string;
  /** Pass an array for a multi-line masked reveal. */
  title: string | string[];
  lead?: ReactNode;
  action?: ReactNode;
  className?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
}) {
  const lines = Array.isArray(title) ? title : [title];
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center md:flex-col md:items-center",
        className,
      )}
    >
      <div className={cn("max-w-3xl", align === "center" && "mx-auto")}>
        {eyebrow && <p className="eyebrow mb-4 opacity-60">{eyebrow}</p>}
        <TextReveal as={as} lines={lines} className="display text-[clamp(2.75rem,8vw,6.5rem)]" />
        {lead && <div className="mt-5 max-w-xl text-sm leading-relaxed opacity-70 sm:text-base">{lead}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
