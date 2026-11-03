import { AboutUsEditor } from "@/components/admin/pages/AboutUsEditor";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { requireAdminPage } from "@/lib/auth/session";
import { getAboutUsPageSettings } from "@/services/about-us";

export default async function AdminAboutUsPage() {
  await requireAdminPage();
  const settings = await getAboutUsPageSettings();

  return (
    <>
      <PageHeader
        title="About Us"
        description="Manage the About Us storefront content and responsive hero images."
      />
      <AboutUsEditor settings={settings} />
    </>
  );
}
