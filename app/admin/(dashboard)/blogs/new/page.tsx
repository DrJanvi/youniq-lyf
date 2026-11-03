import { PageHeader } from "@/components/admin/common/PageHeader";
import { BlogArticleForm } from "@/components/admin/forms/BlogArticleForm";
import { requireAdminPage } from "@/lib/auth/session";

export default async function NewBlogArticlePage() {
  await requireAdminPage();
  return (
    <>
      <PageHeader title="New blog article" backHref="/admin/blogs" />
      <BlogArticleForm initial={{ publishedAt: new Date().toISOString().slice(0, 10) }} />
    </>
  );
}
