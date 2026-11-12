import { PageHeader } from "@/components/admin/common/PageHeader";
import { HighlightedPostForm } from "@/components/admin/forms/HighlightedPostForm";
import { isHighlightedPostLimitReached, MAX_HIGHLIGHTED_POSTS } from "@/lib/highlighted-post-limit";
import { requireAdminPage } from "@/lib/auth/session";
import { countActiveHighlightedPosts } from "@/services/highlighted-post";

export default async function Page() {
  await requireAdminPage();
  const activePostCount = await countActiveHighlightedPosts();
  const atLimit = isHighlightedPostLimitReached(activePostCount);
  return (
    <>
      <PageHeader
        title="New highlighted post"
        description={`${activePostCount}/${MAX_HIGHLIGHTED_POSTS} active posts.`}
        backHref="/admin/highlighted-posts"
      />
      {atLimit ? (
        <p className="rounded-xl border border-border bg-muted p-4 text-sm text-muted-foreground" role="status">
          You already have {MAX_HIGHLIGHTED_POSTS} active highlighted posts. Delete one before adding another.
        </p>
      ) : <HighlightedPostForm />}
    </>
  );
}
