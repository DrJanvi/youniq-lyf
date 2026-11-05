"use client";

import Link from "next/link";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { AdminTableImage } from "@/components/admin/common/AdminTableImage";
import { DataTable, type Column, type TableFilter } from "@/components/admin/common/DataTable";
import { RowActions } from "@/components/admin/common/RowActions";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import type { TableMeta } from "./types";

export type ProductRow = {
  id: string; title: string; image: string | null; category: string; price: string; discounted: boolean;
  stock: number; soldCount: number; isActive: boolean; deletedAt: string | null; deletedByTaxonomy: boolean;
};

export function ProductsTable({ rows, meta, filters }: { rows: ProductRow[]; meta: TableMeta; filters: TableFilter[] }) {
  const columns: Column<ProductRow>[] = [
    {
      id: "title",
      header: "Product",
      sortKey: "title",
      cell: (p) => p.deletedAt ? (
          <span className="flex min-w-0 items-center gap-3 font-medium">
            {p.image ? <AdminTableImage src={p.image} alt="" /> : <span className="grid size-14 shrink-0 place-items-center rounded-md border border-border bg-muted/40 text-muted-foreground"><Package className="size-5" /></span>}
            <span className="line-clamp-2 min-w-0 max-w-xs">{p.title}</span>
          </span>
        ) : (
          <Link href={`/admin/products/${p.id}`} className="flex min-w-0 items-center gap-3 font-medium hover:underline">
          {p.image ? (
            <AdminTableImage src={p.image} alt="" />
          ) : (
            <span className="grid size-14 shrink-0 place-items-center rounded-md border border-border bg-muted/40 text-muted-foreground">
              <Package className="size-5" />
            </span>
          )}
          <span className="line-clamp-2 min-w-0 max-w-xs">{p.title}</span>
          </Link>
        ),
    },
    { id: "category", header: "Category", cell: (p) => p.category },
    { id: "price", header: "Price", sortKey: "price", cell: (p) => <span className={p.discounted ? "text-success" : undefined}>{p.price}</span> },
    { id: "stock", header: "Stock", sortKey: "stock", cell: (p) => (p.stock === 0 ? <span className="text-destructive">Out of stock</span> : p.stock) },
    { id: "soldCount", header: "Sold", sortKey: "soldCount", cell: (p) => p.soldCount },
    { id: "isActive", header: "Status", sortKey: "isActive", cell: (p) => <StatusBadge status={p.deletedAt ? "DELETED" : p.isActive ? "ACTIVE" : "HIDDEN"} label={p.deletedAt ? (p.deletedByTaxonomy ? "Deleted (taxonomy)" : "Deleted") : p.isActive ? "Active" : "Hidden"} /> },
    {
      id: "actions",
      header: "",
      className: "text-right",
      cell: (p) => (
        <RowActions
          editHref={`/admin/products/${p.id}`}
          deleteUrl={p.deletedAt ? undefined : `/api/admin/products/${p.id}`}
          restoreUrl={p.deletedAt ? `/api/admin/products/${p.id}` : undefined}
          restoreDisabled={p.deletedByTaxonomy}
          restoreDisabledReason="Restore the deleted taxonomy item to restore this product."
          itemName={p.title}
          deleteDescription="The product will be removed from the storefront and can be restored from this page."
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
      searchPlaceholder="Search products…"
      filters={filters}
      emptyTitle="No products yet"
      emptyAction={
        <Button asChild size="sm">
          <Link href="/admin/products/new">
            <Plus /> Add product
          </Link>
        </Button>
      }
    />
  );
}
