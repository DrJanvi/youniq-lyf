import { api, ApiError } from "@/lib/http";
import { isBlogCategory } from "@/lib/blog";
import { parsePagination } from "@/lib/pagination";
import { listBlogArticles } from "@/services/blog-article";

export const GET = api(async (req) => {
  const search = new URL(req.url).searchParams;
  const categoryParam = search.get("category");
  if (categoryParam && !isBlogCategory(categoryParam)) {
    throw new ApiError(400, "Invalid blog category");
  }
  const page = parsePagination(search, 9);
  return listBlogArticles(
    page,
    categoryParam && isBlogCategory(categoryParam) ? categoryParam : undefined,
  );
});
