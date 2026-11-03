import { api, readJson } from "@/lib/http";
import { requireAdminApi } from "@/lib/auth/session";
import { highlightedPostSchema } from "@/lib/validation";
import { createHighlightedPost, listHighlightedPosts } from "@/services/highlighted-post";

export const GET = api(async () => {
  await requireAdminApi();
  return { data: await listHighlightedPosts() };
});

export const POST = api(async (req) => {
  await requireAdminApi();
  const input = highlightedPostSchema.parse(await readJson(req));
  return Response.json(await createHighlightedPost(input), { status: 201 });
});
