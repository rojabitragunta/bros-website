import { WishlistView } from "@/components/account/WishlistView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Wishlist", path: "/wishlist", noIndex: true });

export default function WishlistPage() {
  return (
    <div className="bg-ink text-bone">
      <WishlistView />
    </div>
  );
}
