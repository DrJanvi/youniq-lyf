import { AddButton } from "@/components/admin/common/AddButton";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { AnnouncementsTable } from "@/components/admin/tables/AnnouncementsTable";
import { type SearchParams, parseListParams } from "@/lib/admin/list-params";
import { requireAdminPage } from "@/lib/auth/session";
import { listAnnouncementsAdmin } from "@/services/announcement";

export default async function AdminAnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdminPage();
  const params = parseListParams(await searchParams, {
    sortable: ["message", "sortOrder", "createdAt"],
    defaultSort: "sortOrder",
    defaultDir: "asc",
    filters: { deleted: ["active", "deleted"] },
  });
  const result = await listAnnouncementsAdmin(params);
  return (
    <>
      <PageHeader
        title="Announcements"
        description="Manage the messages that rotate in the storefront announcement bar."
        actions={<AddButton href="/admin/announcements/new" label="Add announcement" />}
      />
      <AnnouncementsTable
        meta={{
          total: result.pagination.total,
          page: result.pagination.page,
          totalPages: result.pagination.totalPages,
          sort: params.sort,
          dir: params.dir,
          q: params.q,
        }}
        deleted={params.filters.deleted}
        rows={result.data.map((item) => ({
          id: item.id,
          message: item.message,
          link: item.link,
          sortOrder: item.sortOrder,
          deletedAt: item.deletedAt?.toISOString() ?? null,
        }))}
      />
    </>
  );
}
