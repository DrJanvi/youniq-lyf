import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/shop/LoginForm";
import { getCurrentUser } from "@/lib/auth/session";
import { buildMetadata } from "@/lib/seo";

export const instant = false;
export const metadata: Metadata = buildMetadata({ title: "Login or register", path: "/login", noindex: true });

// Only allow same-site relative redirects.
const safeNext = (n?: string) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/");

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await getCurrentUser()) redirect(next);
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div className="rounded-2xl border border-surface-border bg-surface-card p-6 sm:p-8">
        <h1 className="sr-only">Sign in or register</h1>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
