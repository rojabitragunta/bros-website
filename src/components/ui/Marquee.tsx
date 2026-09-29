import { cn } from "@/lib/utils";

/**
 * CSS-only infinite marquee (no JS). The track is duplicated so the
 * -50% keyframe loops seamlessly. Pauses on hover; static under reduced motion.
 */
export function Marquee({
  items,
  className,
  itemClassName,
  separator = "/",
  duration = 40,
  reverse = false,
}: {
  items: string[];
  className?: string;
  itemClassName?: string;
  separator?: string;
  duration?: number;
  reverse?: boolean;
}) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {[...items, ...items].map((item, i) => (
        <li key={i} className={cn("flex items-center whitespace-nowrap", itemClassName)}>
          <span>{item}</span>
          <span aria-hidden className="mx-[0.6em] opacity-40">
            {separator}
          </span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className={cn("group relative flex overflow-hidden", className)}>
      <span className="sr-only">{items.join(", ")}</span>
      <div
        aria-hidden
        className={cn(
          "flex w-max animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none",
          reverse && "[animation-direction:reverse]",
        )}
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
