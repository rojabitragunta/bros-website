"use client";

import { useActionState } from "react";
import { adminLogin, type FormState } from "@/app/actions/auth";
import { keepValues } from "@/lib/forms";
import { Button } from "@/components/ui/Button";
import { Field, FormError } from "@/components/ui/Field";

export function AdminLoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(adminLogin, {});
  return (
    <form onSubmit={keepValues(action)} className="grid gap-3" noValidate>
      <FormError>{state.error}</FormError>
      <Field label="Admin email" name="email" type="email" autoComplete="username" required error={state.fields?.email} />
      <Field label="Password" name="password" type="password" autoComplete="current-password" required error={state.fields?.password} />
      <Button type="submit" size="lg" full disabled={pending} className="mt-3">
        {pending ? "Signing in…" : "Sign in to admin"}
      </Button>
    </form>
  );
}
