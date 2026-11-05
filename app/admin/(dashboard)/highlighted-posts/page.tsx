import { AddButton } from "@/components/admin/common/AddButton";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { HighlightedPostsTable } from "@/components/admin/tables/HighlightedPostsTable";
import { type SearchParams, parseListParams } from "@/lib/admin/list-params";
import { requireAdminPage } from "@/lib/auth/session";
import { listHighlightedPostsAdmin } from "@/services/highlighted-post";

export default async function AdminHighlightedPostsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminPage();
  const p = parseListParams(await searchParams, { sortable: ["sortOrder", "alt", "createdAt"], defaultSort: "sortOrder", defaultDir: "asc", filters: { deleted: ["active", "deleted"] } });
  const result = await listHighlightedPostsAdmin(p);
  return (
    <>
      <PageHeader title="Highlighted posts" description="Banners shown on the storefront home page." actions={<AddButton href="/admin/highlighted-posts/new" label="Add post" />} />
      <HighlightedPostsTable
        meta={{ total: result.pagination.total, page: result.pagination.page, totalPages: result.pagination.totalPages, sort: p.sort, dir: p.dir, q: p.q }}
        deleted={p.filters.deleted}
        rows={result.data.map((r) => ({ id: r.id, image: r.image, link: r.link, alt: r.alt, sortOrder: r.sortOrder, deletedAt: r.deletedAt?.toISOString() ?? null }))}
      />
    </>
  );
}
