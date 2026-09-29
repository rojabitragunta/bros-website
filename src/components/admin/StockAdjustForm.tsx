"use client";

import { useActionState, useEffect, useRef } from "react";
import { adjustStockAction } from "@/app/admin/actions";
import type { FormState } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { btnOutlineCls, inputCls, selectCls } from "./ui";

/** Inline stock adjustment for one variant: receive, remove, or set a counted value. */
export function StockAdjustForm({ variantId, compact }: { variantId: string; compact?: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(adjustStockAction, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="flex flex-wrap items-center gap-1.5">
      <input type="hidden" name="variantId" value={variantId} />
      <select name="mode" aria-label="Adjustment type" className={cn(selectCls, "h-9 w-auto px-2 text-xs")} defaultValue="add">
        <option value="add">+ Receive</option>
        <option value="remove">− Remove</option>
        <option value="set">= Set count</option>
      </select>
      <input name="quantity" type="number" inputMode="numeric" min={0} max={100000} required aria-label="Quantity" placeholder="Qty" className={cn(inputCls, "h-9 w-20 px-2")} />
      {!compact && <input name="note" aria-label="Note" placeholder="Note (e.g. PO #12, damaged)" maxLength={200} className={cn(inputCls, "h-9 w-48 px-2 text-xs")} />}
      <button className={cn(btnOutlineCls, "h-9 px-3")} disabled={pending}>
        {pending ? "…" : "Save"}
      </button>
      {state.error && (
        <span role="alert" className="w-full text-xs text-red-300">
          {state.error}
        </span>
      )}
      {state.ok && (
        <span role="status" className="w-full text-xs text-emerald-300">
          {state.message}
        </span>
      )}
    </form>
  );
}
