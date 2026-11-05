import "server-only";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/http";
import { paginated, type PageParams } from "@/lib/pagination";
import { getProductsByIds, STOREFRONT_PRODUCT_WHERE } from "./product";

export type WishlistEntryDTO = {
  product: Awaited<ReturnType<typeof getProductsByIds>>[number];
  createdAt: string;
};

export async function getWishlistCount(userId: string): Promise<number> {
  return prisma.wishlistItem.count({
    where: { userId, product: { is: STOREFRONT_PRODUCT_WHERE } },
  });
}

export async function listWishlist(userId: string, page: PageParams) {
  const where = { userId, product: { is: STOREFRONT_PRODUCT_WHERE } };
  const [rows, total] = await Promise.all([
    prisma.wishlistItem.findMany({ where, orderBy: { createdAt: "desc" }, skip: page.skip, take: page.limit }),
    prisma.wishlistItem.count({ where }),
  ]);
  const products = await getProductsByIds(rows.map((r) => r.productId));
  const byId = new Map(products.map((p) => [p.id, p]));
  return paginated(rows.flatMap((r) => byId.get(r.productId) ?? []), total, page);
}

export async function listWishlistEntries(
  userId: string,
  page: PageParams,
  query = "",
  sort: "newest" | "oldest" | "price-asc" | "price-desc" = "newest",
) {
  const [rows, wishlistCount] = await Promise.all([
    prisma.wishlistItem.findMany({
      where: { userId, product: { is: STOREFRONT_PRODUCT_WHERE } },
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      select: { productId: true, createdAt: true },
    }),
    prisma.wishlistItem.count({ where: { userId, product: { is: STOREFRONT_PRODUCT_WHERE } } }),
  ]);
  const products = await getProductsByIds(rows.map((row) => row.productId));
  const productsById = new Map(products.map((product) => [product.id, product]));
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const entries: WishlistEntryDTO[] = rows.flatMap((row) => {
    const product = productsById.get(row.productId);
    if (!product) return [];
    const searchableText = [
      product.title,
      product.category.name,
      product.brand?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();
    if (normalizedQuery && !searchableText.includes(normalizedQuery)) return [];
    return [{ product, createdAt: row.createdAt.toISOString() }];
  });

  if (sort === "oldest") {
    entries.reverse();
  } else if (sort === "price-asc") {
    entries.sort((a, b) => a.product.finalPrice - b.product.finalPrice);
  } else if (sort === "price-desc") {
    entries.sort((a, b) => b.product.finalPrice - a.product.finalPrice);
  }

  const totalPages = Math.max(1, Math.ceil(entries.length / page.limit));
  const currentPage = Math.min(page.page, totalPages);
  const currentPageParams = {
    ...page,
    page: currentPage,
    skip: (currentPage - 1) * page.limit,
  };
  return {
    ...paginated(
      entries.slice(currentPageParams.skip, currentPageParams.skip + page.limit),
      entries.length,
      currentPageParams,
    ),
    activeWishlistCount: rows.length,
    wishlistCount,
  };
}

export async function wishlistIds(userId: string) {
  const rows = await prisma.wishlistItem.findMany({
    where: { userId, product: { is: STOREFRONT_PRODUCT_WHERE } },
    select: { productId: true },
  });
  return rows.map((r) => r.productId);
}

export async function addToWishlist(userId: string, productId: string) {
  const p = await prisma.product.findFirst({
    where: { id: productId, ...STOREFRONT_PRODUCT_WHERE },
    select: { id: true },
  });
  if (!p) throw new ApiError(404, "Product not found");
  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId, productId } },
    update: {},
    create: { userId, productId },
  });
}

export async function removeFromWishlist(userId: string, productId: string) {
  await prisma.wishlistItem.deleteMany({ where: { userId, productId } });
}

export async function clearWishlist(userId: string) {
  await prisma.wishlistItem.deleteMany({ where: { userId } });
}

export async function moveWishlistItemToCart(userId: string, productId: string) {
  return prisma.$transaction(async (transaction) => {
    const wishlistItem = await transaction.wishlistItem.findFirst({
      where: { userId, productId, product: { is: STOREFRONT_PRODUCT_WHERE } },
      select: { product: { select: { isActive: true, stock: true } } },
    });
    if (!wishlistItem) return { moved: 0 };

    const cart = await transaction.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
    const existing = await transaction.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
      select: { quantity: true },
    });
    const quantity = (existing?.quantity ?? 0) + 1;
    if (quantity > wishlistItem.product.stock) {
      throw new ApiError(409, `Only ${wishlistItem.product.stock} in stock`);
    }

    await transaction.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { quantity },
      create: { cartId: cart.id, productId, quantity },
    });
    await transaction.wishlistItem.delete({
      where: { userId_productId: { userId, productId } },
    });
    return { moved: 1 };
  });
}

export async function moveWishlistToCart(userId: string) {
  return prisma.$transaction(async (transaction) => {
    const items = await transaction.wishlistItem.findMany({
      where: { userId, product: { is: STOREFRONT_PRODUCT_WHERE } },
      select: { productId: true },
    });
    const productIds = items.map((item) => item.productId);
    if (!productIds.length) return { moved: 0 };

    const cart = await transaction.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
    const [products, cartItems] = await Promise.all([
      transaction.product.findMany({
        where: { id: { in: productIds }, ...STOREFRONT_PRODUCT_WHERE },
        select: { id: true, stock: true },
      }),
      transaction.cartItem.findMany({
        where: { cartId: cart.id, productId: { in: productIds } },
        select: { productId: true, quantity: true },
      }),
    ]);
    const stockById = new Map(products.map((product) => [product.id, product.stock]));
    const quantityById = new Map(
      cartItems.map((item) => [item.productId, item.quantity]),
    );

    for (const productId of productIds) {
      const stock = stockById.get(productId) ?? 0;
      const nextQuantity = (quantityById.get(productId) ?? 0) + 1;
      if (nextQuantity > stock) {
        throw new ApiError(409, `A wishlist item is out of stock or has insufficient stock`);
      }
    }

    for (const productId of productIds) {
      const quantity = (quantityById.get(productId) ?? 0) + 1;
      await transaction.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId } },
        update: { quantity },
        create: { cartId: cart.id, productId, quantity },
      });
    }
    await transaction.wishlistItem.deleteMany({
      where: { userId, productId: { in: productIds } },
    });
    return { moved: productIds.length };
  });
}
