import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { AnnouncementForm } from "@/components/admin/forms/AnnouncementForm";
import { requireAdminPage } from "@/lib/auth/session";
import { getAnnouncement } from "@/services/announcement";

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const announcement = await getAnnouncement(id);
  if (!announcement) notFound();

  return (
    <>
      <PageHeader title="Edit announcement" backHref="/admin/announcements" />
      <AnnouncementForm
        id={id}
        initial={{
          message: announcement.message,
          link: announcement.link ?? "",
          sortOrder: announcement.sortOrder,
        }}
      />
    </>
  );
}
