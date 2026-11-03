import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { paginated } from "@/lib/pagination";
import type { ListParams } from "@/lib/admin/list-params";
import { invalidatePublicCache, PUBLIC_CACHE_TAGS } from "@/lib/public-cache";

export type HighlightedPostInput = { image: string; link: string; alt?: string; sortOrder: number };

export async function listHighlightedPosts() {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CACHE_TAGS.highlightedPosts);
  return prisma.highlightedPost.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function listHighlightedPostsAdmin(p: ListParams) {
  const where = p.q ? { OR: [{ alt: { contains: p.q } }, { link: { contains: p.q } }] } : {};
  const [rows, total] = await Promise.all([
    prisma.highlightedPost.findMany({ where, orderBy: [{ [p.sort]: p.dir }, { id: "asc" }], skip: p.page.skip, take: p.page.limit }),
    prisma.highlightedPost.count({ where }),
  ]);
  return paginated(rows, total, p.page);
}

export const getHighlightedPost = (id: string) => prisma.highlightedPost.findUnique({ where: { id } });

export async function createHighlightedPost(d: HighlightedPostInput) {
  const post = await prisma.highlightedPost.create({ data: d });
  invalidatePublicCache(PUBLIC_CACHE_TAGS.highlightedPosts);
  return post;
}

export async function updateHighlightedPost(id: string, d: HighlightedPostInput) {
  const post = await prisma.highlightedPost.update({
    where: { id },
    data: { ...d, alt: d.alt ?? null },
  });
  invalidatePublicCache(PUBLIC_CACHE_TAGS.highlightedPosts);
  return post;
}

export async function deleteHighlightedPost(id: string) {
  const post = await prisma.highlightedPost.delete({ where: { id } });
  invalidatePublicCache(PUBLIC_CACHE_TAGS.highlightedPosts);
  return post;
}
