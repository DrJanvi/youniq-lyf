"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { AdminTableImage } from "@/components/admin/common/AdminTableImage";
import { DataTable, type Column } from "@/components/admin/common/DataTable";
import { RowActions } from "@/components/admin/common/RowActions";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import type { TableMeta } from "./types";

export type PostRow = { id: string; image: string; mediaType: "image" | "video"; link: string; alt: string | null; sortOrder: number; deletedAt: string | null; restoreDisabled?: boolean };

export function HighlightedPostsTable({ rows, meta, deleted }: { rows: PostRow[]; meta: TableMeta; deleted?: string }) {
  const columns: Column<PostRow>[] = [
    {
      id: "media",
      header: "Media",
      className: "w-24",
      cell: (r) => r.mediaType === "video" ? <span className="text-sm text-muted-foreground">Video</span> : <AdminTableImage src={r.image} alt={r.alt ?? ""} />,
    },
    { id: "alt", header: "Alt text", sortKey: "alt", cell: (r) => r.alt ?? "—" },
    { id: "link", header: "Link", cell: (r) => <a href={r.link} target="_blank" rel="noreferrer" className="block max-w-xs truncate text-primary hover:underline">{r.link}</a> },
    { id: "sortOrder", header: "Order", sortKey: "sortOrder", cell: (r) => r.sortOrder },
    { id: "deletedAt", header: "Record", cell: (r) => r.deletedAt ? <StatusBadge status="DELETED" label="Deleted" /> : <StatusBadge status="ACTIVE" label="Active" /> },
    {
      id: "actions",
      header: "",
      className: "text-right",
      cell: (r) => <RowActions
        editHref={`/admin/highlighted-posts/${r.id}`}
        deleteUrl={r.deletedAt ? undefined : `/api/admin/highlighted-posts/${r.id}`}
        restoreUrl={r.deletedAt ? `/api/admin/highlighted-posts/${r.id}` : undefined}
        restoreDisabled={r.restoreDisabled}
        restoreDisabledReason={r.restoreDisabled ? "Delete an active highlighted post before restoring another." : undefined}
        itemName="post"
      />,
    },
  ];
  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowId={(r) => r.id}
      {...meta}
      searchValue={meta.q}
      searchPlaceholder="Search posts…"
      filters={[{ param: "deleted", label: "Record", value: deleted, options: [{ value: "active", label: "Not deleted" }, { value: "deleted", label: "Deleted" }] }]}
      emptyTitle="No highlighted posts yet"
      emptyAction={
        <Button asChild size="sm">
          <Link href="/admin/highlighted-posts/new">
            <Plus /> Add post
          </Link>
        </Button>
      }
    />
  );
}
