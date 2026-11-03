"use client";

import Link from "next/link";
import { Check, EyeOff, Plus, Star } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { ActionButton } from "@/components/admin/common/ActionButton";
import { DataTable, type Column, type TableFilter } from "@/components/admin/common/DataTable";
import { RowActions } from "@/components/admin/common/RowActions";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import type { TableMeta } from "./types";

export type ReviewRow = {
  id: string; product: string; rating: number; title: string | null; body: string; authorName: string;
  status: "PENDING" | "APPROVED" | "HIDDEN"; createdAt: string;
};

export function ReviewsTable({ rows, meta, filters }: { rows: ReviewRow[]; meta: TableMeta; filters: TableFilter[] }) {
  const columns: Column<ReviewRow>[] = [
    { id: "product", header: "Product", sortKey: "product", cell: (r) => <span className="line-clamp-2 max-w-[14rem] font-medium">{r.product}</span> },
    {
      id: "rating",
      header: "Rating",
      sortKey: "rating",
      cell: (r) => (
        <span className="inline-flex items-center gap-1">
          <Star className="size-4 fill-warning text-warning" /> {r.rating}
        </span>
      ),
    },
    {
      id: "body",
      header: "Review",
      cell: (r) => (
        <div className="max-w-sm">
          {r.title ? <p className="font-medium">{r.title}</p> : null}
          <p className="line-clamp-2 text-muted-foreground">{r.body}</p>
          <p className="text-xs text-muted-foreground">— {r.authorName}</p>
        </div>
      ),
    },
    { id: "status", header: "Status", sortKey: "status", cell: (r) => <StatusBadge status={r.status} /> },
    { id: "createdAt", header: "Date", sortKey: "createdAt", cell: (r) => r.createdAt.slice(0, 10) },
    {
      id: "actions",
      header: "",
      className: "text-right",
      cell: (r) => (
        <RowActions
          editHref={`/admin/reviews/${r.id}`}
          deleteUrl={`/api/admin/reviews/${r.id}`}
          itemName="review"
          extra={
            <>
              {r.status !== "APPROVED" ? <ActionButton url={`/api/admin/reviews/${r.id}`} label="Approve" json={{ status: "APPROVED" }} success="Review approved" icon={<Check />} /> : null}
              {r.status !== "HIDDEN" ? <ActionButton url={`/api/admin/reviews/${r.id}`} label="Hide" json={{ status: "HIDDEN" }} success="Review hidden" icon={<EyeOff />} /> : null}
            </>
          }
        />
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
      searchPlaceholder="Search author, text or product…"
      filters={filters}
      emptyTitle="No reviews yet"
      emptyAction={
        <Button asChild size="sm">
          <Link href="/admin/reviews/new">
            <Plus /> Add review
          </Link>
        </Button>
      }
    />
  );
}
