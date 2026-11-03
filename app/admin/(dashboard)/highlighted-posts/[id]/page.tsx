import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { HighlightedPostForm } from "@/components/admin/forms/HighlightedPostForm";
import { requireAdminPage } from "@/lib/auth/session";
import { getHighlightedPost } from "@/services/highlighted-post";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const post = await getHighlightedPost(id);
  if (!post) notFound();
  return (
    <>
      <PageHeader title="Edit highlighted post" backHref="/admin/highlighted-posts" />
      <HighlightedPostForm id={id} initial={{ image: post.image, link: post.link, alt: post.alt ?? "", sortOrder: post.sortOrder }} />
    </>
  );
}
