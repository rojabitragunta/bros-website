"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { popularSearches } from "@/data/site";
import { useSearchHistory } from "@/store/ui";

export function SearchPageForm({ initial }: { initial: string }) {
  const [q, setQ] = useState(initial);
  const router = useRouter();
  const push = useSearchHistory((s) => s.push);
  const go = (term: string) => {
    const t = term.trim();
    push(t);
    router.push(t ? `/search?q=${encodeURIComponent(t)}` : "/search");
  };
  return (
    <div>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          go(q);
        }}
        className="flex items-center gap-3 border-b border-bone/30 pb-3 transition-colors focus-within:border-bone"
      >
        <Search className="size-6 shrink-0 text-mist" strokeWidth={1.5} aria-hidden />
        <label htmlFor="search-page" className="sr-only">
          Search products
        </label>
        <input
          id="search-page"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search BRO'S"
          autoComplete="off"
          enterKeyHint="search"
          className="display min-w-0 flex-1 bg-transparent text-[clamp(2.5rem,8vw,5.5rem)] leading-none placeholder:text-bone/20 focus:outline-none"
        />
        <button type="submit" className="label h-11 px-2 text-bone/80 hover:text-bone">
          Search
        </button>
      </form>
      <ul className="mt-5 flex flex-wrap gap-2" aria-label="Popular searches">
        {popularSearches.map((p) => (
          <li key={p}>
            <button type="button" onClick={() => { setQ(p); go(p); }} className="h-9 border border-line px-3 text-xs text-bone/70 transition-colors hover:border-bone/50 hover:text-bone">
              {p}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
