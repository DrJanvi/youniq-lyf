import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { paginated, type PageParams } from "@/lib/pagination";
import { uniqueSlug } from "@/lib/slug";
import type { ListParams } from "@/lib/admin/list-params";
import { hasBlogContentText, type BlogArticleCard, type BlogCategory } from "@/lib/blog";
import { ApiError } from "@/lib/http";
import { sanitizeBlogContent } from "@/lib/blog-content";
import { invalidatePublicCache, PUBLIC_CACHE_TAGS } from "@/lib/public-cache";
import type { z } from "zod";
import type { blogArticleSchema } from "@/lib/validation";

type BlogArticleInput = z.infer<typeof blogArticleSchema>;

const toCard = (article: {
  id: string;
  slug: string;
  title: string;
  category: string;
  publishedAt: Date;
  readTime: number;
  excerpt: string;
  image: string;
}): BlogArticleCard => ({
  ...article,
  category: article.category as BlogCategory,
  publishedAt: article.publishedAt.toISOString(),
});

export async function listBlogArticles(
  page: PageParams,
  category?: BlogCategory,
) {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CACHE_TAGS.blogs);
  const where = category ? { category } : {};
  const [articles, total] = await Promise.all([
    prisma.blogArticle.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: page.skip,
      take: page.limit,
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        publishedAt: true,
        readTime: true,
        excerpt: true,
        image: true,
      },
    }),
    prisma.blogArticle.count({ where }),
  ]);
  return {
    ...paginated(articles.map(toCard), total, page),
  };
}

export async function listLatestBlogArticles(excludeSlug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CACHE_TAGS.blogs);
  const articles = await prisma.blogArticle.findMany({
    where: { slug: { not: excludeSlug } },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 3,
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      publishedAt: true,
      readTime: true,
      excerpt: true,
      image: true,
    },
  });
  return articles.map(toCard);
}

export async function listBlogArticlesAdmin(params: ListParams) {
  const where = {
    ...(params.q
      ? {
          OR: [
            { title: { contains: params.q } },
            { excerpt: { contains: params.q } },
          ],
        }
      : {}),
    ...(params.filters.category
      ? { category: params.filters.category }
      : {}),
  };
  const [articles, total] = await Promise.all([
    prisma.blogArticle.findMany({
      where,
      orderBy: [
        { [params.sort]: params.dir },
        { id: "asc" },
      ],
      skip: params.page.skip,
      take: params.page.limit,
    }),
    prisma.blogArticle.count({ where }),
  ]);
  return paginated(articles, total, params.page);
}

export async function getBlogArticle(id: string) {
  return prisma.blogArticle.findUnique({ where: { id } });
}

export async function getBlogArticleBySlug(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CACHE_TAGS.blogs);
  return prisma.blogArticle.findUnique({ where: { slug } });
}

export async function createBlogArticle(input: BlogArticleInput) {
  const content = sanitizeBlogContent(input.content);
  if (!hasBlogContentText(content)) {
    throw new ApiError(400, "Full content is required");
  }
  const slug = await uniqueSlug(input.title, async (candidate) =>
    Boolean(await prisma.blogArticle.findUnique({ where: { slug: candidate } })),
  );
  const article = await prisma.blogArticle.create({ data: { ...input, content, slug } });
  invalidatePublicCache(PUBLIC_CACHE_TAGS.blogs);
  return article;
}

export async function updateBlogArticle(id: string, input: BlogArticleInput) {
  const content = sanitizeBlogContent(input.content);
  if (!hasBlogContentText(content)) {
    throw new ApiError(400, "Full content is required");
  }
  const article = await prisma.blogArticle.update({
    where: { id },
    data: { ...input, content },
  });
  invalidatePublicCache(PUBLIC_CACHE_TAGS.blogs);
  return article;
}

export async function deleteBlogArticle(id: string) {
  const article = await prisma.blogArticle.delete({ where: { id } });
  invalidatePublicCache(PUBLIC_CACHE_TAGS.blogs);
  return article;
}

export async function listBlogArticleSlugs() {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CACHE_TAGS.blogs);
  return prisma.blogArticle.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
  });
}
