"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { AdminTableImage } from "@/components/admin/common/AdminTableImage";
import { DataTable, type Column } from "@/components/admin/common/DataTable";
import { RowActions } from "@/components/admin/common/RowActions";
import type { TableMeta } from "./types";

export type PostRow = { id: string; image: string; link: string; alt: string | null; sortOrder: number };

export function HighlightedPostsTable({ rows, meta }: { rows: PostRow[]; meta: TableMeta }) {
  const columns: Column<PostRow>[] = [
    {
      id: "image",
      header: "Image",
      className: "w-24",
      cell: (r) => <AdminTableImage src={r.image} alt={r.alt ?? ""} />,
    },
    { id: "alt", header: "Alt text", sortKey: "alt", cell: (r) => r.alt ?? "—" },
    { id: "link", header: "Link", cell: (r) => <a href={r.link} target="_blank" rel="noreferrer" className="block max-w-xs truncate text-primary hover:underline">{r.link}</a> },
    { id: "sortOrder", header: "Order", sortKey: "sortOrder", cell: (r) => r.sortOrder },
    {
      id: "actions",
      header: "",
      className: "text-right",
      cell: (r) => <RowActions editHref={`/admin/highlighted-posts/${r.id}`} deleteUrl={`/api/admin/highlighted-posts/${r.id}`} itemName="post" />,
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
