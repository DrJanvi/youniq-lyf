import { createHmac, timingSafeEqual } from "node:crypto";

function matchesSignature(expected: string, received: string) {
  if (!/^[\da-f]{64}$/i.test(received)) return false;
  const expectedBytes = Buffer.from(expected, "hex");
  const receivedBytes = Buffer.from(received, "hex");
  return (
    expectedBytes.length === receivedBytes.length &&
    timingSafeEqual(expectedBytes, receivedBytes)
  );
}

export function verifyRazorpayPaymentSignature(
  secret: string,
  orderId: string,
  paymentId: string,
  signature: string,
) {
  const expected = createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return matchesSignature(expected, signature);
}

export function verifyRazorpayWebhookSignature(
  secret: string,
  rawBody: string,
  signature: string,
) {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return matchesSignature(expected, signature);
}
