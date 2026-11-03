import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { listTaxonomy } from "@/services/taxonomy";
import { wishlistIds } from "@/services/wishlist";
import { PUBLIC_CACHE_TAGS } from "@/lib/public-cache";

export async function getFilterOptions() {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CACHE_TAGS.taxonomy, PUBLIC_CACHE_TAGS.products);
  const [categories, types, brands, priceAggregate] = await Promise.all([
    listTaxonomy("category"),
    listTaxonomy("productType"),
    listTaxonomy("brand"),
    prisma.product.aggregate({
      where: { isActive: true },
      _count: { _all: true },
      _max: { price: true },
    }),
  ]);
  return {
    categories,
    types,
    brands,
    productCount: priceAggregate._count._all,
    priceRange: {
      min: 0,
      max: Math.max(1, Math.ceil(Number(priceAggregate._max.price ?? 10000))),
    },
  };
}

export async function getWishedIds() {
  const user = await getCurrentUser();
  return new Set(user ? await wishlistIds(user.id) : []);
}
