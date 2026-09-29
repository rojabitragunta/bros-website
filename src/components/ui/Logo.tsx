import { cn } from "@/lib/utils";

/** Wordmark — typographic until the final logo file is supplied. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("display-wide inline-block leading-none tracking-[-0.02em]", className)}>
      BRO<span className="inline-block -translate-y-[0.05em]">&rsquo;</span>S
    </span>
  );
}
