import { PolicyContentPage } from "@/components/shop/PolicyContentPage";
import { buildMetadata } from "@/lib/seo";

export const instant = false;

export const metadata = buildMetadata({
  title: "Refunds Policy",
  description: "Review Youniqlyf's refunds policy.",
  path: "/refunds-policy",
});

export default function RefundsPolicyPage() {
  return <PolicyContentPage slug="refunds-policy" title="Refunds Policy" />;
}
