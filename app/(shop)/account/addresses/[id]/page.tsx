import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUserPage } from "@/lib/auth/session";
import { buildMetadata } from "@/lib/seo";

export const instant = false;
export const metadata: Metadata = buildMetadata({ title: "Address details", path: "/account/addresses", noindex: true });

export default async function AddressDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUserPage(`/account/addresses/${id}`);
  redirect(`/account/addresses?edit=${encodeURIComponent(id)}`);
}
