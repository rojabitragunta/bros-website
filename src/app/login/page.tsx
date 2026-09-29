import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { getCurrentUser } from "@/lib/auth/session";
import { pageMetadata } from "@/lib/seo";
import { safeNext } from "@/lib/validation";

export const metadata = pageMetadata({ title: "Sign in", path: "/login", noIndex: true });

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next, "");
  if (await getCurrentUser()) redirect(next || "/account");
  return (
    <div className="bg-ink text-bone">
      <div className="container-x grid min-h-[70svh] place-items-center py-16 md:py-24">
        <div className="w-full max-w-md">
          <h1 className="display mb-3 text-[clamp(3rem,10vw,5.5rem)]">Welcome back.</h1>
          <p className="mb-10 text-sm text-mist">Sign in to check out, track orders and manage your addresses.</p>
          <AuthForm mode="login" next={next || undefined} />
        </div>
      </div>
    </div>
  );
}
