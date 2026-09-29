import { Skeleton, TextSkeleton } from "@/components/ui/Skeleton";

export default function ProductLoading() {
  return (
    <div role="status" aria-label="Loading product" className="bg-ink pb-24">
      <div className="md:container-x grid gap-8 md:grid-cols-12 md:pt-8 lg:gap-14">
        <div className="md:col-span-7 md:grid md:grid-cols-[84px_1fr] md:gap-4">
          <div className="hidden flex-col gap-2 md:flex">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="aspect-[4/5] w-full" />
            ))}
          </div>
          <Skeleton className="aspect-[4/5] w-full" />
        </div>
        <div className="container-x space-y-6 md:col-span-5 md:px-0">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-16 w-4/5" />
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-5 gap-1.5">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
          <Skeleton className="h-14 w-full" />
          <TextSkeleton lines={4} />
        </div>
      </div>
    </div>
  );
}
