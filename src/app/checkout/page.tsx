import { CheckoutView } from "@/components/cart/CheckoutView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Checkout", path: "/checkout", noIndex: true });

export default function CheckoutPage() {
  return (
    <div className="bg-ink text-bone">
      <CheckoutView />
    </div>
  );
}
