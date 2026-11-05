import { AddButton } from "@/components/admin/common/AddButton";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { CouponsTable } from "@/components/admin/tables/CouponsTable";
import { type SearchParams, parseListParams } from "@/lib/admin/list-params";
import { requireAdminPage } from "@/lib/auth/session";
import { listCoupons } from "@/services/coupon";

export default async function AdminCouponsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminPage();
  const params = parseListParams(await searchParams, {
    sortable: ["code", "value", "startsAt", "endsAt", "isActive", "createdAt"],
    defaultSort: "createdAt",
    filters: { status: ["active", "inactive", "expired"], type: ["PERCENT", "FIXED"], deleted: ["active", "deleted"] },
  });
  const result = await listCoupons(params.page, params);

  return (
    <>
      <PageHeader title="Coupons" description="Create whole-order coupon codes for checkout." actions={<AddButton href="/admin/coupons/new" label="Add coupon" />} />
      <CouponsTable
        meta={{ total: result.pagination.total, page: result.pagination.page, totalPages: result.pagination.totalPages, sort: params.sort, dir: params.dir, q: params.q }}
        filters={[
          { param: "status", label: "Status", value: params.filters.status, options: [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }, { value: "expired", label: "Expired" }] },
          { param: "deleted", label: "Record", value: params.filters.deleted, options: [{ value: "active", label: "Not deleted" }, { value: "deleted", label: "Deleted" }] },
          { param: "type", label: "Type", value: params.filters.type, options: [{ value: "PERCENT", label: "Percentage" }, { value: "FIXED", label: "Fixed" }] },
        ]}
        rows={result.data.map((coupon) => ({
          id: coupon.id,
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          minimumSubtotal: coupon.minimumSubtotal,
          maxDiscount: coupon.maxDiscount,
          startsAt: coupon.startsAt?.toISOString() ?? null,
          endsAt: coupon.endsAt?.toISOString() ?? null,
          isActive: coupon.isActive,
          deletedAt: coupon.deletedAt?.toISOString() ?? null,
        }))}
      />
    </>
  );
}
