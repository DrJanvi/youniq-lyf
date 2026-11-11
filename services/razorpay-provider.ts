import { ApiError } from "@/lib/http";
import "server-only";
import { z } from "zod";
import { razorpayPaymentSchema } from "./razorpay-payment-schema";

export type { RazorpayPayment } from "./razorpay-payment-schema";

const providerOrderSchema = z.object({
  id: z.string().min(1),
  amount: z.number().int().positive(),
  currency: z.string().min(3).max(3),
});

function credentials() {
  const key = process.env.RAZORPAY_KEY;
  const secret = process.env.RAZORPAY_SECRET;
  if (!key || !secret) {
    throw new ApiError(503, "Online payments are not configured");
  }
  return { key, secret };
}

export function getRazorpayKeyId() {
  return credentials().key;
}

async function requestProvider<T>(
  path: string,
  init: RequestInit,
  schema: z.ZodType<T>,
) {
  const { key, secret } = credentials();
  let response: Response;
  try {
    response = await fetch(`https://api.razorpay.com/v1${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        ...init.headers,
      },
    });
  } catch (error) {
    console.error("Could not reach Razorpay", error);
    throw new ApiError(502, "Could not reach Razorpay. Please try again.");
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    console.error(
      `Razorpay returned an unreadable response (${response.status})`,
      error,
    );
    throw new ApiError(502, "Razorpay returned an invalid response");
  }

  if (!response.ok) {
    console.error(`Razorpay request failed with status ${response.status}`);
    throw new ApiError(502, "Razorpay could not process the payment request");
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    console.error("Razorpay returned an unexpected response", parsed.error);
    throw new ApiError(502, "Razorpay returned an invalid response");
  }
  return parsed.data;
}

export function createRazorpayOrder(
  amount: number,
  currency: string,
  receipt: string,
) {
  return requestProvider(
    "/orders",
    {
      method: "POST",
      body: JSON.stringify({ amount, currency, receipt, payment_capture: 1 }),
    },
    providerOrderSchema,
  );
}

export function getRazorpayPayment(paymentId: string) {
  return requestProvider(
    `/payments/${encodeURIComponent(paymentId)}`,
    { method: "GET" },
    razorpayPaymentSchema,
  );
}
