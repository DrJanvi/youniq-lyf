import { PageHeader } from "@/components/admin/common/PageHeader";
import { OrdersTable } from "@/components/admin/tables/OrdersTable";
import { formatMoney } from "@/lib/admin/format";
import { type SearchParams, parseListParams } from "@/lib/admin/list-params";
import { requireAdminPage } from "@/lib/auth/session";
import { listOrdersAdmin } from "@/services/order";
import type { OrderStatus } from "@prisma/client";

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminPage();
  const p = parseListParams(await searchParams, {
    sortable: ["createdAt", "customer", "total", "status"],
    defaultSort: "createdAt",
    filters: {
      status: ["PENDING", "APPROVED", "REJECTED", "DISPATCHED", "OUT_FOR_DELIVERY", "DELIVERED", "DELIVERY_ATTEMPT_FAILED"],
      deleted: ["active", "deleted"],
    },
  });
  const result = await listOrdersAdmin(p.page, p.filters.status as OrderStatus | undefined, p);
  return (
    <>
      <PageHeader title="Orders" description="Review orders and manage manual delivery progress." />
      <OrdersTable
        meta={{ total: result.pagination.total, page: result.pagination.page, totalPages: result.pagination.totalPages, sort: p.sort, dir: p.dir, q: p.q }}
        filters={[{
          param: "status",
          label: "Status",
          value: p.filters.status,
          options: [
            { value: "PENDING", label: "Order placed / Processing" },
            { value: "APPROVED", label: "Accepted" },
            { value: "REJECTED", label: "Rejected" },
            { value: "DISPATCHED", label: "Dispatched" },
            { value: "OUT_FOR_DELIVERY", label: "Out for delivery" },
            { value: "DELIVERED", label: "Delivered" },
            { value: "DELIVERY_ATTEMPT_FAILED", label: "Delivery attempt failed" },
          ],
        }, {
          param: "deleted",
          label: "Record",
          value: p.filters.deleted,
          options: [{ value: "active", label: "Not deleted" }, { value: "deleted", label: "Deleted" }],
        }]}
        rows={result.data.map((o) => ({
          id: o.id,
          createdAt: o.createdAt.toISOString(),
          name: o.shippingName,
          email: o.user.email,
          itemCount: o.items.reduce((n, i) => n + i.quantity, 0),
          couponCode: o.couponCode,
          total: formatMoney(o.total, o.currency),
          status: o.status,
          deletedAt: o.deletedAt?.toISOString() ?? null,
        }))}
      />
    </>
  );
}
