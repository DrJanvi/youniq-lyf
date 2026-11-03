import { api, readJson, type IdCtx } from "@/lib/http";
import { requireAdminApi } from "@/lib/auth/session";
import { blogArticleSchema } from "@/lib/validation";
import {
  deleteBlogArticle,
  updateBlogArticle,
} from "@/services/blog-article";

export const PATCH = api<IdCtx>(async (req, { params }) => {
  await requireAdminApi();
  const input = blogArticleSchema.parse(await readJson(req));
  return updateBlogArticle((await params).id, input);
});

export const DELETE = api<IdCtx>(async (_req, { params }) => {
  await requireAdminApi();
  await deleteBlogArticle((await params).id);
});
