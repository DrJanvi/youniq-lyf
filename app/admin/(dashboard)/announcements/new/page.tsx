import { PageHeader } from "@/components/admin/common/PageHeader";
import { AnnouncementForm } from "@/components/admin/forms/AnnouncementForm";
import { requireAdminPage } from "@/lib/auth/session";

export default async function NewAnnouncementPage() {
  await requireAdminPage();
  return (
    <>
      <PageHeader title="New announcement" backHref="/admin/announcements" />
      <AnnouncementForm />
    </>
  );
}
