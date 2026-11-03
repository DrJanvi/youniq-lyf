import { AddButton } from "@/components/admin/common/AddButton";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { ReviewsTable } from "@/components/admin/tables/ReviewsTable";
import { type SearchParams, parseListParams } from "@/lib/admin/list-params";
import { requireAdminPage } from "@/lib/auth/session";
import { listReviewsAdmin } from "@/services/review";
import type { ReviewStatus } from "@prisma/client";

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminPage();
  const p = parseListParams(await searchParams, {
    sortable: ["createdAt", "rating", "status", "product"],
    defaultSort: "createdAt",
    filters: { status: ["PENDING", "APPROVED", "HIDDEN"], rating: ["1", "2", "3", "4", "5"] },
  });
  const result = await listReviewsAdmin(p.page, p.filters.status as ReviewStatus | undefined, undefined, p);
  return (
    <>
      <PageHeader title="Reviews" description="Moderate customer reviews or add your own." actions={<AddButton href="/admin/reviews/new" label="Add review" />} />
      <ReviewsTable
        meta={{ total: result.pagination.total, page: result.pagination.page, totalPages: result.pagination.totalPages, sort: p.sort, dir: p.dir, q: p.q }}
        filters={[
          { param: "status", label: "Status", value: p.filters.status, options: [{ value: "PENDING", label: "Pending" }, { value: "APPROVED", label: "Approved" }, { value: "HIDDEN", label: "Hidden" }] },
          { param: "rating", label: "Rating", value: p.filters.rating, options: [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} stars` })) },
        ]}
        rows={result.data.map((r) => ({ id: r.id, product: r.product.title, rating: r.rating, title: r.title, body: r.body, authorName: r.authorName, status: r.status, createdAt: r.createdAt }))}
      />
    </>
  );
}
