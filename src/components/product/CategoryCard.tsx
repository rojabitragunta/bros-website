import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

export function CategoryCard({ category, className, sizes, tall }: { category: Category; className?: string; sizes?: string; tall?: boolean }) {
  return (
    <Link
      href={category.href}
      className={cn("group/cat relative block overflow-hidden bg-graphite", tall ? "aspect-[4/5] md:aspect-auto md:h-full" : "aspect-[4/5]", className)}
    >
      <Image
        src={category.image}
        alt={category.imageAlt}
        fill
        sizes={sizes ?? "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
        className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cat:scale-[1.06] motion-reduce:transform-none"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
        <div className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cat:-translate-y-1.5">
          <p className="eyebrow mb-2 text-bone/60">{category.eyebrow}</p>
          <h3 className={cn("display text-bone", tall ? "text-[clamp(2.5rem,6vw,5.5rem)]" : "text-[clamp(2.25rem,3.4vw,3.5rem)]")}>{category.title}</h3>
        </div>
        <span
          aria-hidden
          className="mb-1 grid size-11 shrink-0 place-items-center overflow-hidden border border-bone/30 text-bone transition-colors duration-300 group-hover/cat:border-bone group-hover/cat:bg-bone group-hover/cat:text-ink"
        >
          <ArrowUpRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cat:rotate-45" strokeWidth={1.5} />
        </span>
      </div>
    </Link>
  );
}
