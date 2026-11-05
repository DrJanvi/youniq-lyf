import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUserPage } from "@/lib/auth/session";
import { buildMetadata } from "@/lib/seo";

export const instant = false;
export const metadata: Metadata = buildMetadata({ title: "Address details", path: "/account/addresses/new", noindex: true });

export default async function NewAddressPage() {
  await requireUserPage("/account/addresses/new");
  redirect("/account/addresses?add=1");
}
