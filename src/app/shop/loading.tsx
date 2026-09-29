import { ProductGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function ShopLoading() {
  return (
    <div className="bg-ink pb-24" role="status" aria-label="Loading shop">
      <div className="container-x pb-12 pt-16">
        <Skeleton className="mb-6 h-3 w-24" />
        <Skeleton className="h-24 w-2/3 max-w-xl md:h-36" />
        <div className="mt-8 flex gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-20" />
          ))}
        </div>
      </div>
      <div className="h-16 border-y border-line" />
      <div className="container-x mt-8">
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
