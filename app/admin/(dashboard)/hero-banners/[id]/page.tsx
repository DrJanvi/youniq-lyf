import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { HeroBannerForm } from "@/components/admin/forms/HeroBannerForm";
import { requireAdminPage } from "@/lib/auth/session";
import { getHeroBanner } from "@/services/hero-banner";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const b = await getHeroBanner(id);
  if (!b) notFound();
  return (
    <>
      <PageHeader title="Edit hero banner" backHref="/admin/hero-banners" />
      <HeroBannerForm
        id={id}
        initial={{ desktopImage: b.desktopImage, mobileImage: b.mobileImage ?? "", link: b.link, alt: b.alt ?? "", sortOrder: b.sortOrder }}
      />
    </>
  );
}
