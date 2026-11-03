import { api, readJson, type IdCtx } from "@/lib/http";
import { requireAdminApi } from "@/lib/auth/session";
import { adminReviewInputSchema, reviewStatusSchema } from "@/lib/validation";
import { deleteReview, setReviewStatus, updateReview } from "@/services/review";

export const PATCH = api<IdCtx>(async (req, { params }) => {
  await requireAdminApi();
  const body = (await readJson(req)) as Record<string, unknown>;
  const { id } = await params;
  // Quick status changes send only { status }; the edit form sends the full review.
  if (Object.keys(body).length === 1 && "status" in body) return setReviewStatus(id, reviewStatusSchema.parse(body).status);
  return updateReview(id, adminReviewInputSchema.parse(body));
});

export const DELETE = api<IdCtx>(async (_req, { params }) => {
  await requireAdminApi();
  await deleteReview((await params).id);
});
