import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { getCurrentUser } from "@/lib/auth/session";
import { pageMetadata } from "@/lib/seo";
import { safeNext } from "@/lib/validation";

export const metadata = pageMetadata({ title: "Create account", path: "/register", noIndex: true });

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next, "");
  if (await getCurrentUser()) redirect(next || "/account");
  return (
    <div className="bg-ink text-bone">
      <div className="container-x grid min-h-[70svh] place-items-center py-16 md:py-24">
        <div className="w-full max-w-md">
          <h1 className="display mb-3 text-[clamp(3rem,10vw,5.5rem)]">Join BRO&apos;S.</h1>
          <p className="mb-10 text-sm text-mist">Save addresses, track orders and check out faster.</p>
          <AuthForm mode="register" next={next || undefined} />
        </div>
      </div>
    </div>
  );
}
