import { api, readJson } from "@/lib/http";
import { requireUserApi } from "@/lib/auth/session";
import { razorpayPaymentVerificationSchema } from "@/lib/validation";
import { verifyRazorpayCheckout } from "@/services/razorpay-checkout";

export const POST = api(async (req) => {
  const user = await requireUserApi();
  const input = razorpayPaymentVerificationSchema.parse(await readJson(req));
  return verifyRazorpayCheckout(user.id, input);
});
