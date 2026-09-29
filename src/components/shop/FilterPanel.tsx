"use client";

import { Check } from "lucide-react";
import { colours } from "@/data/colours";
import { shopCategories } from "@/data/categories";
import { cn, formatPrice } from "@/lib/utils";
import type { ColourId, SizeCode } from "@/types";

export const SIZE_OPTIONS: SizeCode[] = ["XS", "S", "M", "L", "XL", "XXL"];

export interface ShopFilterState {
  category: string;
  collection?: string;
  sizes: SizeCode[];
  colours: ColourId[];
  priceMax: number;
}

function Group({ title, children, meta }: { title: string; children: React.ReactNode; meta?: string }) {
  return (
    <fieldset className="border-b border-line py-6 first:pt-0">
      <legend className="float-left mb-4 flex w-full items-baseline justify-between">
        <span className="eyebrow text-mist">{title}</span>
        {meta && <span className="font-mono text-[0.6875rem] text-steel">{meta}</span>}
      </legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

export function FilterPanel({
  state,
  onChange,
  counts,
  bounds,
}: {
  state: ShopFilterState;
  onChange: (next: Partial<ShopFilterState>) => void;
  counts: Record<string, number>;
  bounds: { min: number; max: number };
}) {
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <div>
      <Group title="Category">
        <ul className="space-y-0.5">
          {shopCategories.map((c) => {
            const active = state.category === c.slug;
            return (
              <li key={c.slug}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ category: c.slug })}
                  className={cn(
                    "group flex min-h-10 w-full items-center justify-between text-left text-sm transition-colors",
                    active ? "text-bone" : "text-bone/60 hover:text-bone",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span aria-hidden className={cn("h-px bg-bone transition-all duration-300", active ? "w-4" : "w-0 group-hover:w-2")} />
                    {c.label}
                  </span>
                  <span className="font-mono text-[0.6875rem] text-steel">{counts[c.slug] ?? 0}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Group>

      <Group title="Size" meta={state.sizes.length ? `${state.sizes.length} selected` : undefined}>
        <div className="grid grid-cols-3 gap-1.5">
          {SIZE_OPTIONS.map((s) => {
            const active = state.sizes.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ sizes: toggle(state.sizes, s) })}
                className={cn(
                  "h-11 border font-mono text-xs transition-colors",
                  active ? "border-bone bg-bone text-ink" : "border-line text-bone/80 hover:border-bone/60",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </Group>

      <Group title="Colour" meta={state.colours.length ? `${state.colours.length} selected` : undefined}>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
          {colours.map((c) => {
            const active = state.colours.includes(c.id);
            return (
              <li key={c.id}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ colours: toggle(state.colours, c.id) })}
                  className={cn("flex min-h-10 w-full items-center gap-3 text-left text-sm", active ? "text-bone" : "text-bone/60 hover:text-bone")}
                >
                  <span
                    className={cn("relative grid size-5 shrink-0 place-items-center rounded-full ring-1 ring-offset-2 ring-offset-ink", active ? "ring-bone" : "ring-white/15")}
                    style={{ backgroundColor: c.hex }}
                  >
                    {active && <Check className={cn("size-3", c.id === "bone" || c.id === "ash" ? "text-ink" : "text-bone")} strokeWidth={2} aria-hidden />}
                  </span>
                  <span className="truncate">{c.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Group>

      <Group title="Price" meta={`Up to ${formatPrice(state.priceMax)}`}>
        <label className="sr-only" htmlFor="price-max">
          Maximum price
        </label>
        <input
          id="price-max"
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={100}
          value={state.priceMax}
          onChange={(e) => onChange({ priceMax: Number(e.target.value) })}
          aria-valuetext={formatPrice(state.priceMax)}
          className="h-10 w-full cursor-pointer accent-bone"
        />
        <div className="flex justify-between font-mono text-[0.6875rem] text-steel">
          <span>{formatPrice(bounds.min)}</span>
          <span>{formatPrice(bounds.max)}</span>
        </div>
      </Group>
    </div>
  );
}
