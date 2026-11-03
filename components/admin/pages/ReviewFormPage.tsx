import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { ReviewForm } from "@/components/admin/forms/ReviewForm";
import { requireAdminPage } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getReview } from "@/services/review";

export async function ReviewFormPage({ id }: { id?: string }) {
  await requireAdminPage();
  const [review, products] = await Promise.all([
    id ? getReview(id) : null,
    prisma.product.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" }, take: 500 }),
  ]);
  if (id && !review) notFound();
  return (
    <>
      <PageHeader title={review ? "Edit review" : "New review"} backHref="/admin/reviews" />
      <ReviewForm
        id={id}
        products={products.map((p) => ({ value: p.id, label: p.title }))}
        initial={review ? { productId: review.productId, authorName: review.authorName, rating: review.rating, body: review.body, status: review.status } : undefined}
      />
    </>
  );
}
