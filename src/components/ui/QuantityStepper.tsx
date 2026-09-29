"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  max = 10,
  label,
  className,
}: {
  value: number;
  onChange: (n: number) => void;
  max?: number;
  label: string;
  className?: string;
}) {
  return (
    <div role="group" aria-label={`Quantity for ${label}`} className={cn("inline-flex h-10 items-center border border-current/25", className)}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        aria-label={value <= 1 ? `Remove ${label}` : "Decrease quantity"}
        className="grid h-full w-10 place-items-center opacity-70 transition-opacity hover:opacity-100"
      >
        <Minus className="size-3.5" strokeWidth={1.5} />
      </button>
      <output aria-live="polite" className="w-7 text-center font-mono text-sm tabular-nums">
        {value}
      </output>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
        className="grid h-full w-10 place-items-center opacity-70 transition-opacity hover:opacity-100 disabled:opacity-25"
      >
        <Plus className="size-3.5" strokeWidth={1.5} />
      </button>
    </div>
  );
}
