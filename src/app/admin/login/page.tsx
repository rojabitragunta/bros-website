import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user?.role === "admin") redirect("/admin");
  return (
    <div className="grid min-h-dvh place-items-center bg-ink px-4 text-bone">
      <div className="w-full max-w-sm">
        <p className="text-3xl font-black tracking-tight">BRO&apos;S</p>
        <h1 className="eyebrow mb-8 mt-2 text-mist">Admin sign in</h1>
        {user && <p className="mb-4 text-sm text-amber-200">You&apos;re signed in as {user.email}, which doesn&apos;t have admin access.</p>}
        <AdminLoginForm />
      </div>
    </div>
  );
}
