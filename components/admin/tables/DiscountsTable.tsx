"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { DataTable, type Column, type TableFilter } from "@/components/admin/common/DataTable";
import { RowActions } from "@/components/admin/common/RowActions";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import { formatDateTime } from "@/lib/admin/format";
import type { TableMeta } from "./types";

export type DiscountRow = {
  id: string; name: string; type: "PERCENT" | "FIXED"; value: number; target: string;
  startsAt: string | null; endsAt: string | null; isActive: boolean; deletedAt: string | null;
};

export function DiscountsTable({ rows, meta, filters }: { rows: DiscountRow[]; meta: TableMeta; filters: TableFilter[] }) {
  const columns: Column<DiscountRow>[] = [
    { id: "name", header: "Name", sortKey: "name", cell: (d) => d.deletedAt ? <span className="font-medium">{d.name}</span> : <Link href={`/admin/discounts/${d.id}`} className="font-medium hover:underline">{d.name}</Link> },
    { id: "value", header: "Value", sortKey: "value", cell: (d) => (d.type === "PERCENT" ? `${d.value}%` : `${d.value} off`) },
    { id: "target", header: "Applies to", cell: (d) => d.target },
    { id: "startsAt", header: "Starts", sortKey: "startsAt", cell: (d) => formatDateTime(d.startsAt) },
    { id: "endsAt", header: "Ends", sortKey: "endsAt", cell: (d) => formatDateTime(d.endsAt) },
    { id: "isActive", header: "Status", sortKey: "isActive", cell: (d) => <StatusBadge status={d.isActive ? "ACTIVE" : "INACTIVE"} /> },
    { id: "deletedAt", header: "Record", cell: (d) => d.deletedAt ? <StatusBadge status="DELETED" label="Deleted" /> : <StatusBadge status="ACTIVE" label="Active" /> },
    {
      id: "actions",
      header: "",
      className: "text-right",
      cell: (d) => <RowActions editHref={`/admin/discounts/${d.id}`} deleteUrl={d.deletedAt ? undefined : `/api/admin/discounts/${d.id}`} restoreUrl={d.deletedAt ? `/api/admin/discounts/${d.id}` : undefined} itemName={d.name} />,
    },
  ];
  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowId={(r) => r.id}
      {...meta}
      searchValue={meta.q}
      searchPlaceholder="Search discounts…"
      filters={filters}
      emptyTitle="No discounts yet"
      emptyAction={
        <Button asChild size="sm">
          <Link href="/admin/discounts/new">
            <Plus /> Add discount
          </Link>
        </Button>
      }
    />
  );
}
