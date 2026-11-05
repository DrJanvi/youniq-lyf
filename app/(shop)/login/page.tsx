import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/shop/LoginForm";
import { getCurrentUser } from "@/lib/auth/session";
import { buildMetadata } from "@/lib/seo";

export const instant = false;
export const metadata: Metadata = buildMetadata({ title: "Login or register", path: "/login", noindex: true });

// Only allow same-site relative redirects.
const safeNext = (n?: string) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/");

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string | string[];
    deletionScheduled?: string | string[];
    recoveryDeadline?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const single = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;
  const next = safeNext(single(params.next));
  const recoveryDeadline = single(params.recoveryDeadline);
  const deadline =
    recoveryDeadline && Number.isFinite(Date.parse(recoveryDeadline))
      ? new Intl.DateTimeFormat("en", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "UTC",
          timeZoneName: "short",
        }).format(new Date(recoveryDeadline))
      : null;
  const deletionScheduled = single(params.deletionScheduled) === "1";
  if (await getCurrentUser()) redirect(next);
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div className="rounded-2xl border border-surface-border bg-surface-card p-6 sm:p-8">
        <h1 className="sr-only">Sign in or register</h1>
        {deletionScheduled ? (
          <p
            role="status"
            className="mb-5 rounded-xl bg-surface-card p-4 text-sm leading-6 text-text-primary"
          >
            Your account deletion is scheduled. Sign in
            {deadline ? ` before ${deadline}` : " within 30 days"} to restore
            your account. After the recovery period ends, customer access
            cannot be restored.
          </p>
        ) : null}
        <LoginForm next={next} />
      </div>
    </div>
  );
}
