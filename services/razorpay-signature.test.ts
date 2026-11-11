import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import {
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from "@/lib/razorpay-signature";
import {
  checkoutSchema,
  razorpayCheckoutSchema,
} from "@/lib/validation";

const secret = "test-secret";

test("keeps generic order checkout on COD and routes online checkout separately", () => {
  const addressId = "00000000-0000-4000-8000-000000000001";

  assert.equal(
    checkoutSchema.parse({
      addressId,
      paymentMethod: "CASH_ON_DELIVERY",
    }).paymentMethod,
    "CASH_ON_DELIVERY",
  );
  assert.throws(() =>
    checkoutSchema.parse({ addressId, paymentMethod: "PAYU" }),
  );
  assert.deepEqual(razorpayCheckoutSchema.parse({ addressId }), { addressId });
});

test("verifies Razorpay Checkout signatures", () => {
  const orderId = "order_test";
  const paymentId = "pay_test";
  const signature = createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  assert.equal(
    verifyRazorpayPaymentSignature(secret, orderId, paymentId, signature),
    true,
  );
  assert.equal(
    verifyRazorpayPaymentSignature(secret, orderId, "pay_other", signature),
    false,
  );
  assert.equal(
    verifyRazorpayPaymentSignature(secret, orderId, paymentId, "invalid"),
    false,
  );
});

test("verifies Razorpay webhook signatures over the exact raw body", () => {
  const rawBody = '{"event":"payment.captured","payload":{}}';
  const signature = createHmac("sha256", secret).update(rawBody).digest("hex");

  assert.equal(
    verifyRazorpayWebhookSignature(secret, rawBody, signature),
    true,
  );
  assert.equal(
    verifyRazorpayWebhookSignature(secret, `${rawBody} `, signature),
    false,
  );
  assert.equal(
    verifyRazorpayWebhookSignature(secret, rawBody, "00".repeat(32)),
    false,
  );
});
