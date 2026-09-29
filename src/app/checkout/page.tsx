import { CheckoutView } from "@/components/cart/CheckoutView";
import { requireUser } from "@/lib/auth/session";
import { razorpayEnabled } from "@/lib/payments/razorpay";
import { getAddresses } from "@/lib/services/account";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Checkout", path: "/checkout", noIndex: true });

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const addresses = await getAddresses(user.id);
  return (
    <div className="bg-ink text-bone">
      <CheckoutView
        user={{ email: user.email, name: `${user.firstName} ${user.lastName}`.trim(), phone: user.phone }}
        addresses={addresses}
        onlinePayments={razorpayEnabled()}
      />
    </div>
  );
}
