import "server-only";
import { prisma } from "@/lib/prisma";
import { paginated, type PageParams } from "@/lib/pagination";
import { ApiError } from "@/lib/http";
import type { Prisma, ReviewStatus } from "@prisma/client";
import type { ListParams } from "@/lib/admin/list-params";
import { cacheLife, cacheTag } from "next/cache";
import { invalidatePublicCache, PUBLIC_CACHE_TAGS } from "@/lib/public-cache";

export type ReviewDTO = {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  title: string | null;
  body: string;
  status: ReviewStatus;
  createdAt: string;
};

export type LatestReviewDTO = ReviewDTO & {
  product: {
    name: string;
    slug: string;
    image: string | null;
    price: number;
    currency: string;
  };
};

const toDTO = (r: {
  id: string; productId: string; authorName: string; rating: number;
  title: string | null; body: string; status: ReviewStatus; createdAt: Date;
}): ReviewDTO => ({ ...r, createdAt: r.createdAt.toISOString() });

export async function recalcRating(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId, status: "APPROVED" },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: productId },
    data: { rating: Math.round((agg._avg.rating ?? 0) * 100) / 100, reviewCount: agg._count },
  });
}

export async function listApprovedReviews(productId: string, page: PageParams) {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CACHE_TAGS.reviews);
  const where = { productId, status: "APPROVED" as const };
  const [rows, total] = await Promise.all([
    prisma.review.findMany({ where, orderBy: { createdAt: "desc" }, skip: page.skip, take: page.limit }),
    prisma.review.count({ where }),
  ]);
  return paginated(rows.map(toDTO), total, page);
}

export async function getReviewDistribution(productId: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CACHE_TAGS.reviews);
  const rows = await prisma.review.groupBy({
    by: ["rating"],
    where: { productId, status: "APPROVED" },
    _count: true,
  });
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const row of rows) counts[row.rating] = row._count;
  return counts;
}

export async function listLatestReviews(): Promise<LatestReviewDTO[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CACHE_TAGS.reviews, PUBLIC_CACHE_TAGS.products);
  const reviews = await prisma.review.findMany({
    where: { status: "APPROVED" },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 10,
    include: {
      product: { select: { title: true, slug: true, images: true, price: true, currency: true } },
    },
  });

  return reviews.map((review) => {
    const images = Array.isArray(review.product.images) ? review.product.images : [];
    return {
      ...toDTO(review),
      product: {
        name: review.product.title,
        slug: review.product.slug,
        image: images.find((image): image is string => typeof image === "string") ?? null,
        price: Number(review.product.price),
        currency: review.product.currency,
      },
    };
  });
}

export async function listReviewsAdmin(page: PageParams, status?: ReviewStatus, productId?: string, p?: ListParams) {
  const rating = Number(p?.filters.rating);
  const where: Prisma.ReviewWhereInput = {
    ...(status ? { status } : {}),
    ...(productId ? { productId } : {}),
    ...(rating ? { rating } : {}),
    ...(p?.q ? { OR: [{ authorName: { contains: p.q } }, { body: { contains: p.q } }, { product: { title: { contains: p.q } } }] } : {}),
  };
  const orderBy: Prisma.ReviewOrderByWithRelationInput =
    p?.sort === "product" ? { product: { title: p.dir } } : { [p?.sort ?? "createdAt"]: p?.dir ?? "desc" };
  const [rows, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: [orderBy, { id: "asc" }],
      skip: page.skip,
      take: page.limit,
      include: { product: { select: { title: true, slug: true } } },
    }),
    prisma.review.count({ where }),
  ]);
  return paginated(rows.map((r) => ({ ...toDTO(r), product: r.product })), total, page);
}

export async function getReview(id: string) {
  const row = await prisma.review.findUnique({ where: { id } });
  return row ? toDTO(row) : null;
}

export async function updateReview(
  id: string,
  input: { productId: string; authorName: string; authorEmail?: string; rating: number; title?: string; body: string; status: ReviewStatus; createdAt?: Date },
) {
  const before = await prisma.review.findUnique({ where: { id }, select: { productId: true } });
  if (!before) throw new ApiError(404, "Review not found");
  const row = await prisma.review.update({ where: { id }, data: { ...input, title: input.title ?? null } });
  await recalcRating(row.productId);
  if (before.productId !== row.productId) await recalcRating(before.productId);
  invalidatePublicCache(PUBLIC_CACHE_TAGS.reviews, PUBLIC_CACHE_TAGS.products);
  return toDTO(row);
}

export async function createReview(
  input: { productId: string; authorName: string; authorEmail?: string; rating: number; title?: string; body: string; status?: ReviewStatus; createdAt?: Date },
  userId?: string,
) {
  const product = await prisma.product.findUnique({ where: { id: input.productId }, select: { id: true } });
  if (!product) throw new ApiError(404, "Product not found");
  const row = await prisma.review.create({
    data: { ...input, userId: userId ?? null, status: input.status ?? "PENDING" },
  });
  if (row.status === "APPROVED") await recalcRating(row.productId);
  if (row.status === "APPROVED") {
    invalidatePublicCache(PUBLIC_CACHE_TAGS.reviews, PUBLIC_CACHE_TAGS.products);
  }
  return toDTO(row);
}

export async function setReviewStatus(id: string, status: ReviewStatus) {
  const row = await prisma.review.update({ where: { id }, data: { status } }).catch(() => null);
  if (!row) throw new ApiError(404, "Review not found");
  await recalcRating(row.productId);
  invalidatePublicCache(PUBLIC_CACHE_TAGS.reviews, PUBLIC_CACHE_TAGS.products);
  return toDTO(row);
}

export async function deleteReview(id: string) {
  const row = await prisma.review.delete({ where: { id } }).catch(() => null);
  if (!row) throw new ApiError(404, "Review not found");
  await recalcRating(row.productId);
  invalidatePublicCache(PUBLIC_CACHE_TAGS.reviews, PUBLIC_CACHE_TAGS.products);
}
