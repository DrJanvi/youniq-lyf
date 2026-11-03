"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { DataTable, type Column, type TableFilter } from "@/components/admin/common/DataTable";
import { RowActions } from "@/components/admin/common/RowActions";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import { formatDateTime } from "@/lib/admin/format";
import type { TableMeta } from "./types";

export type CouponRow = {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minimumSubtotal: number | null;
  maxDiscount: number | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
};

export function CouponsTable({ rows, meta, filters }: { rows: CouponRow[]; meta: TableMeta; filters: TableFilter[] }) {
  const columns: Column<CouponRow>[] = [
    { id: "code", header: "Code", sortKey: "code", cell: (coupon) => <Link href={`/admin/coupons/${coupon.id}`} className="font-mono font-medium hover:underline">{coupon.code}</Link> },
    {
      id: "value",
      header: "Value",
      sortKey: "value",
      cell: (coupon) => (
        <span>
          {coupon.type === "PERCENT" ? `${coupon.value}%` : `${coupon.value.toFixed(2)} off`}
          {coupon.maxDiscount !== null ? ` (max ${coupon.maxDiscount.toFixed(2)})` : ""}
        </span>
      ),
    },
    { id: "minimumSubtotal", header: "Minimum spend", cell: (coupon) => coupon.minimumSubtotal === null ? "—" : coupon.minimumSubtotal.toFixed(2) },
    { id: "startsAt", header: "Starts", sortKey: "startsAt", cell: (coupon) => formatDateTime(coupon.startsAt) },
    { id: "endsAt", header: "Ends", sortKey: "endsAt", cell: (coupon) => formatDateTime(coupon.endsAt) },
    { id: "isActive", header: "Status", sortKey: "isActive", cell: (coupon) => <StatusBadge status={coupon.isActive ? "ACTIVE" : "INACTIVE"} /> },
    {
      id: "actions",
      header: "",
      className: "text-right",
      cell: (coupon) => <RowActions editHref={`/admin/coupons/${coupon.id}`} deleteUrl={`/api/admin/coupons/${coupon.id}`} itemName={coupon.code} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowId={(coupon) => coupon.id}
      {...meta}
      searchValue={meta.q}
      searchPlaceholder="Search coupon codes…"
      filters={filters}
      emptyTitle="No coupons yet"
      emptyAction={
        <Button asChild size="sm">
          <Link href="/admin/coupons/new">
            <Plus /> Add coupon
          </Link>
        </Button>
      }
    />
  );
}
