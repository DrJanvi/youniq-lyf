"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { DataTable, type Column } from "@/components/admin/common/DataTable";
import { RowActions } from "@/components/admin/common/RowActions";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import type { TableMeta } from "./types";

export type AnnouncementRow = {
  id: string;
  message: string;
  link: string | null;
  sortOrder: number;
  deletedAt: string | null;
};

export function AnnouncementsTable({
  rows,
  meta,
  deleted,
}: {
  rows: AnnouncementRow[];
  meta: TableMeta;
  deleted?: string;
}) {
  const columns: Column<AnnouncementRow>[] = [
    {
      id: "message",
      header: "Message",
      sortKey: "message",
      cell: (row) => <span className="block max-w-xl whitespace-pre-wrap">{row.message}</span>,
    },
    {
      id: "link",
      header: "Optional link",
      cell: (row) =>
        row.link ? (
          <a
            href={row.link}
            target="_blank"
            rel="noreferrer"
            className="block max-w-xs truncate text-primary hover:underline"
          >
            {row.link}
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    { id: "sortOrder", header: "Order", sortKey: "sortOrder", cell: (row) => row.sortOrder },
    {
      id: "deletedAt",
      header: "Record",
      cell: (row) =>
        row.deletedAt ? (
          <StatusBadge status="DELETED" label="Deleted" />
        ) : (
          <StatusBadge status="ACTIVE" label="Active" />
        ),
    },
    {
      id: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <RowActions
          editHref={`/admin/announcements/${row.id}`}
          deleteUrl={row.deletedAt ? undefined : `/api/admin/announcements/${row.id}`}
          restoreUrl={row.deletedAt ? `/api/admin/announcements/${row.id}` : undefined}
          itemName="announcement"
        />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowId={(row) => row.id}
      {...meta}
      searchValue={meta.q}
      searchPlaceholder="Search announcements…"
      filters={[
        {
          param: "deleted",
          label: "Record",
          value: deleted,
          options: [
            { value: "active", label: "Not deleted" },
            { value: "deleted", label: "Deleted" },
          ],
        },
      ]}
      emptyTitle="No announcements yet"
      emptyAction={
        <Button asChild size="sm">
          <Link href="/admin/announcements/new">
            <Plus /> Add announcement
          </Link>
        </Button>
      }
    />
  );
}
