import { BagView } from "@/components/cart/BagView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Your Bag", path: "/bag", noIndex: true });

export default function BagPage() {
  return (
    <div className="bg-ink text-bone">
      <BagView />
    </div>
  );
}
