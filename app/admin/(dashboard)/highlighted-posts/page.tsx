import { AddButton } from "@/components/admin/common/AddButton";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { HighlightedPostsTable } from "@/components/admin/tables/HighlightedPostsTable";
import { type SearchParams, parseListParams } from "@/lib/admin/list-params";
import { requireAdminPage } from "@/lib/auth/session";
import { isHighlightedPostVideoUrl } from "@/lib/highlighted-post-media";
import { isHighlightedPostLimitReached, MAX_HIGHLIGHTED_POSTS } from "@/lib/highlighted-post-limit";
import { countActiveHighlightedPosts, listHighlightedPostsAdmin } from "@/services/highlighted-post";
import { Button } from "@/components/admin/ui/button";

export default async function AdminHighlightedPostsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminPage();
  const p = parseListParams(await searchParams, { sortable: ["sortOrder", "alt", "createdAt"], defaultSort: "sortOrder", defaultDir: "asc", filters: { deleted: ["active", "deleted"] } });
  const [result, activePostCount] = await Promise.all([
    listHighlightedPostsAdmin(p),
    countActiveHighlightedPosts(),
  ]);
  const atLimit = isHighlightedPostLimitReached(activePostCount);
  return (
    <>
      <PageHeader
        title="Highlighted posts"
        description={`Banners shown on the storefront home page. ${activePostCount}/${MAX_HIGHLIGHTED_POSTS} active posts.`}
        actions={atLimit ? (
          <Button type="button" disabled title="Delete an active post before adding another.">
            Limit reached
          </Button>
        ) : <AddButton href="/admin/highlighted-posts/new" label="Add post" />}
      />
      <HighlightedPostsTable
        meta={{ total: result.pagination.total, page: result.pagination.page, totalPages: result.pagination.totalPages, sort: p.sort, dir: p.dir, q: p.q }}
        deleted={p.filters.deleted}
        rows={result.data.map((r) => ({
          id: r.id,
          image: r.image,
          mediaType: isHighlightedPostVideoUrl(r.image) ? "video" : r.mediaType,
          link: r.link,
          alt: r.alt,
          sortOrder: r.sortOrder,
          deletedAt: r.deletedAt?.toISOString() ?? null,
          restoreDisabled: atLimit && r.deletedAt !== null,
        }))}
      />
    </>
  );
}
