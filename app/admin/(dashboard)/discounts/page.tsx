import { AddButton } from "@/components/admin/common/AddButton";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { DiscountsTable } from "@/components/admin/tables/DiscountsTable";
import { type SearchParams, parseListParams } from "@/lib/admin/list-params";
import { requireAdminPage } from "@/lib/auth/session";
import { listDiscounts } from "@/services/discount";

export default async function AdminDiscountsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminPage();
  const p = parseListParams(await searchParams, {
    sortable: ["name", "value", "startsAt", "endsAt", "isActive", "createdAt"],
    defaultSort: "createdAt",
    filters: { status: ["active", "inactive", "expired"], type: ["PERCENT", "FIXED"], deleted: ["active", "deleted"] },
  });
  const result = await listDiscounts(p.page, p);
  return (
    <>
      <PageHeader title="Discounts" description="Promotions applied to the store, a category or a product." actions={<AddButton href="/admin/discounts/new" label="Add discount" />} />
      <DiscountsTable
        meta={{ total: result.pagination.total, page: result.pagination.page, totalPages: result.pagination.totalPages, sort: p.sort, dir: p.dir, q: p.q }}
        filters={[
          { param: "status", label: "Status", value: p.filters.status, options: [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }, { value: "expired", label: "Expired" }] },
          { param: "deleted", label: "Record", value: p.filters.deleted, options: [{ value: "active", label: "Not deleted" }, { value: "deleted", label: "Deleted" }] },
          { param: "type", label: "Type", value: p.filters.type, options: [{ value: "PERCENT", label: "Percentage" }, { value: "FIXED", label: "Fixed" }] },
        ]}
        rows={result.data.map((d) => ({
          id: d.id,
          name: d.name,
          type: d.type,
          value: d.value,
          target: d.product?.title ?? d.category?.name ?? "Entire store",
          startsAt: d.startsAt?.toISOString() ?? null,
          endsAt: d.endsAt?.toISOString() ?? null,
          isActive: d.isActive,
          deletedAt: d.deletedAt?.toISOString() ?? null,
        }))}
      />
    </>
  );
}
