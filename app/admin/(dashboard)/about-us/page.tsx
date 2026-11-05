import { AboutUsEditor } from "@/components/admin/pages/AboutUsEditor";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { requireAdminPage } from "@/lib/auth/session";
import { getAboutUsPageSettings, listDeletedAboutUsItems } from "@/services/about-us";

export default async function AdminAboutUsPage() {
  await requireAdminPage();
  const [settings, deletedItems] = await Promise.all([
    getAboutUsPageSettings(),
    listDeletedAboutUsItems(),
  ]);

  return (
    <>
      <PageHeader
        title="About Us"
        description="Manage the About Us storefront content and responsive hero images."
      />
      <AboutUsEditor key={deletedItems.length} settings={settings} deletedItems={deletedItems} />
    </>
  );
}
