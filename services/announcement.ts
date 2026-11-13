import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { ApiError } from "@/lib/http";
import type { ListParams } from "@/lib/admin/list-params";
import { paginated } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { invalidatePublicCache, PUBLIC_CACHE_TAGS } from "@/lib/public-cache";

export type AnnouncementInput = {
  message: string;
  link?: string;
  sortOrder: number;
};

export async function listAnnouncements() {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CACHE_TAGS.announcements);
  return prisma.announcementBarItem.findMany({
    where: { deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function listAnnouncementsAdmin(params: ListParams) {
  const where = {
    ...(params.q
      ? {
          OR: [
            { message: { contains: params.q } },
            { link: { contains: params.q } },
          ],
        }
      : {}),
    ...(params.filters.deleted === "deleted"
      ? { deletedAt: { not: null } }
      : params.filters.deleted === "active"
        ? { deletedAt: null }
        : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.announcementBarItem.findMany({
      where,
      orderBy: [{ [params.sort]: params.dir }, { id: "asc" }],
      skip: params.page.skip,
      take: params.page.limit,
    }),
    prisma.announcementBarItem.count({ where }),
  ]);
  return paginated(rows, total, params.page);
}

export const getAnnouncement = (id: string) =>
  prisma.announcementBarItem.findUnique({ where: { id } });

export async function createAnnouncement(input: AnnouncementInput) {
  const announcement = await prisma.announcementBarItem.create({
    data: { ...input, link: input.link ?? null },
  });
  invalidatePublicCache(PUBLIC_CACHE_TAGS.announcements);
  return announcement;
}

export async function updateAnnouncement(id: string, input: AnnouncementInput) {
  const announcement = await prisma.announcementBarItem.update({
    where: { id },
    data: { ...input, link: input.link ?? null },
  });
  invalidatePublicCache(PUBLIC_CACHE_TAGS.announcements);
  return announcement;
}

export async function deleteAnnouncement(id: string) {
  const result = await prisma.announcementBarItem.updateMany({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  if (!result.count) throw new ApiError(404, "Announcement not found");
  invalidatePublicCache(PUBLIC_CACHE_TAGS.announcements);
  return { deleted: true };
}

export async function restoreAnnouncement(id: string) {
  const result = await prisma.announcementBarItem.updateMany({
    where: { id, deletedAt: { not: null } },
    data: { deletedAt: null },
  });
  if (!result.count) throw new ApiError(404, "Deleted announcement not found");
  invalidatePublicCache(PUBLIC_CACHE_TAGS.announcements);
  return { restored: true };
}
