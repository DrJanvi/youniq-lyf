"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { AdminTableImage } from "@/components/admin/common/AdminTableImage";
import { DataTable, type Column } from "@/components/admin/common/DataTable";
import { RowActions } from "@/components/admin/common/RowActions";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import type { TableMeta } from "./types";

export type TaxonomyRow = { id: string; name: string; slug: string; image?: string; products: number; createdAt: string; deletedAt: string | null };

export function TaxonomyTable({
  rows, meta, basePath, endpoint, singular, withImage, deleted,
}: {
  rows: TaxonomyRow[];
  meta: TableMeta;
  basePath: string;
  endpoint: string;
  singular: string;
  withImage?: boolean;
  deleted?: string;
}) {
  const columns: Column<TaxonomyRow>[] = [
    ...(withImage
      ? [{
          id: "image",
          header: "Image",
          className: "w-24",
          cell: (r: TaxonomyRow) =>
            r.image ? <AdminTableImage src={r.image} alt="" /> : null,
        }]
      : []),
    { id: "name", header: "Name", sortKey: "name", cell: (r) => r.deletedAt ? <span className="font-medium">{r.name}</span> : <Link href={`${basePath}/${r.id}`} className="font-medium hover:underline">{r.name}</Link> },
    { id: "slug", header: "Slug", cell: (r) => <span className="text-muted-foreground">{r.slug}</span> },
    { id: "products", header: "Products", sortKey: "products", cell: (r) => r.products },
    { id: "createdAt", header: "Created", sortKey: "createdAt", cell: (r) => r.createdAt.slice(0, 10) },
    { id: "deletedAt", header: "Record", cell: (r) => r.deletedAt ? <StatusBadge status="DELETED" label="Deleted" /> : <StatusBadge status="ACTIVE" label="Active" /> },
    {
      id: "actions",
      header: "",
      className: "text-right",
      cell: (r) => (
        <RowActions
          editHref={`${basePath}/${r.id}`}
          deleteUrl={r.deletedAt ? undefined : `${endpoint}/${r.id}`}
          restoreUrl={r.deletedAt ? `${endpoint}/${r.id}` : undefined}
          itemName={r.name}
          deleteDescription={r.products ? `This will also delete the ${r.products} linked product(s). Restoring this ${singular.toLowerCase()} restores products deleted by this action.` : undefined}
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
      searchPlaceholder={`Search ${singular.toLowerCase()}s…`}
      filters={[{ param: "deleted", label: "Record", value: deleted, options: [{ value: "active", label: "Not deleted" }, { value: "deleted", label: "Deleted" }] }]}
      emptyTitle={`No ${singular.toLowerCase()}s yet`}
      emptyAction={
        <Button asChild size="sm">
          <Link href={`${basePath}/new`}>
            <Plus /> Add {singular.toLowerCase()}
          </Link>
        </Button>
      }
    />
  );
}
