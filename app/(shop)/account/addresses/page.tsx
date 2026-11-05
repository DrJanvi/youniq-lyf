import type { Metadata } from "next";
import { AccountAddressesManager } from "@/components/shop/AccountAddressesManager";
import { AccountShell } from "@/components/shop/AccountShell";
import { requireUserPage } from "@/lib/auth/session";
import { buildMetadata } from "@/lib/seo";
import { listSavedAddresses } from "@/services/address";
import { getCustomerProfile } from "@/services/customer-profile";

export const instant = false;
export const metadata: Metadata = buildMetadata({ title: "Manage address", path: "/account/addresses", noindex: true });

export default async function ManageAddressesPage({
  searchParams,
}: {
  searchParams: Promise<{ add?: string | string[]; edit?: string | string[] }>;
}) {
  const user = await requireUserPage("/account/addresses");
  const params = await searchParams;
  const requestedAdd = Array.isArray(params.add) ? params.add[0] : params.add;
  const requestedEditId = Array.isArray(params.edit) ? params.edit[0] : params.edit;
  const [addresses, profile] = await Promise.all([
    listSavedAddresses(user.id),
    getCustomerProfile(user.id),
  ]);
  const initialEditingAddressId =
    requestedEditId && addresses.some((address) => address.id === requestedEditId)
      ? requestedEditId
      : null;

  return (
    <AccountShell active="addresses">
      <AccountAddressesManager
        initialAddresses={addresses}
        initialAddAddress={requestedAdd === "1"}
        initialEditingAddressId={initialEditingAddressId}
        customerEmail={profile.email}
        customerName={profile.name}
        customerPhone={profile.phone}
      />
    </AccountShell>
  );
}
