import type { Metadata } from "next";
import { AccountLogoutButton } from "@/components/shop/AccountLogoutButton";
import { requireUserPage } from "@/lib/auth/session";
import { buildMetadata } from "@/lib/seo";

export const instant = false;
export const metadata: Metadata = buildMetadata({ title: "My account", path: "/account", noindex: true });

export default async function AccountPage() {
  const user = await requireUserPage("/account");
  const details = [
    { label: "Name", value: user.name },
    { label: "Email", value: user.email },
  ];
  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div className="flex flex-col gap-6 rounded-2xl border border-surface-border bg-surface-card p-6 sm:p-8">
        <h1 className="font-cormorant text-3xl font-semibold text-brand-espresso">My account</h1>
        <dl className="flex flex-col gap-4">
          {details.map((d) => (
            <div key={d.label} className="flex flex-col gap-1">
              <dt className="text-sm text-text-muted">{d.label}</dt>
              <dd className="text-text-primary">{d.value || "—"}</dd>
            </div>
          ))}
        </dl>
        <AccountLogoutButton />
      </div>
    </div>
  );
}
