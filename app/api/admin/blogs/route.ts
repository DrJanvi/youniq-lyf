import { api, readJson } from "@/lib/http";
import { requireAdminApi } from "@/lib/auth/session";
import { BLOG_CATEGORIES } from "@/lib/blog";
import { blogArticleSchema } from "@/lib/validation";
import { parseListParams } from "@/lib/admin/list-params";
import { createBlogArticle, listBlogArticlesAdmin } from "@/services/blog-article";

export const GET = api(async (req) => {
  await requireAdminApi();
  const search = new URL(req.url).searchParams;
  const params = parseListParams(Object.fromEntries(search.entries()), {
    sortable: ["title", "category", "publishedAt", "createdAt"],
    defaultSort: "publishedAt",
    filters: { category: BLOG_CATEGORIES },
  });
  return listBlogArticlesAdmin(params);
});

export const POST = api(async (req) => {
  await requireAdminApi();
  const input = blogArticleSchema.parse(await readJson(req));
  return Response.json(await createBlogArticle(input), { status: 201 });
});
