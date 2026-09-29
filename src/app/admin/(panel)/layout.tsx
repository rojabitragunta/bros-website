import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-dvh bg-ink text-bone lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-line p-3 lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r lg:p-5">
        <AdminNav email={admin.email} />
      </aside>
      <div className="min-w-0 px-4 py-8 sm:px-8 lg:py-10">{children}</div>
    </div>
  );
}
