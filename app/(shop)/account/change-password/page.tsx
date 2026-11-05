import type { Metadata } from "next";
import { AccountShell } from "@/components/shop/AccountShell";
import { ChangePasswordForm } from "@/components/shop/ChangePasswordForm";
import { requireUserPage } from "@/lib/auth/session";
import { buildMetadata } from "@/lib/seo";

export const instant = false;
export const metadata: Metadata = buildMetadata({ title: "Change password", path: "/account/change-password", noindex: true });

export default async function ChangePasswordPage() {
  await requireUserPage("/account/change-password");
  return (
    <AccountShell active="password">
      <section className="rounded-2xl bg-white p-3 sm:p-4">
        <h2 className="rounded-lg bg-[#f3f3f3] px-4 py-3 text-sm font-medium text-text-primary">
          Change Password
        </h2>
        <div className="mt-2 rounded-xl bg-[#fafafa] p-4 sm:p-6">
          <ChangePasswordForm />
        </div>
      </section>
    </AccountShell>
  );
}
