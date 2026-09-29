"use client";

import { startTransition } from "react";

/**
 * Submit handler for useActionState forms that keeps what the user typed when
 * the server returns validation errors (React resets `action={}` forms by default).
 */
export function keepValues(dispatch: (fd: FormData) => void) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => dispatch(fd));
  };
}
