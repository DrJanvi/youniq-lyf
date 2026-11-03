import { PageHeader } from "@/components/admin/common/PageHeader";
import { HighlightedCategoryForm } from "@/components/admin/forms/HighlightedCategoryForm";
import { requireAdminPage } from "@/lib/auth/session";
import { getHighlightedCategorySetting } from "@/services/highlighted-category";

export default async function AdminHighlightedCategoryPage() {
  await requireAdminPage();
  const setting = await getHighlightedCategorySetting();

  return (
    <>
      <PageHeader
        title="Highlighted category"
        description="Manage the featured category section shown on the storefront home page."
      />
      <HighlightedCategoryForm
        initial={{
          image: setting.image,
          title: setting.title,
          description: setting.description,
          buttonLink: setting.buttonLink,
          days: Math.floor(setting.durationSeconds / 86400),
          hours: Math.floor((setting.durationSeconds % 86400) / 3600),
          minutes: Math.floor((setting.durationSeconds % 3600) / 60),
          seconds: setting.durationSeconds % 60,
          isEnabled: setting.isEnabled,
          autoRestart: setting.autoRestart,
        }}
      />
    </>
  );
}
