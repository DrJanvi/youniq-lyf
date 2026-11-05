"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { AdminTableImage } from "@/components/admin/common/AdminTableImage";
import { DataTable, type Column } from "@/components/admin/common/DataTable";
import { RowActions } from "@/components/admin/common/RowActions";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import type { TableMeta } from "./types";

export type HeroBannerRow = {
  id: string;
  desktopImage: string;
  mobileImage: string | null;
  link: string;
  alt: string | null;
  sortOrder: number;
  deletedAt: string | null;
};

export function HeroBannersTable({ rows, meta, deleted }: { rows: HeroBannerRow[]; meta: TableMeta; deleted?: string }) {
  const columns: Column<HeroBannerRow>[] = [
    {
      id: "desktopImage",
      header: "Desktop",
      className: "w-28",
      cell: (r) => <AdminTableImage src={r.desktopImage} alt={r.alt ?? ""} />,
    },
    {
      id: "mobileImage",
      header: "Mobile",
      className: "w-24",
      cell: (r) =>
        r.mobileImage ? (
          <AdminTableImage src={r.mobileImage} alt={r.alt ?? ""} />
        ) : (
          <span className="text-muted-foreground">Uses desktop</span>
        ),
    },
    { id: "alt", header: "Alt text", sortKey: "alt", cell: (r) => r.alt ?? "—" },
    { id: "link", header: "Link", cell: (r) => <a href={r.link} target="_blank" rel="noreferrer" className="block max-w-xs truncate text-primary hover:underline">{r.link}</a> },
    { id: "sortOrder", header: "Order", sortKey: "sortOrder", cell: (r) => r.sortOrder },
    { id: "deletedAt", header: "Record", cell: (r) => r.deletedAt ? <StatusBadge status="DELETED" label="Deleted" /> : <StatusBadge status="ACTIVE" label="Active" /> },
    {
      id: "actions",
      header: "",
      className: "text-right",
      cell: (r) => <RowActions editHref={`/admin/hero-banners/${r.id}`} deleteUrl={r.deletedAt ? undefined : `/api/admin/hero-banners/${r.id}`} restoreUrl={r.deletedAt ? `/api/admin/hero-banners/${r.id}` : undefined} itemName="banner" />,
    },
  ];
  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowId={(r) => r.id}
      {...meta}
      searchValue={meta.q}
      searchPlaceholder="Search banners…"
      filters={[{ param: "deleted", label: "Record", value: deleted, options: [{ value: "active", label: "Not deleted" }, { value: "deleted", label: "Deleted" }] }]}
      emptyTitle="No hero banners yet"
      emptyAction={
        <Button asChild size="sm">
          <Link href="/admin/hero-banners/new">
            <Plus /> Add banner
          </Link>
        </Button>
      }
    />
  );
}
