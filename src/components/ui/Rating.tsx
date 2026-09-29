import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({ value, count, className }: { value: number; count?: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex" role="img" aria-label={`Rated ${value} out of 5`}>
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = Math.max(0, Math.min(1, value - i));
          return (
            <span key={i} className="relative size-3.5">
              <Star className="absolute inset-0 size-3.5 opacity-25" strokeWidth={1.5} aria-hidden />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className="size-3.5 fill-current" strokeWidth={1.5} aria-hidden />
              </span>
            </span>
          );
        })}
      </div>
      <span className="font-mono text-xs tabular-nums opacity-70">
        {value.toFixed(1)}
        {count !== undefined && ` (${count})`}
      </span>
    </div>
  );
}
