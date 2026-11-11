import { api, readJson } from "@/lib/http";
import { requireUserApi } from "@/lib/auth/session";
import { razorpayCheckoutSchema } from "@/lib/validation";
import { createRazorpayCheckout } from "@/services/razorpay-checkout";

export const POST = api(async (req) => {
  const user = await requireUserApi();
  const input = razorpayCheckoutSchema.parse(await readJson(req));
  return createRazorpayCheckout(user.id, input);
});
