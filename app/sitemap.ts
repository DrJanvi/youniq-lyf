import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo";
import { listAllSlugs } from "@/services/product";
import { listBlogArticleSlugs } from "@/services/blog-article";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const [products, categories, articles] = await Promise.all([
    listAllSlugs(),
    prisma.category.findMany({ where: { deletedAt: null }, select: { slug: true, updatedAt: true } }),
    listBlogArticleSlugs(),
  ]);
  return [
    { url: absoluteUrl("/") },
    { url: absoluteUrl("/products") },
    { url: absoluteUrl("/blogs") },
    { url: absoluteUrl("/careers") },
    { url: absoluteUrl("/terms-and-conditions") },
    { url: absoluteUrl("/privacy-policy") },
    { url: absoluteUrl("/return-exchange-policy") },
    { url: absoluteUrl("/shipping-payment-cancellation-policy") },
    { url: absoluteUrl("/refunds-policy") },
    { url: absoluteUrl("/faqs") },
    ...categories.map((c) => ({ url: absoluteUrl(`/category/${c.slug}`), lastModified: c.updatedAt })),
    ...products.map((p) => ({ url: absoluteUrl(`/products/${p.slug}`), lastModified: p.updatedAt })),
    ...articles.map((article) => ({
      url: absoluteUrl(`/blogs/${article.slug}`),
      lastModified: article.updatedAt,
    })),
  ];
}
