"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cancelMyOrder, verifyPaymentAction } from "@/app/actions/checkout";
import { openRazorpay } from "@/lib/razorpay-client";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/Field";

export function OrderActions(props: {
  orderId: string;
  number: string;
  canCancel: boolean;
  pay?: { keyId: string; razorpayOrderId: string; amount: number; email: string; name: string; phone: string };
}) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();

  const cancel = () => {
    if (!confirm(`Cancel order #${props.number}? This can't be undone.`)) return;
    start(async () => {
      const r = await cancelMyOrder(props.orderId);
      if (!r.ok) setError(r.error);
      router.refresh();
    });
  };

  const pay = () =>
    start(async () => {
      setError(undefined);
      try {
        const p = props.pay!;
        const res = await openRazorpay({
          keyId: p.keyId,
          orderId: p.razorpayOrderId,
          amount: p.amount,
          description: `Order #${props.number}`,
          prefill: { name: p.name, email: p.email, contact: p.phone },
        });
        if (!res) return;
        const v = await verifyPaymentAction({ orderId: props.orderId, razorpayOrderId: res.razorpay_order_id, paymentId: res.razorpay_payment_id, signature: res.razorpay_signature });
        if (!v.ok) setError(v.error);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Payment could not be started.");
      }
    });

  if (!props.canCancel && !props.pay) return null;
  return (
    <div className="grid gap-3">
      <FormError>{error}</FormError>
      <div className="flex flex-wrap gap-2">
        {props.pay && (
          <Button onClick={pay} disabled={pending}>
            {pending ? "Please wait…" : "Complete payment"}
          </Button>
        )}
        {props.canCancel && (
          <Button variant="outline" onClick={cancel} disabled={pending}>
            Cancel order
          </Button>
        )}
      </div>
    </div>
  );
}
