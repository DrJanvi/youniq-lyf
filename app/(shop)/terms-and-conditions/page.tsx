import { PolicyContentPage } from "@/components/shop/PolicyContentPage";
import { buildMetadata } from "@/lib/seo";

export const instant = false;

export const metadata = buildMetadata({
  title: "Terms & Conditions",
  description: "Review the terms and conditions for shopping with Banafa.",
  path: "/terms-and-conditions",
});

export default function TermsAndConditionsPage() {
  return (
    <PolicyContentPage
      slug="terms-and-conditions"
      title="Terms & Conditions"
    />
  );
}
