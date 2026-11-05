import type { Metadata } from "next";
import { AccountDetailsForm } from "@/components/shop/AccountDetailsForm";
import { AccountShell } from "@/components/shop/AccountShell";
import { requireUserPage } from "@/lib/auth/session";
import { buildMetadata } from "@/lib/seo";
import { getCustomerProfile } from "@/services/customer-profile";

export const instant = false;
export const metadata: Metadata = buildMetadata({ title: "My account", path: "/account", noindex: true });

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ recovered?: string }>;
}) {
  const user = await requireUserPage("/account");
  const [profile, params] = await Promise.all([
    getCustomerProfile(user.id),
    searchParams,
  ]);
  return (
    <AccountShell active="details">
      {params.recovered === "1" ? (
        <p
          role="status"
          className="mb-3 rounded-xl bg-status-success-soft p-4 text-sm text-green-800"
        >
          Your account has been restored. The deletion request was canceled.
        </p>
      ) : null}
      <section>
        <h2 className="rounded-lg bg-surface-card px-4 py-3 text-sm font-medium text-text-primary">
          Account Details
        </h2>
        <div className="mt-2 rounded-lg bg-surface-main p-4 sm:p-6">
          <AccountDetailsForm
            name={profile.name ?? ""}
            email={profile.email ?? ""}
            phone={profile.phone ?? ""}
            gender={profile.gender ?? ""}
            dateOfBirth={profile.dateOfBirth?.toISOString().slice(0, 10) ?? ""}
          />
        </div>
      </section>
    </AccountShell>
  );
}
