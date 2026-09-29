"use client";

import { ArrowRight, Check } from "lucide-react";
import { useId, useState } from "react";
import { useUI } from "@/store/ui";
import { TextReveal } from "@/components/ui/Reveal";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "done">("idle");
  const toast = useUI((s) => s.toast);
  const id = useId();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState("error");
      return;
    }
    // Phase 2: POST to the newsletter endpoint.
    setState("done");
    toast({ title: "You're on the list", description: "Demo only — no email was sent." });
  };

  return (
    <section aria-labelledby="newsletter-title" className="on-light bg-bone py-20 text-ink md:py-32">
      <div className="container-x grid gap-12 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <p className="eyebrow mb-4 text-ink/50">Newsletter / Drop alerts</p>
          <TextReveal as="h2" lines={["First in line", "for Drop 002."]} className="display text-[clamp(3rem,9vw,8rem)]" />
          <span id="newsletter-title" className="sr-only">
            Newsletter
          </span>
        </div>
        <div className="md:col-span-5">
          <p className="mb-6 max-w-sm text-sm leading-relaxed text-ink/65">
            New drops, restocks and training notes. No spam — just what moves.
          </p>
          {state === "done" ? (
            <p role="status" className="flex h-16 items-center gap-3 border-b border-ink text-sm">
              <Check className="size-4" strokeWidth={1.5} aria-hidden /> Thanks — you&rsquo;re on the list.
            </p>
          ) : (
            <form onSubmit={submit} noValidate>
              <label htmlFor={id} className="sr-only">
                Email address
              </label>
              <div className="group flex h-16 items-center border-b border-ink/30 transition-colors focus-within:border-ink">
                <input
                  id={id}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (state === "error") setState("idle");
                  }}
                  aria-invalid={state === "error"}
                  aria-describedby={state === "error" ? `${id}-err` : undefined}
                  className="h-full min-w-0 flex-1 bg-transparent text-lg placeholder:text-ink/35 focus:outline-none"
                />
                <button type="submit" className="label flex h-12 items-center gap-2 pl-4" aria-label="Subscribe">
                  <span className="hidden sm:inline">Subscribe</span>
                  <ArrowRight className="size-5 transition-transform group-focus-within:translate-x-1" strokeWidth={1.5} aria-hidden />
                </button>
              </div>
              {state === "error" && (
                <p id={`${id}-err`} role="alert" className="mt-3 text-xs text-red-800">
                  Enter a valid email address.
                </p>
              )}
              <p className="mt-4 text-[0.6875rem] text-ink/45">By subscribing you agree to receive marketing emails. Unsubscribe anytime.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
