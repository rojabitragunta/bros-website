"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { login, register, type FormState } from "@/app/actions/auth";
import { keepValues } from "@/lib/forms";
import { Button } from "@/components/ui/Button";
import { Field, FormError } from "@/components/ui/Field";

export function AuthForm({ mode, next }: { mode: "login" | "register"; next?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(mode === "login" ? login : register, {});
  const f = state.fields ?? {};

  // Full navigation so the bag re-syncs with the account.
  useEffect(() => {
    if (state.ok && state.next) window.location.assign(state.next);
  }, [state]);

  const q = next ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <form onSubmit={keepValues(action)} className="grid gap-3" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <FormError>{state.error}</FormError>
      {mode === "register" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="First name" name="firstName" autoComplete="given-name" required error={f.firstName} />
          <Field label="Last name" name="lastName" autoComplete="family-name" error={f.lastName} />
        </div>
      )}
      <Field label="Email" name="email" type="email" autoComplete="email" required error={f.email} />
      {mode === "register" && <Field label="Mobile (optional)" name="phone" type="tel" inputMode="tel" autoComplete="tel" error={f.phone} />}
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        required
        minLength={mode === "register" ? 8 : undefined}
        error={f.password}
        hint={mode === "register" ? "At least 8 characters." : undefined}
      />
      <Button type="submit" size="lg" full disabled={pending || state.ok} className="mt-3">
        {pending || state.ok ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
      </Button>
      <p className="mt-4 text-center text-sm text-mist">
        {mode === "login" ? (
          <>
            New to BRO&apos;S?{" "}
            <Link href={`/register${q}`} className="text-bone underline underline-offset-4">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href={`/login${q}`} className="text-bone underline underline-offset-4">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
