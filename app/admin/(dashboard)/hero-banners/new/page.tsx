import { PageHeader } from "@/components/admin/common/PageHeader";
import { HeroBannerForm } from "@/components/admin/forms/HeroBannerForm";
import { requireAdminPage } from "@/lib/auth/session";

export default async function Page() {
  await requireAdminPage();
  return (
    <>
      <PageHeader title="New hero banner" backHref="/admin/hero-banners" />
      <HeroBannerForm />
    </>
  );
}
