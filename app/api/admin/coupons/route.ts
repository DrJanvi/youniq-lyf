import { api, readJson } from "@/lib/http";
import { parsePagination } from "@/lib/pagination";
import { requireAdminApi } from "@/lib/auth/session";
import { couponInputSchema } from "@/lib/validation";
import { createCoupon, listCoupons } from "@/services/coupon";

export const GET = api(async (req) => {
  await requireAdminApi();
  return listCoupons(parsePagination(new URL(req.url).searchParams, 20));
});

export const POST = api(async (req) => {
  await requireAdminApi();
  return Response.json(await createCoupon(couponInputSchema.parse(await readJson(req))), { status: 201 });
});
