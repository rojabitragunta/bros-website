"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDeferredValue, useId, useMemo, useState } from "react";
import { useDialog } from "@/hooks/use-dialog";
import { filterProducts } from "@/lib/catalog-utils";
import { useCatalog } from "@/store/catalog";
import { useSearchHistory, useUI } from "@/store/ui";
import { SearchIdle, SearchNoResults, SearchResultRow } from "./SearchSuggestions";

export function SearchOverlay() {
  const open = useUI((s) => s.overlay === "search");
  const close = useUI((s) => s.close);
  return <AnimatePresence>{open && <SearchPanel onClose={close} />}</AnimatePresence>;
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const router = useRouter();
  const push = useSearchHistory((s) => s.push);
  const ref = useDialog<HTMLDivElement>(true, onClose, { initialFocus: "input" });
  const inputId = useId();
  const all = useCatalog().products;

  const results = useMemo(() => (deferred.trim() ? filterProducts([...all], { query: deferred }).slice(0, 6) : []), [deferred, all]);
  const trending = useMemo(() => filterProducts([...all], { sort: "featured" }).slice(0, 3), [all]);
  const total = useMemo(() => (deferred.trim() ? filterProducts([...all], { query: deferred }).length : 0), [deferred, all]);

  const submit = (q = query) => {
    const term = q.trim();
    if (!term) return;
    push(term);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="fixed inset-0 z-[70]">
      <motion.div aria-hidden className="absolute inset-0 bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        initial={{ y: "-100%" }}
        animate={{ y: 0 }}
        exit={{ y: "-100%" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-x-0 top-0 flex max-h-[100dvh] flex-col border-b border-line bg-onyx text-bone"
      >
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="container-x flex shrink-0 items-center gap-3 border-b border-line py-4 sm:py-6"
        >
          <Search className="size-5 shrink-0 text-mist sm:size-6" strokeWidth={1.5} aria-hidden />
          <label htmlFor={inputId} className="sr-only">
            Search products
          </label>
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search BRO'S"
            autoComplete="off"
            enterKeyHint="search"
            className="display min-w-0 flex-1 bg-transparent text-[clamp(2rem,7vw,4.5rem)] leading-none text-bone placeholder:text-bone/20 focus:outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="grid size-11 place-items-center text-mist hover:text-bone">
              <X className="size-5" strokeWidth={1.5} />
            </button>
          )}
          <button type="button" onClick={onClose} className="label ml-1 hidden h-11 items-center px-2 text-mist hover:text-bone sm:flex">
            Close
          </button>
          <button type="button" onClick={onClose} aria-label="Close search" className="grid size-11 place-items-center sm:hidden">
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </form>

        <div className="container-x min-h-0 overflow-y-auto overscroll-contain py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
          <p className="sr-only" aria-live="polite">
            {deferred.trim() ? `${total} results` : ""}
          </p>
          {!deferred.trim() ? (
            <SearchIdle onPick={(q) => setQuery(q)} trending={trending} />
          ) : results.length === 0 ? (
            <SearchNoResults query={deferred} onPick={(q) => setQuery(q)} />
          ) : (
            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <h3 className="eyebrow text-mist">
                  Products <span className="text-steel">({total})</span>
                </h3>
                <button type="button" onClick={() => submit()} className="label flex min-h-11 items-center gap-2 text-bone/80 hover:text-bone">
                  View all
                  <ArrowRight className="size-3.5" strokeWidth={1.5} aria-hidden />
                </button>
              </div>
              <ul className="grid divide-y divide-line md:grid-cols-2 md:gap-x-12 md:divide-y-0">
                {results.map((p) => (
                  <SearchResultRow key={p.id} product={p} query={query} onNavigate={onClose} />
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
