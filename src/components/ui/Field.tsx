"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string };

/** Floating-label text input with accessible error text (dark storefront style). */
export function Field({ label, error, hint, className, ...props }: FieldProps) {
  const id = useId();
  const described = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cn("relative", className)}>
      <input
        id={id}
        placeholder=" "
        aria-invalid={error ? true : undefined}
        aria-describedby={described}
        {...props}
        className={cn(
          "peer h-14 w-full border bg-transparent px-4 pb-2 pt-6 text-sm text-bone transition-colors placeholder-transparent hover:border-bone/40 focus:border-bone focus:outline-none",
          error ? "border-red-400/70" : "border-line",
        )}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-2 text-[0.625rem] uppercase tracking-wider text-mist transition-all peer-placeholder-shown:top-[1.1rem] peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[0.625rem] peer-focus:uppercase peer-focus:tracking-wider"
      >
        {label}
      </label>
      {error ? (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-steel">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function FormError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
      {children}
    </p>
  );
}

export function FormSuccess({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="status" className="border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
      {children}
    </p>
  );
}
