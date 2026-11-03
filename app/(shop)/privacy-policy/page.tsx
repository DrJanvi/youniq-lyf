import { PolicyContentPage } from "@/components/shop/PolicyContentPage";
import { buildMetadata } from "@/lib/seo";

export const instant = false;

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "Read how Banafa handles customer and personal information.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <PolicyContentPage slug="privacy-policy" title="Privacy Policy" />
  );
}
