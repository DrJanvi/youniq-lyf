import { PolicyContentPage } from "@/components/shop/PolicyContentPage";
import { buildMetadata } from "@/lib/seo";

export const instant = false;

export const metadata = buildMetadata({
  title: "Shipping, Payment & Cancellation Policy",
  description: "Review Youniqlyf's shipping, payment, and cancellation policy.",
  path: "/shipping-payment-cancellation-policy",
});

export default function ShippingPaymentCancellationPolicyPage() {
  return (
    <PolicyContentPage
      slug="shipping-payment-cancellation-policy"
      title="Shipping, Payment & Cancellation Policy"
    />
  );
}
