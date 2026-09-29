"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, TrendingUp } from "lucide-react";
import { shopCategories } from "@/data/categories";
import { popularSearches } from "@/data/site";
import { formatPrice } from "@/lib/utils";
import { useSearchHistory } from "@/store/ui";
import type { Product } from "@/types";

const categoryLabel = (slug: string) => shopCategories.find((c) => c.slug === slug)?.label ?? slug;

export function SearchResultRow({ product, onNavigate, query }: { product: Product; onNavigate?: () => void; query?: string }) {
  const push = useSearchHistory((s) => s.push);
  return (
    <li>
      <Link
        href={`/products/${product.slug}`}
        onClick={() => {
          if (query) push(query);
          onNavigate?.();
        }}
        className="group flex items-center gap-4 py-3 transition-colors"
      >
        <span className="relative h-20 w-16 shrink-0 overflow-hidden bg-[#e4e2dd]">
          <Image src={product.images[0].src} alt="" fill sizes="64px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium group-hover:underline group-hover:underline-offset-4">{product.name}</span>
          <span className="mt-1 block font-mono text-[0.6875rem] uppercase tracking-wider text-mist">
            {categoryLabel(product.category)} · {product.colours.length} {product.colours.length === 1 ? "colour" : "colours"}
          </span>
        </span>
        <span className="font-mono text-sm tabular-nums">{formatPrice(product.price)}</span>
      </Link>
    </li>
  );
}

export function SearchIdle({ onPick, trending }: { onPick: (q: string) => void; trending: Product[] }) {
  const recent = useSearchHistory((s) => s.recent);
  const clear = useSearchHistory((s) => s.clear);
  return (
    <div className="grid gap-10 md:grid-cols-[1fr_1fr_1.4fr] md:gap-12">
      <section aria-labelledby="recent-h">
        <div className="mb-4 flex items-center justify-between">
          <h3 id="recent-h" className="eyebrow text-mist">
            Recent
          </h3>
          {recent.length > 0 && (
            <button type="button" onClick={clear} className="text-xs text-steel underline underline-offset-4 hover:text-bone">
              Clear
            </button>
          )}
        </div>
        {recent.length ? (
          <ul>
            {recent.map((r) => (
              <li key={r}>
                <button type="button" onClick={() => onPick(r)} className="flex min-h-11 w-full items-center gap-3 text-left text-sm text-bone/80 hover:text-bone">
                  <Clock className="size-3.5 text-steel" strokeWidth={1.5} aria-hidden />
                  {r}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-steel">Your recent searches will appear here.</p>
        )}
      </section>
      <section aria-labelledby="popular-h">
        <h3 id="popular-h" className="eyebrow mb-4 text-mist">
          Popular
        </h3>
        <ul>
          {popularSearches.map((p) => (
            <li key={p}>
              <button type="button" onClick={() => onPick(p)} className="flex min-h-11 w-full items-center gap-3 text-left text-sm text-bone/80 hover:text-bone">
                <TrendingUp className="size-3.5 text-steel" strokeWidth={1.5} aria-hidden />
                {p}
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="trending-h">
        <h3 id="trending-h" className="eyebrow mb-1 text-mist">
          Trending in Drop 001
        </h3>
        <ul className="divide-y divide-line">
          {trending.map((p) => (
            <SearchResultRow key={p.id} product={p} />
          ))}
        </ul>
      </section>
    </div>
  );
}

export function SearchNoResults({ query, onPick }: { query: string; onPick: (q: string) => void }) {
  return (
    <div className="py-10 text-center md:py-16">
      <p className="eyebrow text-steel">0 results</p>
      <p className="display mt-4 text-[clamp(2rem,7vw,3.5rem)]">
        Nothing for &ldquo;<span className="break-all">{query}</span>&rdquo;
      </p>
      <p className="mt-4 text-sm text-mist">Check the spelling, or try one of these:</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {popularSearches.slice(0, 4).map((p) => (
          <button key={p} type="button" onClick={() => onPick(p)} className="h-10 border border-line px-4 text-xs uppercase tracking-wider text-bone/80 hover:border-bone hover:text-bone">
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
