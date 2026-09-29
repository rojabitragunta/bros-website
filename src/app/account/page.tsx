import { AccountView } from "@/components/account/AccountView";
import { requireUser } from "@/lib/auth/session";
import { getAddresses, getUserOrders } from "@/lib/services/account";
import { releaseExpiredReservations } from "@/lib/services/orders";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Account", path: "/account", noIndex: true });

export default async function AccountPage() {
  const user = await requireUser("/account");
  await releaseExpiredReservations();
  const [orders, addresses] = await Promise.all([getUserOrders(user.id), getAddresses(user.id)]);
  return (
    <div className="bg-ink text-bone">
      <AccountView
        user={{
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          memberSince: user.createdAt.toISOString(),
          preferences: user.preferences,
        }}
        orders={orders}
        addresses={addresses}
      />
    </div>
  );
}
