"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { AdminTableImage } from "@/components/admin/common/AdminTableImage";
import { DataTable, type Column } from "@/components/admin/common/DataTable";
import { RowActions } from "@/components/admin/common/RowActions";
import type { TableMeta } from "./types";

export type BlogArticleRow = {
  id: string;
  title: string;
  category: string;
  publishedAt: Date;
  readTime: number;
  image: string;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function BlogArticlesTable({
  rows,
  meta,
  category,
}: {
  rows: BlogArticleRow[];
  meta: TableMeta;
  category?: string;
}) {
  const columns: Column<BlogArticleRow>[] = [
    {
      id: "image",
      header: "Image",
      className: "w-24",
      cell: (article) => (
        <AdminTableImage src={article.image} alt="" />
      ),
    },
    {
      id: "title",
      header: "Title",
      sortKey: "title",
      cell: (article) => <span className="block max-w-sm truncate">{article.title}</span>,
    },
    {
      id: "category",
      header: "Category",
      sortKey: "category",
      cell: (article) => article.category,
    },
    {
      id: "publishedAt",
      header: "Date",
      sortKey: "publishedAt",
      cell: (article) => formatDate(article.publishedAt),
    },
    {
      id: "readTime",
      header: "Read time",
      cell: (article) => `${article.readTime} min`,
    },
    {
      id: "actions",
      header: "",
      className: "text-right",
      cell: (article) => (
        <RowActions
          editHref={`/admin/blogs/${article.id}`}
          deleteUrl={`/api/admin/blogs/${article.id}`}
          itemName="article"
        />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowId={(article) => article.id}
      {...meta}
      searchValue={meta.q}
      searchPlaceholder="Search articles…"
      filters={[
        {
          param: "category",
          label: "Category",
          value: category,
          options: [
            { value: "Perfume & Fragrance", label: "Perfume & Fragrance" },
            { value: "Beauty & Skincare", label: "Beauty & Skincare" },
            { value: "Lifestyle", label: "Lifestyle" },
            { value: "Tips & Guides", label: "Tips & Guides" },
            { value: "Brand Stories", label: "Brand Stories" },
          ],
        },
      ]}
      emptyTitle="No articles yet"
      emptyAction={
        <Button asChild size="sm">
          <Link href="/admin/blogs/new">
            <Plus /> Add article
          </Link>
        </Button>
      }
    />
  );
}
