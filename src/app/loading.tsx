import { Logo } from "@/components/ui/Logo";

/** Route-level loading state — never a blank screen. */
export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="grid min-h-[70svh] place-items-center bg-ink">
      <div className="flex flex-col items-center gap-6">
        <Logo className="animate-pulse text-3xl text-bone/70" />
        <div className="h-px w-40 overflow-hidden bg-line">
          <div className="skeleton h-full w-full" />
        </div>
      </div>
    </div>
  );
}
