import { api, readJson } from "@/lib/http";
import { parsePagination } from "@/lib/pagination";
import { getCurrentUser } from "@/lib/auth/session";
import { publicReviewInputSchema } from "@/lib/validation";
import { createReview, listApprovedReviews, listLatestReviews } from "@/services/review";

export const GET = api(async (req) => {
  const sp = new URL(req.url).searchParams;
  const productId = sp.get("productId");
  if (!productId) return listLatestReviews();
  return listApprovedReviews(productId, parsePagination(sp));
});

// Public: reviews are stored as PENDING until approved in the admin dashboard.
export const POST = api(async (req) => {
  const input = publicReviewInputSchema.parse(await readJson(req));
  const user = await getCurrentUser();
  const review = await createReview({ ...input, status: "PENDING" }, user?.id);
  return Response.json(review, { status: 201 });
});
