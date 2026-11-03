import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { formatMoney } from "@/components/ui/PriceTag";
import { requireUserPage } from "@/lib/auth/session";
import { orderStatusLabels, paymentMethodLabels } from "@/lib/order-status";
import { parsePagination } from "@/lib/pagination";
import { buildMetadata } from "@/lib/seo";
import { listUserOrders } from "@/services/order";

export const instant = false;
export const metadata: Metadata = buildMetadata({ title: "Your orders", path: "/orders", noindex: true });

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUserPage("/orders");
  const result = await listUserOrders(user.id, parsePagination(await searchParams, 10));
  return (
    <div className="flex flex-col gap-4">
      <Breadcrumbs crumbs={[{ name: "Home", href: "/" }, { name: "Orders", href: "/orders" }]} />
      <h1>Your orders</h1>
      <DataTable
        rows={result.data}
        empty="You have no orders yet."
        columns={[
          { header: "Order", cell: (o) => o.id.slice(0, 8) },
          { header: "Date", cell: (o) => o.createdAt.toISOString().slice(0, 10) },
          { header: "Items", cell: (o) => o.items.map((i) => `${i.quantity} × ${i.title}`).join(", ") },
          { header: "Total", cell: (o) => formatMoney(o.total, o.currency) },
          { header: "Payment", cell: (o) => paymentMethodLabels[o.paymentMethod] },
          {
            header: "Status",
            cell: (o) => (
              <div>
                <p>{orderStatusLabels[o.status] ?? o.status}</p>
                {o.deliveryPartner ? <p className="text-xs text-muted-foreground">{o.deliveryPartner}</p> : null}
                {o.deliveryReferenceId ? <p className="text-xs text-muted-foreground">Reference: {o.deliveryReferenceId}</p> : null}
                {o.deliveryTrackingUrl ? (
                  <a
                    href={o.deliveryTrackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary underline"
                  >
                    Track delivery
                  </a>
                ) : null}
              </div>
            ),
          },
        ]}
      />
      <Pagination basePath="/orders" page={result.pagination.page} totalPages={result.pagination.totalPages} />
    </div>
  );
}
