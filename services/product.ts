import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { computePricing, type DiscountRule, type Pricing } from "@/lib/pricing";
import { paginated, type PageParams } from "@/lib/pagination";
import { slugify, uniqueSlug } from "@/lib/slug";
import { ApiError } from "@/lib/http";
import { invalidatePublicCache, PUBLIC_CACHE_TAGS } from "@/lib/public-cache";
import type { z } from "zod";
import type { productInputSchema, productUpdateSchema } from "@/lib/validation";

const include = {
  category: { select: { id: true, name: true, slug: true } },
  brand: { select: { id: true, name: true, slug: true } },
  productType: { select: { id: true, name: true, slug: true } },
  tags: { include: { tag: true } },
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof include }>;

type CachedProductRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  images: unknown;
  aboutPoints: unknown;
  aboutIntro: string | null;
  currency: string;
  stock: number;
  gender: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  isActive: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  categoryId: string;
  price: number;
  category: { id: string; name: string; slug: string };
  brand: { id: string; name: string; slug: string } | null;
  productType: { id: string; name: string; slug: string } | null;
  tags: { tag: { slug: string } }[];
};

export type ProductDTO = {
  id: string;
  slug: string;
  title: string;
  description: string;
  images: string[];
  aboutPoints: { title: string; description: string }[];
  aboutIntro: string;
  currency: string;
  stock: number;
  inStock: boolean;
  gender: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  isActive: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  category: { id: string; name: string; slug: string };
  brand: { id: string; name: string; slug: string } | null;
  productType: { id: string; name: string; slug: string } | null;
  tags: string[];
} & Pricing;

export async function getActiveRules(): Promise<DiscountRule[]> {
  await connection();
  const now = new Date();
  const rows = await prisma.discount.findMany({
    where: {
      isActive: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    value: Number(r.value),
    productId: r.productId,
    categoryId: r.categoryId,
  }));
}

function toCachedProduct(p: ProductRow): CachedProductRow {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    images: p.images,
    aboutPoints: p.aboutPoints,
    aboutIntro: p.aboutIntro,
    currency: p.currency,
    stock: p.stock,
    gender: p.gender,
    rating: Number(p.rating),
    reviewCount: p.reviewCount,
    soldCount: p.soldCount,
    isActive: p.isActive,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    createdAt: p.createdAt.toISOString(),
    categoryId: p.categoryId,
    price: Number(p.price),
    category: p.category,
    brand: p.brand,
    productType: p.productType,
    tags: p.tags.map(({ tag }) => ({ tag: { slug: tag.slug } })),
  };
}

export function toDTO(
  p: CachedProductRow,
  rules: DiscountRule[],
  stock = p.stock,
): ProductDTO {
  const aboutPoints = Array.isArray(p.aboutPoints)
    ? p.aboutPoints.flatMap((point) => {
        if (
          typeof point !== "object" ||
          point === null ||
          Array.isArray(point) ||
          !("title" in point) ||
          !("description" in point) ||
          typeof point.title !== "string" ||
          typeof point.description !== "string"
        ) {
          return [];
        }
        return [{ title: point.title, description: point.description }];
      })
    : [];
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    images: Array.isArray(p.images) ? (p.images as string[]) : [],
    aboutPoints,
    aboutIntro: p.aboutIntro ?? "",
    currency: p.currency,
    stock,
    inStock: stock > 0,
    gender: p.gender,
    rating: Number(p.rating),
    reviewCount: p.reviewCount,
    soldCount: p.soldCount,
    isActive: p.isActive,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    createdAt: p.createdAt,
    category: p.category,
    brand: p.brand,
    productType: p.productType,
    tags: p.tags.map((t) => t.tag.slug),
    ...computePricing({ id: p.id, categoryId: p.categoryId, price: p.price }, rules),
  };
}

export type ProductFilters = {
  q?: string;
  category?: string;
  type?: string;
  brand?: string;
  gender?: string;
  tag?: string;
  inStock?: boolean;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "best_selling" | "rating";
  includeInactive?: boolean;
  /** Admin-only: overrides `sort` with a column + direction. */
  adminSort?: { field: "title" | "price" | "stock" | "soldCount" | "createdAt" | "isActive"; dir: "asc" | "desc" };
  /** Admin-only: filter by visibility. */
  status?: "active" | "hidden";
};

const list = (v?: string) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);

export function parseFilters(sp: URLSearchParams | Record<string, string | string[] | undefined>): ProductFilters {
  const getAll = (k: string) => {
    const v = sp instanceof URLSearchParams ? sp.getAll(k) : sp[k];
    return Array.isArray(v) ? v : v === undefined ? [] : [v];
  };
  const get = (k: string) => {
    return getAll(k)[0];
  };
  const getList = (k: string) => getAll(k).flatMap((value) => list(value));
  const num = (k: string) => {
    const v = get(k);
    const n = v === undefined || v === "" ? NaN : Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  const ratings = getList("minRating")
    .map(Number)
    .filter((rating) => Number.isFinite(rating));
  const sort = get("sort");
  return {
    q: get("q")?.trim() || undefined,
    category: getList("category").filter((value) => value !== "all").join(",") || undefined,
    type: getList("type").join(",") || undefined,
    brand: getList("brand").join(",") || undefined,
    gender: get("gender") || undefined,
    tag: get("tag") || undefined,
    inStock: get("inStock") === "true" ? true : undefined,
    minRating: ratings.length ? Math.min(...ratings) : undefined,
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    sort: (["newest", "price_asc", "price_desc", "best_selling", "rating"] as const).find((s) => s === sort),
  };
}

function buildWhere(f: ProductFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};
  if (!f.includeInactive) where.isActive = true;
  else if (f.status) where.isActive = f.status === "active";
  if (f.q) where.title = { contains: f.q };
  const cats = list(f.category).filter((c) => c !== "all");
  if (cats.length) where.category = { slug: { in: cats } };
  const types = list(f.type);
  if (types.length) where.productType = { slug: { in: types } };
  const brands = list(f.brand);
  if (brands.length) where.brand = { slug: { in: brands } };
  if (f.gender && ["MALE", "FEMALE", "UNISEX"].includes(f.gender.toUpperCase())) {
    where.gender = f.gender.toUpperCase() as "MALE" | "FEMALE" | "UNISEX";
  }
  if (f.tag) where.tags = { some: { tag: { slug: f.tag } } };
  if (f.inStock) where.stock = { gt: 0 };
  if (f.minRating !== undefined) where.rating = { gte: f.minRating };
  if (f.minPrice !== undefined || f.maxPrice !== undefined) {
    where.price = {
      ...(f.minPrice !== undefined ? { gte: f.minPrice } : {}),
      ...(f.maxPrice !== undefined ? { lte: f.maxPrice } : {}),
    };
  }
  return where;
}

function buildOrder(f: ProductFilters): Prisma.ProductOrderByWithRelationInput[] {
  if (f.adminSort) return [{ [f.adminSort.field]: f.adminSort.dir }, { id: "asc" }];
  switch (f.sort) {
    case "price_asc":
      return [{ price: "asc" }, { id: "asc" }];
    case "price_desc":
      return [{ price: "desc" }, { id: "asc" }];
    case "best_selling":
      return [{ soldCount: "desc" }, { id: "asc" }];
    case "rating":
      return [{ rating: "desc" }, { reviewCount: "desc" }, { id: "asc" }];
    default:
      return [{ createdAt: "desc" }, { id: "asc" }];
  }
}

export async function listProducts(f: ProductFilters, page: PageParams) {
  if (!f.includeInactive && !f.adminSort && !f.status && !f.inStock) {
    const { rows, total } = await getCachedPublicProductPage(f, page);
    return paginated(await applyLivePricingAndStock(rows), total, page);
  }

  await connection();
  const where = buildWhere(f);
  const [rules, rows, total] = await Promise.all([
    getActiveRules(),
    prisma.product.findMany({
      where,
      include,
      orderBy: buildOrder(f),
      skip: page.skip,
      take: page.limit,
    }),
    prisma.product.count({ where }),
  ]);
  return paginated(rows.map((r) => toDTO(toCachedProduct(r), rules)), total, page);
}

async function getCachedPublicProductPage(
  filters: ProductFilters,
  page: PageParams,
) {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CACHE_TAGS.products, PUBLIC_CACHE_TAGS.taxonomy);
  const where = buildWhere(filters);
  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include,
      orderBy: buildOrder(filters),
      skip: page.skip,
      take: page.limit,
    }),
    prisma.product.count({ where }),
  ]);
  return { rows: rows.map(toCachedProduct), total };
}

async function applyLivePricingAndStock(rows: CachedProductRow[]) {
  if (!rows.length) return [];
  await connection();
  const [rules, stocks] = await Promise.all([
    getActiveRules(),
    prisma.product.findMany({
      where: { id: { in: rows.map(({ id }) => id) } },
      select: { id: true, stock: true },
    }),
  ]);
  const stockById = new Map(stocks.map(({ id, stock }) => [id, stock]));
  return rows
    .filter(({ id }) => stockById.has(id))
    .map((row) => toDTO(row, rules, stockById.get(row.id)));
}

/**
 * Curated lists: returns active products carrying the given tag (set in the admin).
 */
export async function listByTag(tag: string, limit = 6) {
  const take = Math.min(Math.max(limit, 1), 50);
  return applyLivePricingAndStock(await getCachedProductsByTag(tag, take));
}

async function getCachedProductsByTag(tag: string, take: number) {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CACHE_TAGS.products, PUBLIC_CACHE_TAGS.taxonomy);
  const rows = await prisma.product.findMany({
    where: {
      isActive: true,
      tags: { some: { tag: { slug: tag } } },
    },
    include,
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    take,
  });
  return rows.map(toCachedProduct);
}

export async function listRelatedProducts(
  categoryId: string,
  excludedProductId: string,
  limit = 4,
) {
  const take = Math.min(Math.max(limit, 1), 12);
  return applyLivePricingAndStock(
    await getCachedRelatedProducts(categoryId, excludedProductId, take),
  );
}

async function getCachedRelatedProducts(
  categoryId: string,
  excludedProductId: string,
  take: number,
) {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CACHE_TAGS.products, PUBLIC_CACHE_TAGS.taxonomy);
  const rows = await prisma.product.findMany({
    where: { isActive: true, categoryId, id: { not: excludedProductId } },
    include,
    orderBy: [{ soldCount: "desc" }, { createdAt: "desc" }, { id: "asc" }],
    take,
  });
  return rows.map(toCachedProduct);
}

export async function getProductBySlug(slug: string, opts: { includeInactive?: boolean } = {}) {
  if (opts.includeInactive) {
    await connection();
    const [row, rules] = await Promise.all([
      prisma.product.findUnique({ where: { slug }, include }),
      getActiveRules(),
    ]);
    return row ? toDTO(toCachedProduct(row), rules) : null;
  }
  const row = await getCachedPublicProductBySlug(slug);
  if (!row) return null;
  await connection();
  const [rules, current] = await Promise.all([
    getActiveRules(),
    prisma.product.findUnique({
      where: { id: row.id },
      select: { stock: true },
    }),
  ]);
  return current ? toDTO(row, rules, current.stock) : null;
}

async function getCachedPublicProductBySlug(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CACHE_TAGS.products, PUBLIC_CACHE_TAGS.taxonomy);
  const row = await prisma.product.findUnique({ where: { slug }, include });
  return row?.isActive ? toCachedProduct(row) : null;
}

export async function getProductSeoBySlug(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CACHE_TAGS.products);
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      slug: true,
      title: true,
      description: true,
      images: true,
      seoTitle: true,
      seoDescription: true,
      isActive: true,
    },
  });
  if (!product?.isActive) return null;
  return {
    ...product,
    image: Array.isArray(product.images)
      ? product.images.find((image): image is string => typeof image === "string")
      : undefined,
  };
}

export async function getProductById(id: string) {
  await connection();
  const [row, rules] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include }),
    getActiveRules(),
  ]);
  return row ? toDTO(toCachedProduct(row), rules) : null;
}

export async function getProductsByIds(ids: string[]) {
  if (!ids.length) return [];
  const rules = await getActiveRules();
  const rows = await prisma.product.findMany({ where: { id: { in: ids } }, include });
  return rows.map((r) => toDTO(toCachedProduct(r), rules));
}

export async function listAllSlugs() {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CACHE_TAGS.products);
  return prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });
}

async function syncTags(productId: string, tags: string[]) {
  const slugs = [...new Set(tags.map(slugify).filter(Boolean))];
  const tagRows = await Promise.all(
    slugs.map((slug) =>
      prisma.tag.upsert({
        where: { slug },
        update: {},
        create: { slug, name: tags.find((t) => slugify(t) === slug) ?? slug },
      }),
    ),
  );
  await prisma.$transaction([
    prisma.productTag.deleteMany({ where: { productId } }),
    prisma.productTag.createMany({ data: tagRows.map((t) => ({ productId, tagId: t.id })) }),
  ]);
}

export async function createProduct(input: z.infer<typeof productInputSchema>) {
  const slug = await uniqueSlug(input.slug || input.title, async (s) =>
    Boolean(await prisma.product.findUnique({ where: { slug: s }, select: { id: true } })),
  );
  const { tags, ...rest } = input;
  const row = await prisma.product.create({
    data: { ...rest, slug, brandId: rest.brandId || null, productTypeId: rest.productTypeId || null },
  });
  await syncTags(row.id, tags);
  const product = await getProductById(row.id);
  invalidatePublicCache(PUBLIC_CACHE_TAGS.products, PUBLIC_CACHE_TAGS.taxonomy);
  return product;
}

export async function updateProduct(id: string, input: z.infer<typeof productUpdateSchema>) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Product not found");
  const { tags, slug, ...rest } = input;
  let nextSlug: string | undefined;
  if (slug && slug !== existing.slug) {
    nextSlug = await uniqueSlug(slug, async (s) =>
      s !== existing.slug && Boolean(await prisma.product.findUnique({ where: { slug: s }, select: { id: true } })),
    );
  }
  await prisma.product.update({
    where: { id },
    data: {
      ...rest,
      ...(nextSlug ? { slug: nextSlug } : {}),
      ...("brandId" in rest ? { brandId: rest.brandId || null } : {}),
      ...("productTypeId" in rest ? { productTypeId: rest.productTypeId || null } : {}),
    },
  });
  if (tags) await syncTags(id, tags);
  const product = await getProductById(id);
  invalidatePublicCache(PUBLIC_CACHE_TAGS.products, PUBLIC_CACHE_TAGS.taxonomy);
  return product;
}

export async function deleteProduct(id: string) {
  const used = await prisma.orderItem.count({ where: { productId: id } });
  if (used) {
    // Preserve order history: deactivate instead of deleting.
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    invalidatePublicCache(PUBLIC_CACHE_TAGS.products, PUBLIC_CACHE_TAGS.taxonomy);
    return { deleted: false, deactivated: true };
  }
  await prisma.product.delete({ where: { id } });
  invalidatePublicCache(PUBLIC_CACHE_TAGS.products, PUBLIC_CACHE_TAGS.taxonomy);
  return { deleted: true, deactivated: false };
}
