import { PolicyContentPage } from "@/components/shop/PolicyContentPage";
import { buildMetadata } from "@/lib/seo";

export const instant = false;

export const metadata = buildMetadata({
  title: "Return & Exchange Policy",
  description: "Review Banafa's return and exchange policy.",
  path: "/return-exchange-policy",
});

export default function ReturnExchangePolicyPage() {
  return (
    <PolicyContentPage
      slug="return-exchange-policy"
      title="Return & Exchange Policy"
    />
  );
}
