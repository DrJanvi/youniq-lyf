import type { PaymentMethod } from "@prisma/client";

export const orderStatusLabels: Record<string, string> = {
  PENDING: "Order placed / Processing",
  APPROVED: "Accepted",
  REJECTED: "Rejected",
  DISPATCHED: "Dispatched",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  DELIVERY_ATTEMPT_FAILED: "Delivery attempt failed",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH_ON_DELIVERY: "Cash on Delivery",
  RAZORPAY: "Razorpay (mock)",
  PAYU: "PayU (mock)",
};
