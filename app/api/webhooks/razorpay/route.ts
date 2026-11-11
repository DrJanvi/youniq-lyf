import { api } from "@/lib/http";
import { processRazorpayWebhook } from "@/services/razorpay-checkout";

export const POST = api(async (req) => {
  return processRazorpayWebhook(
    await req.text(),
    req.headers.get("x-razorpay-signature"),
    req.headers.get("x-razorpay-event-id"),
  );
});
