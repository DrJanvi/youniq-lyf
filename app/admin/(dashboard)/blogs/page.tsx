import { AddButton } from "@/components/admin/common/AddButton";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { BlogArticlesTable } from "@/components/admin/tables/BlogArticlesTable";
import { BLOG_CATEGORIES } from "@/lib/blog";
import { type SearchParams, parseListParams } from "@/lib/admin/list-params";
import { requireAdminPage } from "@/lib/auth/session";
import { listBlogArticlesAdmin } from "@/services/blog-article";

export default async function AdminBlogsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdminPage();
  const params = parseListParams(await searchParams, {
    sortable: ["title", "category", "publishedAt", "createdAt"],
    defaultSort: "publishedAt",
    filters: { category: BLOG_CATEGORIES, deleted: ["active", "deleted"] },
  });
  const result = await listBlogArticlesAdmin(params);
  return (
    <>
      <PageHeader
        title="Blog articles"
        description="Create and manage stories shown on the storefront."
        actions={<AddButton href="/admin/blogs/new" label="Add article" />}
      />
      <BlogArticlesTable
        meta={{
          total: result.pagination.total,
          page: result.pagination.page,
          totalPages: result.pagination.totalPages,
          sort: params.sort,
          dir: params.dir,
          q: params.q,
        }}
        category={params.filters.category}
        deleted={params.filters.deleted}
        rows={result.data.map((article) => ({
          id: article.id,
          title: article.title,
          category: article.category,
          publishedAt: article.publishedAt,
          readTime: article.readTime,
          image: article.image,
          deletedAt: article.deletedAt?.toISOString() ?? null,
        }))}
      />
    </>
  );
}
