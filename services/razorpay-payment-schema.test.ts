import assert from "node:assert/strict";
import test from "node:test";
import { razorpayPaymentSchema } from "./razorpay-payment-schema";

test("accepts null Razorpay payment error metadata", () => {
  const payment = razorpayPaymentSchema.parse({
    id: "pay_test",
    order_id: "order_test",
    amount: 100,
    currency: "INR",
    status: "captured",
    error_code: null,
    error_description: null,
  });

  assert.equal(payment.error_code, undefined);
  assert.equal(payment.error_description, undefined);
});

test("still validates populated Razorpay payment error metadata", () => {
  assert.throws(() =>
    razorpayPaymentSchema.parse({
      id: "pay_test",
      order_id: "order_test",
      amount: 100,
      currency: "INR",
      status: "failed",
      error_code: 123,
    }),
  );
});
