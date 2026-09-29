"use client";

import { useActionState, useTransition } from "react";
import { cancelOrderAdmin, markRefunded, updateOrderStatusAction, updateTrackingAction } from "@/app/admin/actions";
import type { FormState } from "@/app/actions/auth";
import { ORDER_STATUS_LABEL } from "@/lib/order-display";
import type { OrderStatus } from "@/types";
import { FormError, FormSuccess } from "@/components/ui/Field";
import { btnCls, btnOutlineCls, inputCls, labelCls, selectCls } from "./ui";

export function StatusForm({ orderId, next, courier, trackingNumber }: { orderId: string; next: OrderStatus[]; courier: string; trackingNumber: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateOrderStatusAction, {});
  if (!next.length) return <p className="text-sm text-mist">No further status changes are available for this order.</p>;
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="orderId" value={orderId} />
      <FormError>{state.error}</FormError>
      <FormSuccess>{state.ok ? state.message : undefined}</FormSuccess>
      <div>
        <label className={labelCls} htmlFor="status">
          Move to
        </label>
        <select id="status" name="status" className={selectCls} defaultValue={next[0]}>
          {next.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="courier">
            Courier
          </label>
          <input id="courier" name="courier" defaultValue={courier} placeholder="e.g. Delhivery" className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="trackingNumber">
            Tracking number
          </label>
          <input id="trackingNumber" name="trackingNumber" defaultValue={trackingNumber} className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls} htmlFor="note">
          Note (shown to customer)
        </label>
        <input id="note" name="note" maxLength={300} className={inputCls} />
      </div>
      {next.includes("returned") && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="restock" className="size-4 accent-[#e3ddd1]" /> If returned: add items back to stock (only if resellable)
        </label>
      )}
      <button className={btnCls} disabled={pending}>
        {pending ? "Saving…" : "Update status"}
      </button>
    </form>
  );
}

export function TrackingForm({ orderId, courier, trackingNumber }: { orderId: string; courier: string; trackingNumber: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateTrackingAction, {});
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <input type="hidden" name="orderId" value={orderId} />
      <div>
        <label className={labelCls} htmlFor="t-courier">
          Courier
        </label>
        <input id="t-courier" name="courier" defaultValue={courier} className={inputCls} />
      </div>
      <div>
        <label className={labelCls} htmlFor="t-number">
          Tracking number
        </label>
        <input id="t-number" name="trackingNumber" defaultValue={trackingNumber} className={inputCls} />
      </div>
      <button className={btnOutlineCls} disabled={pending}>
        Save
      </button>
      <div className="sm:col-span-3">
        <FormError>{state.error}</FormError>
        <FormSuccess>{state.ok ? state.message : undefined}</FormSuccess>
      </div>
    </form>
  );
}

export function CancelForm({ orderId }: { orderId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(cancelOrderAdmin, {});
  return (
    <form
      action={action}
      className="grid gap-3"
      onSubmit={(e) => {
        if (!confirm("Cancel this order and restore its stock?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="orderId" value={orderId} />
      <FormError>{state.error}</FormError>
      <FormSuccess>{state.ok ? state.message : undefined}</FormSuccess>
      <input name="reason" placeholder="Reason (optional, shown to customer)" maxLength={200} className={inputCls} />
      <button className={`${btnOutlineCls} border-red-400/50 text-red-300 hover:border-red-400`} disabled={pending}>
        {pending ? "Cancelling…" : "Cancel order & restock"}
      </button>
    </form>
  );
}

export function MarkRefundedButton({ orderId }: { orderId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      className={btnOutlineCls}
      disabled={pending}
      onClick={() => confirm("Confirm the refund has been completed in Razorpay?") && start(() => markRefunded(orderId))}
    >
      Mark refund completed
    </button>
  );
}
