import { ApiError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { slugify, uniqueSlug } from "@/lib/slug";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import "server-only";
import { paginated } from "@/lib/pagination";
import type { ListParams } from "@/lib/admin/list-params";
import { invalidatePublicCache, PUBLIC_CACHE_TAGS } from "@/lib/public-cache";

type Kind = "category" | "brand" | "productType";

// Small facade so categories, brands and product types share CRUD logic.
function model(kind: Kind) {
  return (kind === "category"
    ? prisma.category
    : kind === "brand"
      ? prisma.brand
      : prisma.productType) as unknown as {
    findMany: (
      a: object,
    ) => Promise<{ id: string; name: string; slug: string; image?: string }[]>;
    findUnique: (
      a: object,
    ) => Promise<{ id: string; name: string; slug: string; image?: string } | null>;
    create: (a: object) => Promise<{ id: string }>;
    update: (a: object) => Promise<{ id: string }>;
    delete: (a: object) => Promise<unknown>;
  };
}

export async function listTaxonomy(kind: Kind) {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CACHE_TAGS.taxonomy, PUBLIC_CACHE_TAGS.products);
  const m = model(kind);
  const rows = await m.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: { where: { isActive: true } } } },
    },
  });
  return rows as unknown as {
    id: string;
    name: string;
    slug: string;
    image?: string;
    _count: { products: number };
  }[];
}

/** Admin table: search, sort (name | products | createdAt) and pagination. */
export async function listTaxonomyAdmin(kind: Kind, p: ListParams) {
  await connection();
  const m = model(kind) as unknown as {
    findMany: (a: object) => Promise<Record<string, unknown>[]>;
    count: (a: object) => Promise<number>;
  };
  const where = p.q ? { name: { contains: p.q } } : {};
  const orderBy = p.sort === "products" ? { products: { _count: p.dir } } : { [p.sort]: p.dir };
  const [rows, total] = await Promise.all([
    m.findMany({
      where,
      orderBy: [orderBy, { id: "asc" }],
      skip: p.page.skip,
      take: p.page.limit,
      include: { _count: { select: { products: true } } },
    }),
    (model(kind) as unknown as { count: (a: object) => Promise<number> }).count({ where }),
  ]);
  return paginated(
    rows as unknown as {
      id: string; name: string; slug: string; image?: string; description?: string | null;
      seoTitle?: string | null; seoDescription?: string | null; createdAt: Date; _count: { products: number };
    }[],
    total,
    p.page,
  );
}

export async function getTaxonomyById(kind: Kind, id: string) {
  await connection();
  return (model(kind) as unknown as { findUnique: (a: object) => Promise<Record<string, string | null> | null> }).findUnique({ where: { id } });
}

/** Categories with the most active products first. */
export async function listTopCategories(limit = 6) {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CACHE_TAGS.taxonomy, PUBLIC_CACHE_TAGS.products);
  return prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      _count: { select: { products: { where: { isActive: true } } } },
    },
    orderBy: [{ products: { _count: "desc" } }, { name: "asc" }],
    take: limit,
  });
}

export async function getTaxonomyBySlug(kind: Kind, slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CACHE_TAGS.taxonomy);
  return model(kind).findUnique({ where: { slug } }) as Promise<
    | (Record<string, string | null> & {
        id: string;
        name: string;
        slug: string;
      })
    | null
  >;
}

export async function createTaxonomy(
  kind: Kind,
  input: { name: string; slug?: string } & Record<string, unknown>,
) {
  const m = model(kind);
  const slug = await uniqueSlug(input.slug || input.name, async (s) =>
    Boolean(await m.findUnique({ where: { slug: s } })),
  );
  const row = await m.create({ data: { ...input, slug } });
  invalidatePublicCache(PUBLIC_CACHE_TAGS.taxonomy, PUBLIC_CACHE_TAGS.products);
  return row;
}

export async function updateTaxonomy(
  kind: Kind,
  id: string,
  input: { name?: string; slug?: string } & Record<string, unknown>,
) {
  const m = model(kind);
  const existing = await m.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Not found");
  const data: Record<string, unknown> = { ...input };
  if (input.slug && input.slug !== existing.slug) {
    data.slug = await uniqueSlug(
      input.slug,
      async (s) =>
        s !== existing.slug &&
        Boolean(await m.findUnique({ where: { slug: s } })),
    );
  } else delete data.slug;
  const row = await m.update({ where: { id }, data });
  invalidatePublicCache(PUBLIC_CACHE_TAGS.taxonomy, PUBLIC_CACHE_TAGS.products);
  return row;
}

export async function deleteTaxonomy(kind: Kind, id: string) {
  const count = await (kind === "category"
    ? prisma.product.count({ where: { categoryId: id } })
    : kind === "brand"
      ? prisma.product.count({ where: { brandId: id } })
      : prisma.product.count({ where: { productTypeId: id } }));
  if (count)
    throw new ApiError(
      409,
      `In use by ${count} product(s); reassign them first`,
    );
  await model(kind).delete({ where: { id } });
  invalidatePublicCache(PUBLIC_CACHE_TAGS.taxonomy, PUBLIC_CACHE_TAGS.products);
}

export { slugify };
