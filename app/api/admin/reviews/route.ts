import { api, readJson } from "@/lib/http";
import { parsePagination } from "@/lib/pagination";
import { requireAdminApi } from "@/lib/auth/session";
import { adminReviewInputSchema } from "@/lib/validation";
import { createReview, listReviewsAdmin } from "@/services/review";
import type { ReviewStatus } from "@prisma/client";

export const GET = api(async (req) => {
  await requireAdminApi();
  const sp = new URL(req.url).searchParams;
  const status = sp.get("status");
  const valid = ["PENDING", "APPROVED", "HIDDEN"].includes(status ?? "");
  return listReviewsAdmin(parsePagination(sp, 20), valid ? (status as ReviewStatus) : undefined, sp.get("productId") ?? undefined);
});

// Admins can add reviews directly (auto-approved by default).
export const POST = api(async (req) => {
  await requireAdminApi();
  const input = adminReviewInputSchema.parse(await readJson(req));
  return Response.json(await createReview(input), { status: 201 });
});
