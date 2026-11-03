import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { BlogArticleForm } from "@/components/admin/forms/BlogArticleForm";
import { requireAdminPage } from "@/lib/auth/session";
import { getBlogArticle } from "@/services/blog-article";

export default async function EditBlogArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const article = await getBlogArticle(id);
  if (!article) notFound();

  return (
    <>
      <PageHeader title="Edit blog article" backHref="/admin/blogs" />
      <BlogArticleForm
        id={article.id}
        initial={{
          title: article.title,
          category: article.category,
          publishedAt: article.publishedAt.toISOString().slice(0, 10),
          readTime: article.readTime,
          excerpt: article.excerpt,
          image: article.image,
          content: article.content,
        }}
      />
    </>
  );
}
