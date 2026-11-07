import { PageHeader } from "@/components/admin/common/PageHeader";
import { ShopifyImportPanel } from "@/components/admin/pages/ShopifyImportPanel";
import { requireAdminPage } from "@/lib/auth/session";

export default async function ShopifyImportPage() {
  await requireAdminPage();
  return (
    <>
      <PageHeader
        title="Shopify import"
        description="Move the products in your Shopify export into this catalogue."
      />
      <ShopifyImportPanel />
    </>
  );
}
