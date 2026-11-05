import { api, readJson, type IdCtx } from "@/lib/http";
import { requireAdminApi } from "@/lib/auth/session";
import { highlightedPostSchema } from "@/lib/validation";
import { deleteHighlightedPost, restoreHighlightedPost, updateHighlightedPost } from "@/services/highlighted-post";

export const PATCH = api<IdCtx>(async (req, { params }) => {
  await requireAdminApi();
  const input = highlightedPostSchema.parse(await readJson(req));
  return updateHighlightedPost((await params).id, input);
});

export const DELETE = api<IdCtx>(async (_req, { params }) => {
  await requireAdminApi();
  await deleteHighlightedPost((await params).id);
});

export const POST = api<IdCtx>(async (_req, { params }) => {
  await requireAdminApi();
  return restoreHighlightedPost((await params).id);
});
