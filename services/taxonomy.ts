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
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: { where: { isActive: true, deletedAt: null } } } },
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
  const where = {
    ...(p.q ? { name: { contains: p.q } } : {}),
    ...(p.filters.deleted === "deleted"
      ? { deletedAt: { not: null } }
      : p.filters.deleted === "active"
        ? { deletedAt: null }
        : {}),
  };
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
      seoTitle?: string | null; seoDescription?: string | null; createdAt: Date; deletedAt: Date | null; _count: { products: number };
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
      _count: { select: { products: { where: { isActive: true, deletedAt: null } } } },
    },
    where: { deletedAt: null },
    orderBy: [{ products: { _count: "desc" } }, { name: "asc" }],
    take: limit,
  });
}

export async function getTaxonomyBySlug(kind: Kind, slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CACHE_TAGS.taxonomy);
  return model(kind).findUnique({ where: { slug, deletedAt: null } }) as Promise<
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
  invalidatePublicCache(
    PUBLIC_CACHE_TAGS.taxonomy,
    PUBLIC_CACHE_TAGS.products,
    PUBLIC_CACHE_TAGS.reviews,
  );
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
  invalidatePublicCache(
    PUBLIC_CACHE_TAGS.taxonomy,
    PUBLIC_CACHE_TAGS.products,
    PUBLIC_CACHE_TAGS.reviews,
  );
  return row;
}

export async function deleteTaxonomy(kind: Kind, id: string) {
  const now = new Date();
  await prisma.$transaction(async (tx) => {
    const result =
      kind === "category"
        ? await tx.category.updateMany({ where: { id, deletedAt: null }, data: { deletedAt: now } })
        : kind === "brand"
          ? await tx.brand.updateMany({ where: { id, deletedAt: null }, data: { deletedAt: now } })
          : await tx.productType.updateMany({ where: { id, deletedAt: null }, data: { deletedAt: now } });
    if (!result.count) throw new ApiError(404, "Not found");

    const productWhere =
      kind === "category"
        ? { categoryId: id, deletedAt: null }
        : kind === "brand"
          ? { brandId: id, deletedAt: null }
          : { productTypeId: id, deletedAt: null };
    const products = await tx.product.findMany({
      where: productWhere,
      select: { id: true },
    });
    const productIds = products.map(({ id: productId }) => productId);
    if (productIds.length) {
      await tx.product.updateMany({
        where: { id: { in: productIds }, deletedAt: null },
        data: { deletedAt: now, deletedByTaxonomy: true },
      });
      await tx.cartItem.deleteMany({ where: { productId: { in: productIds } } });
      await tx.wishlistItem.deleteMany({ where: { productId: { in: productIds } } });
    }
  });
  invalidatePublicCache(
    PUBLIC_CACHE_TAGS.taxonomy,
    PUBLIC_CACHE_TAGS.products,
    PUBLIC_CACHE_TAGS.reviews,
  );
}

export async function restoreTaxonomy(kind: Kind, id: string) {
  await prisma.$transaction(async (tx) => {
    const result =
      kind === "category"
        ? await tx.category.updateMany({ where: { id, deletedAt: { not: null } }, data: { deletedAt: null } })
        : kind === "brand"
          ? await tx.brand.updateMany({ where: { id, deletedAt: { not: null } }, data: { deletedAt: null } })
          : await tx.productType.updateMany({ where: { id, deletedAt: { not: null } }, data: { deletedAt: null } });
    if (!result.count) throw new ApiError(404, "Deleted taxonomy item not found");

    const cascadeDeletedProducts = await tx.product.findMany({
      where: { deletedAt: { not: null }, deletedByTaxonomy: true },
      select: {
        id: true,
        category: { select: { deletedAt: true } },
        brand: { select: { deletedAt: true } },
        productType: { select: { deletedAt: true } },
      },
    });
    const restorableIds = cascadeDeletedProducts
      .filter(({ category, brand, productType }) =>
        !category.deletedAt && !brand?.deletedAt && !productType?.deletedAt,
      )
      .map(({ id: productId }) => productId);
    if (restorableIds.length) {
      await tx.product.updateMany({
        where: { id: { in: restorableIds }, deletedAt: { not: null }, deletedByTaxonomy: true },
        data: { deletedAt: null, deletedByTaxonomy: false },
      });
    }
  });
  invalidatePublicCache(
    PUBLIC_CACHE_TAGS.taxonomy,
    PUBLIC_CACHE_TAGS.products,
    PUBLIC_CACHE_TAGS.reviews,
  );
  return { restored: true };
}

export { slugify };
