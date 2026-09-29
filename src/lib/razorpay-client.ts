"use client";

/** Opens Razorpay Checkout. Resolves with the signed response, or null if the customer closed it. */

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void };
  }
}

function loadScript() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load Razorpay. Check your connection and try again."));
    document.body.appendChild(s);
  });
}

export async function openRazorpay(opts: {
  keyId: string;
  orderId: string;
  amount: number;
  description: string;
  prefill: { name?: string; email?: string; contact?: string };
}): Promise<RazorpayResponse | null> {
  await loadScript();
  return new Promise((resolve) => {
    const rzp = new window.Razorpay!({
      key: opts.keyId,
      order_id: opts.orderId,
      amount: opts.amount,
      currency: "INR",
      name: "BRO'S",
      description: opts.description,
      prefill: opts.prefill,
      theme: { color: "#0a0a0a" },
      handler: (r: RazorpayResponse) => resolve(r),
      modal: { ondismiss: () => resolve(null) },
    });
    rzp.open();
  });
}
