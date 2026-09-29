import Link from "next/link";
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "ink" | "outline-ink";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-3 overflow-hidden whitespace-nowrap font-medium uppercase tracking-[0.14em] transition-colors duration-300 ease-out disabled:pointer-events-none disabled:opacity-40 isolate select-none";

/* The ::before layer is a fill that wipes up on hover. */
const wipe =
  "before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.16,1,0.3,1)] hover:before:scale-y-100 motion-reduce:before:transition-none";

const variants: Record<Variant, string> = {
  primary: cn("bg-bone text-ink before:bg-white", wipe),
  outline: cn("border border-bone/40 text-bone hover:text-ink hover:border-bone before:bg-bone", wipe),
  ghost: "text-bone hover:text-white underline-offset-8 hover:underline",
  ink: cn("bg-ink text-bone before:bg-charcoal", wipe),
  "outline-ink": cn("border border-ink/30 text-ink hover:text-bone hover:border-ink before:bg-ink", wipe),
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-[0.6875rem]",
  md: "h-12 px-6 text-xs",
  lg: "h-14 px-8 text-xs sm:h-[3.75rem] sm:px-10",
};

interface Common {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  icon?: ReactNode;
  full?: boolean;
}

type ButtonProps = Common & ComponentPropsWithoutRef<"button"> & { href?: undefined };
type LinkProps = Common & Omit<ComponentPropsWithoutRef<typeof Link>, "className" | "children"> & { href: string };

export function buttonClasses({ variant = "primary", size = "md", full, className }: Partial<Common>) {
  return cn(base, variants[variant], sizes[size], full && "w-full", className);
}

function Inner({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <>
      <span className="relative">{children}</span>
      {icon && (
        <span aria-hidden className="relative transition-transform duration-300 ease-out group-hover/btn:translate-x-1">
          {icon}
        </span>
      )}
    </>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, className, children, icon, full, type = "button", ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} className={buttonClasses({ variant, size, full, className })} {...props}>
      <Inner icon={icon}>{children}</Inner>
    </button>
  );
});

export function ButtonLink({ variant, size, className, children, icon, full, ...props }: LinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, full, className })} {...props}>
      <Inner icon={icon}>{children}</Inner>
    </Link>
  );
}
