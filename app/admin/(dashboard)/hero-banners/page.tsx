import { AddButton } from "@/components/admin/common/AddButton";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { HeroBannersTable } from "@/components/admin/tables/HeroBannersTable";
import { type SearchParams, parseListParams } from "@/lib/admin/list-params";
import { requireAdminPage } from "@/lib/auth/session";
import { listHeroBannersAdmin } from "@/services/hero-banner";

export default async function AdminHeroBannersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminPage();
  const p = parseListParams(await searchParams, { sortable: ["sortOrder", "alt", "createdAt"], defaultSort: "sortOrder", defaultDir: "asc", filters: { deleted: ["active", "deleted"] } });
  const result = await listHeroBannersAdmin(p);
  return (
    <>
      <PageHeader title="Hero banners" description="Slides shown at the top of the storefront home page." actions={<AddButton href="/admin/hero-banners/new" label="Add banner" />} />
      <HeroBannersTable
        meta={{ total: result.pagination.total, page: result.pagination.page, totalPages: result.pagination.totalPages, sort: p.sort, dir: p.dir, q: p.q }}
        deleted={p.filters.deleted}
        rows={result.data.map((r) => ({ id: r.id, desktopImage: r.desktopImage, mobileImage: r.mobileImage, link: r.link, alt: r.alt, sortOrder: r.sortOrder, deletedAt: r.deletedAt?.toISOString() ?? null }))}
      />
    </>
  );
}
