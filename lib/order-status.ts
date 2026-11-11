import type { PaymentMethod, PaymentStatus } from "@prisma/client";

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
  RAZORPAY: "Razorpay",
  PAYU: "PayU (legacy)",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  NOT_REQUIRED: "Pay on delivery",
  PENDING: "Payment confirmation pending",
  PAID: "Paid",
  FAILED: "Payment failed",
};
