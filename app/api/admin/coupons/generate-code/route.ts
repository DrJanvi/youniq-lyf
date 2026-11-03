import { api } from "@/lib/http";
import { requireAdminApi } from "@/lib/auth/session";
import { generateCouponCode } from "@/services/coupon";

export const POST = api(async () => {
  await requireAdminApi();
  return { code: await generateCouponCode() };
});
