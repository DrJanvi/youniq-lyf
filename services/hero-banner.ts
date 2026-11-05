import "server-only";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/http";
import { paginated } from "@/lib/pagination";
import type { ListParams } from "@/lib/admin/list-params";
import { cacheLife, cacheTag } from "next/cache";
import { invalidatePublicCache, PUBLIC_CACHE_TAGS } from "@/lib/public-cache";

export type HeroBannerInput = {
  desktopImage: string;
  mobileImage?: string;
  link: string;
  alt?: string;
  sortOrder: number;
};

export async function listHeroBanners() {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CACHE_TAGS.heroBanners);
  return prisma.heroBanner.findMany({
    where: { deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function listHeroBannersAdmin(p: ListParams) {
  const where = {
    ...(p.q ? { OR: [{ alt: { contains: p.q } }, { link: { contains: p.q } }] } : {}),
    ...(p.filters.deleted === "deleted"
      ? { deletedAt: { not: null } }
      : p.filters.deleted === "active"
        ? { deletedAt: null }
        : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.heroBanner.findMany({ where, orderBy: [{ [p.sort]: p.dir }, { id: "asc" }], skip: p.page.skip, take: p.page.limit }),
    prisma.heroBanner.count({ where }),
  ]);
  return paginated(rows, total, p.page);
}

export const getHeroBanner = (id: string) => prisma.heroBanner.findUnique({ where: { id } });

export async function createHeroBanner(d: HeroBannerInput) {
  const banner = await prisma.heroBanner.create({ data: d });
  invalidatePublicCache(PUBLIC_CACHE_TAGS.heroBanners);
  return banner;
}

export async function updateHeroBanner(id: string, d: HeroBannerInput) {
  const banner = await prisma.heroBanner.update({
    where: { id },
    data: { ...d, alt: d.alt ?? null, mobileImage: d.mobileImage ?? null },
  });
  invalidatePublicCache(PUBLIC_CACHE_TAGS.heroBanners);
  return banner;
}

export async function deleteHeroBanner(id: string) {
  const result = await prisma.heroBanner.updateMany({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  if (!result.count) throw new ApiError(404, "Hero banner not found");
  invalidatePublicCache(PUBLIC_CACHE_TAGS.heroBanners);
  return { deleted: true };
}

export async function restoreHeroBanner(id: string) {
  const result = await prisma.heroBanner.updateMany({
    where: { id, deletedAt: { not: null } },
    data: { deletedAt: null },
  });
  if (!result.count) throw new ApiError(404, "Deleted hero banner not found");
  invalidatePublicCache(PUBLIC_CACHE_TAGS.heroBanners);
  return { restored: true };
}
