"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { DataTable, type Column, type TableFilter } from "@/components/admin/common/DataTable";
import { DeleteButton } from "@/components/admin/common/DeleteButton";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import { OrderDecision } from "@/components/admin/forms/OrderDecision";
import { formatDateTime } from "@/lib/admin/format";
import type { TableMeta } from "./types";

export type OrderRow = {
  id: string; createdAt: string; name: string | null; email: string | null; itemCount: number; total: string;
  couponCode: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "DISPATCHED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "DELIVERY_ATTEMPT_FAILED";
};

export function OrdersTable({ rows, meta, filters }: { rows: OrderRow[]; meta: TableMeta; filters: TableFilter[] }) {
  const columns: Column<OrderRow>[] = [
    { id: "id", header: "Order", cell: (o) => <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs hover:underline">#{o.id.slice(0, 8)}</Link> },
    { id: "createdAt", header: "Date", sortKey: "createdAt", cell: (o) => formatDateTime(o.createdAt) },
    {
      id: "customer",
      header: "Customer",
      sortKey: "customer",
      cell: (o) => (
        <div>
          <p className="font-medium">{o.name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{o.email ?? "—"}</p>
        </div>
      ),
    },
    { id: "items", header: "Items", cell: (o) => o.itemCount },
    { id: "couponCode", header: "Coupon", cell: (o) => o.couponCode ? <span className="font-mono text-xs">{o.couponCode}</span> : "—" },
    { id: "total", header: "Total", sortKey: "total", cell: (o) => o.total },
    { id: "status", header: "Status", sortKey: "status", cell: (o) => <StatusBadge status={o.status} /> },
    {
      id: "actions",
      header: "",
      className: "text-right",
      cell: (o) => (
        <div className="flex items-center justify-end gap-1.5">
          {o.status === "PENDING" ? <OrderDecision orderId={o.id} /> : null}
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/orders/${o.id}`}>
              <Eye /> View
            </Link>
          </Button>
          {o.status === "PENDING" || o.status === "REJECTED" ? <DeleteButton url={`/api/admin/orders/${o.id}`} itemName="order" /> : null}
        </div>
      ),
    },
  ];
  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowId={(r) => r.id}
      {...meta}
      searchValue={meta.q}
      searchPlaceholder="Search order id, name, email, phone…"
      filters={filters}
      emptyTitle="No orders yet"
    />
  );
}
