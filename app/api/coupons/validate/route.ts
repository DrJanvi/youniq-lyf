import { api, readJson } from "@/lib/http";
import { requireUserApi } from "@/lib/auth/session";
import { couponCodeInputSchema } from "@/lib/validation";
import { previewCoupon } from "@/services/coupon";

export const POST = api(async (req) => {
  const user = await requireUserApi();
  const { code } = couponCodeInputSchema.parse(await readJson(req));
  return previewCoupon(user.id, code);
});
