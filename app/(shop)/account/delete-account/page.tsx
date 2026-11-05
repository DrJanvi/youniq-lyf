import type { Metadata } from "next";
import { AccountDeletionPanel } from "@/components/shop/AccountDeletionPanel";
import { AccountShell } from "@/components/shop/AccountShell";
import { requireUserPage } from "@/lib/auth/session";
import { buildMetadata } from "@/lib/seo";

export const instant = false;
export const metadata: Metadata = buildMetadata({ title: "Delete account", path: "/account/delete-account", noindex: true });

export default async function DeleteAccountPage() {
  await requireUserPage("/account/delete-account");
  return (
    <AccountShell active="delete">
      <section className="rounded-2xl bg-white p-3 sm:p-4">
        <h2 className="rounded-lg bg-surface-card px-4 py-3 text-sm font-medium text-text-primary">
          Delete My Account
        </h2>
        <div className="mt-2 rounded-xl bg-surface-main p-4 sm:p-6">
          <AccountDeletionPanel />
        </div>
      </section>
    </AccountShell>
  );
}
