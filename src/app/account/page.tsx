import { AccountView } from "@/components/account/AccountView";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Account", path: "/account", noIndex: true });

export default function AccountPage() {
  return (
    <div className="bg-ink text-bone">
      <AccountView />
    </div>
  );
}
