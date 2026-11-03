import { AddButton } from "@/components/admin/common/AddButton";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { TaxonomyTable } from "@/components/admin/tables/TaxonomyTable";
import { type SearchParams, parseListParams } from "@/lib/admin/list-params";
import { type TaxonomyKind, taxonomyConfig } from "@/lib/admin/taxonomy-config";
import { requireAdminPage } from "@/lib/auth/session";
import { listTaxonomyAdmin } from "@/services/taxonomy";

export async function TaxonomyListPage({ kind, searchParams }: { kind: TaxonomyKind; searchParams: Promise<SearchParams> }) {
  await requireAdminPage();
  const cfg = taxonomyConfig[kind];
  const p = parseListParams(await searchParams, { sortable: ["name", "products", "createdAt"], defaultSort: "name", defaultDir: "asc" });
  const result = await listTaxonomyAdmin(kind, p);
  const basePath = `/admin/${cfg.path}`;
  return (
    <>
      <PageHeader title={cfg.plural} description={`Manage ${cfg.plural.toLowerCase()} used to organise products.`} actions={<AddButton href={`${basePath}/new`} label={`Add ${cfg.singular.toLowerCase()}`} />} />
      <TaxonomyTable
        basePath={basePath}
        endpoint={`/api/admin/${cfg.path}`}
        singular={cfg.singular}
        withImage={cfg.withDetails}
        meta={{ total: result.pagination.total, page: result.pagination.page, totalPages: result.pagination.totalPages, sort: p.sort, dir: p.dir, q: p.q }}
        rows={result.data.map((r) => ({ id: r.id, name: r.name, slug: r.slug, image: r.image, products: r._count.products, createdAt: r.createdAt.toISOString() }))}
      />
    </>
  );
}
