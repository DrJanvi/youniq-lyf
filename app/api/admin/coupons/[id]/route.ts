import { api, readJson, type IdCtx } from "@/lib/http";
import { requireAdminApi } from "@/lib/auth/session";
import { couponInputSchema } from "@/lib/validation";
import { deleteCoupon, restoreCoupon, updateCoupon } from "@/services/coupon";

export const PATCH = api<IdCtx>(async (req, { params }) => {
  await requireAdminApi();
  return updateCoupon((await params).id, couponInputSchema.parse(await readJson(req)));
});

export const DELETE = api<IdCtx>(async (_req, { params }) => {
  await requireAdminApi();
  await deleteCoupon((await params).id);
});

export const POST = api<IdCtx>(async (_req, { params }) => {
  await requireAdminApi();
  return restoreCoupon((await params).id);
});
