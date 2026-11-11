import "server-only";
import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { ApiError } from "@/lib/http";
import {
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from "@/lib/razorpay-signature";
import { prisma } from "@/lib/prisma";
import { sendInvoiceForOrder } from "./invoice";
import { prepareCheckout } from "./order";
import {
  createRazorpayOrder,
  getRazorpayKeyId,
  getRazorpayPayment,
} from "./razorpay-provider";
import {
  razorpayPaymentSchema,
  type RazorpayPayment,
} from "./razorpay-payment-schema";
import { z } from "zod";

const CREATING_TIMEOUT_MS = 5 * 60 * 1000;

function minorUnits(amount: number) {
  const value = Math.round(amount * 100);
  if (!Number.isSafeInteger(value) || value < 100) {
    throw new ApiError(
      400,
      "Razorpay requires an order total of at least 1.00 in the selected currency",
    );
  }
  return BigInt(value);
}

function sortLines<T extends {
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: number;
}>(lines: T[]) {
  return lines
    .map((line) => ({
      productId: line.productId,
      variantId: line.variantId,
      quantity: line.quantity,
      unitPrice: Math.round(line.unitPrice * 100),
    }))
    .sort((a, b) =>
      `${a.productId}:${a.variantId ?? ""}`.localeCompare(
        `${b.productId}:${b.variantId ?? ""}`,
      ),
    );
}

function matchesCheckout(
  existing: {
    total: Prisma.Decimal;
    currency: string;
    couponCode: string | null;
    shippingName: string | null;
    shippingPhone: string | null;
    shippingAddress: string | null;
    items: { productId: string; variantId: string | null; quantity: number; unitPrice: Prisma.Decimal }[];
  },
  prepared: Awaited<ReturnType<typeof prepareCheckout>>,
) {
  const expected = prepared.orderData;
  return (
    Math.round(Number(existing.total) * 100) ===
      Math.round(Number(expected.total) * 100) &&
    existing.currency === expected.currency &&
    existing.couponCode === expected.couponCode &&
    existing.shippingName === expected.shippingName &&
    existing.shippingPhone === expected.shippingPhone &&
    existing.shippingAddress === expected.shippingAddress &&
    JSON.stringify(
      sortLines(
        existing.items.map((item) => ({
          ...item,
          unitPrice: Number(item.unitPrice),
        })),
      ),
    ) === JSON.stringify(sortLines(prepared.cartItems))
  );
}

type CheckoutAttempt = {
  orderId: string;
  attemptId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  customer: { name: string; email: string | null; contact: string };
};

function serializeAttempt(
  attempt: {
    id: string;
    razorpayOrderId: string | null;
    amount: bigint;
    currency: string;
    order: { id: string; shippingName: string | null; shippingPhone: string | null; user: { email: string | null } };
  },
  keyId: string,
): CheckoutAttempt {
  if (!attempt.razorpayOrderId) {
    throw new ApiError(409, "Payment checkout is still initializing");
  }
  return {
    orderId: attempt.order.id,
    attemptId: attempt.id,
    razorpayOrderId: attempt.razorpayOrderId,
    amount: Number(attempt.amount),
    currency: attempt.currency,
    keyId,
    customer: {
      name: attempt.order.shippingName ?? "",
      email: attempt.order.user.email,
      contact: attempt.order.shippingPhone ?? "",
    },
  };
}

async function findMatchingPendingOrder(
  userId: string,
  prepared: Awaited<ReturnType<typeof prepareCheckout>>,
) {
  const candidates = await prisma.order.findMany({
    where: {
      userId,
      paymentMethod: "RAZORPAY",
      paymentStatus: { in: ["PENDING", "FAILED"] },
      status: "PENDING",
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      items: true,
      paymentAttempts: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { order: { include: { user: { select: { email: true } } } } },
      },
    },
  });
  return candidates.find((candidate) => matchesCheckout(candidate, prepared)) ?? null;
}

async function applyAttemptFailure(
  tx: Prisma.TransactionClient,
  attemptId: string,
  reason: string,
  paymentId?: string,
  failureCode?: string,
) {
  await tx.razorpayPaymentAttempt.updateMany({
    where: { id: attemptId, status: { not: "CAPTURED" } },
    data: {
      status: "FAILED",
      ...(paymentId ? { razorpayPaymentId: paymentId } : {}),
      failureCode: failureCode ?? null,
      failureDescription: reason.slice(0, 5000),
    },
  });
  const attempt = await tx.razorpayPaymentAttempt.findUnique({
    where: { id: attemptId },
    select: { orderId: true },
  });
  if (!attempt) return;

  const [captured, active] = await Promise.all([
    tx.razorpayPaymentAttempt.findFirst({
      where: { orderId: attempt.orderId, status: "CAPTURED" },
      select: { id: true },
    }),
    tx.razorpayPaymentAttempt.findFirst({
      where: {
        orderId: attempt.orderId,
        status: { in: ["CREATING", "CREATED", "AUTHORIZED"] },
      },
      select: { id: true },
    }),
  ]);
  await tx.order.updateMany({
    where: { id: attempt.orderId, paymentStatus: { not: "PAID" } },
    data: {
      paymentStatus: captured ? "PAID" : active ? "PENDING" : "FAILED",
    },
  });
}

async function markAttemptFailed(
  attemptId: string,
  reason: string,
  paymentId?: string,
  failureCode?: string,
) {
  await prisma.$transaction((tx) =>
    applyAttemptFailure(tx, attemptId, reason, paymentId, failureCode),
  );
}

async function markAttemptAuthorized(attemptId: string, paymentId: string) {
  await prisma.$transaction(async (tx) => {
    const attempt = await tx.razorpayPaymentAttempt.updateMany({
      where: { id: attemptId, status: { in: ["CREATED", "AUTHORIZED"] } },
      data: { status: "AUTHORIZED", razorpayPaymentId: paymentId },
    });
    if (attempt.count) {
      const row = await tx.razorpayPaymentAttempt.findUnique({
        where: { id: attemptId },
        select: { orderId: true },
      });
      if (row) {
        await tx.order.updateMany({
          where: { id: row.orderId, paymentStatus: { not: "PAID" } },
          data: { paymentStatus: "PENDING" },
        });
      }
    }
  });
}

async function removePaidItemsFromCart(
  tx: Prisma.TransactionClient,
  userId: string,
  items: { productId: string; variantId: string | null; quantity: number }[],
) {
  const cart = await tx.cart.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!cart) return;

  for (const item of items) {
    await tx.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId: item.productId,
        variantKey: item.variantId ?? "",
        quantity: item.quantity,
      },
    });
  }
}

async function markAttemptCaptured(
  tx: Prisma.TransactionClient,
  payment: Pick<RazorpayPayment, "id" | "order_id" | "amount" | "currency">,
) {
  const attempt = await tx.razorpayPaymentAttempt.findUnique({
    where: { razorpayOrderId: payment.order_id },
    include: {
      order: {
        include: {
          items: { select: { productId: true, variantId: true, quantity: true } },
          user: { select: { email: true } },
        },
      },
    },
  });
  if (!attempt) {
    return {
      orderId: null,
      shouldSendInvoice: false,
      duplicateCapture: false,
    };
  }

  if (
    attempt.amount !== BigInt(payment.amount) ||
    attempt.currency !== payment.currency ||
    attempt.order.paymentMethod !== "RAZORPAY" ||
    BigInt(Math.round(Number(attempt.order.total) * 100)) !== attempt.amount ||
    attempt.order.currency !== attempt.currency
  ) {
    throw new ApiError(400, "Razorpay payment does not match the order");
  }

  const alreadyPaid = attempt.order.paymentStatus === "PAID";
  const captured = await tx.razorpayPaymentAttempt.updateMany({
    where: { id: attempt.id, status: { not: "CAPTURED" } },
    data: {
      status: "CAPTURED",
      razorpayPaymentId: payment.id,
      failureCode: null,
      failureDescription: null,
    },
  });
  const paid = await tx.order.updateMany({
    where: { id: attempt.orderId, paymentStatus: { not: "PAID" } },
    data: { paymentStatus: "PAID" },
  });
  if (!paid.count) {
    return {
      orderId: attempt.orderId,
      shouldSendInvoice: false,
      duplicateCapture:
        alreadyPaid &&
        (captured.count > 0 || attempt.razorpayPaymentId !== payment.id),
    };
  }

  const invoice = await tx.invoice.findUnique({
    where: { orderId: attempt.orderId },
    select: { id: true },
  });
  if (!invoice) {
    await tx.invoice.create({
      data: {
        orderId: attempt.orderId,
        recipientEmail: attempt.order.user.email,
      },
    });
  }
  await removePaidItemsFromCart(tx, attempt.order.userId, attempt.order.items);
  return {
    orderId: attempt.orderId,
    shouldSendInvoice: true,
    duplicateCapture: false,
  };
}

async function deliverPaidInvoice(orderId: string | null, shouldSendInvoice: boolean) {
  if (!orderId || !shouldSendInvoice) return;
  try {
    await sendInvoiceForOrder(orderId);
  } catch (error) {
    console.error(`Could not attempt invoice delivery for paid order ${orderId}`, error);
  }
}

export async function createRazorpayCheckout(
  userId: string,
  input: { addressId: string; couponCode?: string },
) {
  const keyId = getRazorpayKeyId();
  const prepared = await prepareCheckout(userId, input, "RAZORPAY");
  const amount = minorUnits(Number(prepared.orderData.total));
  const amountNumber = Number(amount);
  const currency = prepared.orderData.currency.toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new ApiError(400, "The order currency is not supported by Razorpay");
  }
  prepared.orderData.currency = currency;

  let existing = await findMatchingPendingOrder(userId, prepared);
  let currentAttempt = existing?.paymentAttempts[0] ?? null;
  if (currentAttempt?.status === "CREATING") {
    if (Date.now() - currentAttempt.createdAt.getTime() < CREATING_TIMEOUT_MS) {
      throw new ApiError(409, "Payment checkout is already being initialized");
    }
    await markAttemptFailed(
      currentAttempt.id,
      "Payment checkout initialization timed out",
    );
    existing = await findMatchingPendingOrder(userId, prepared);
    currentAttempt = existing?.paymentAttempts[0] ?? null;
  }
  if (currentAttempt?.status === "AUTHORIZED") {
    throw new ApiError(
      409,
      "Payment is being confirmed. Check your orders before retrying.",
    );
  }
  if (currentAttempt?.status === "CREATED" && currentAttempt.razorpayOrderId) {
    return serializeAttempt(
      currentAttempt,
      keyId,
    );
  }

  const attemptId = randomUUID();
  const attempt = await prisma.$transaction(async (tx) => {
    if (existing) {
      const claimed = await tx.order.updateMany({
        where: {
          id: existing.id,
          status: "PENDING",
          deletedAt: null,
          paymentStatus: { in: ["PENDING", "FAILED"] },
        },
        data: { paymentStatus: "PENDING" },
      });
      if (!claimed.count) {
        throw new ApiError(409, "This order is no longer available for payment");
      }
      const active = await tx.razorpayPaymentAttempt.findFirst({
        where: {
          orderId: existing.id,
          status: { in: ["CREATING", "CREATED", "AUTHORIZED"] },
        },
        orderBy: { createdAt: "desc" },
      });
      if (active) {
        throw new ApiError(409, "A payment attempt is already in progress");
      }
      return tx.razorpayPaymentAttempt.create({
        data: {
          id: attemptId,
          orderId: existing.id,
          amount,
          currency,
          status: "CREATING",
        },
        include: {
          order: { include: { user: { select: { email: true } } } },
        },
      });
    }

    return tx.razorpayPaymentAttempt.create({
      data: {
        id: attemptId,
        amount,
        currency,
        status: "CREATING",
        order: {
          create: {
            ...prepared.orderData,
            paymentMethod: "RAZORPAY",
            paymentStatus: "PENDING",
          },
        },
      },
      include: {
        order: { include: { user: { select: { email: true } } } },
      },
    });
  });

  let providerOrder: Awaited<ReturnType<typeof createRazorpayOrder>>;
  try {
    providerOrder = await createRazorpayOrder(
      amountNumber,
      currency,
      attempt.id,
    );
    if (
      providerOrder.amount !== amountNumber ||
      providerOrder.currency !== currency
    ) {
      throw new ApiError(502, "Razorpay created an order with unexpected details");
    }
  } catch (error) {
    try {
      await markAttemptFailed(
        attempt.id,
        error instanceof Error ? error.message : "Razorpay order creation failed",
      );
    } catch (recordError) {
      console.error(
        `Could not record Razorpay order creation failure for attempt ${attempt.id}`,
        recordError,
      );
    }
    throw error;
  }

  await prisma.razorpayPaymentAttempt.update({
    where: { id: attempt.id },
    data: {
      razorpayOrderId: providerOrder.id,
      status: "CREATED",
    },
  });
  return serializeAttempt(
    {
      ...attempt,
      razorpayOrderId: providerOrder.id,
    },
    keyId,
  );
}

async function processPaymentResult(
  userId: string,
  input: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  },
) {
  const secret = process.env.RAZORPAY_SECRET;
  if (!secret) throw new ApiError(503, "Online payments are not configured");
  if (
    !verifyRazorpayPaymentSignature(
      secret,
      input.razorpay_order_id,
      input.razorpay_payment_id,
      input.razorpay_signature,
    )
  ) {
    throw new ApiError(400, "Razorpay payment signature is invalid");
  }

  const attempt = await prisma.razorpayPaymentAttempt.findUnique({
    where: { razorpayOrderId: input.razorpay_order_id },
    include: {
      order: {
        select: {
          id: true,
          userId: true,
          paymentStatus: true,
          total: true,
          currency: true,
        },
      },
    },
  });
  if (!attempt || attempt.order.userId !== userId) {
    throw new ApiError(404, "Payment attempt not found");
  }

  const payment = await getRazorpayPayment(input.razorpay_payment_id);
  if (
    payment.id !== input.razorpay_payment_id ||
    payment.order_id !== input.razorpay_order_id ||
    payment.amount !== Number(attempt.amount) ||
    payment.currency !== attempt.currency
  ) {
    throw new ApiError(400, "Razorpay payment does not match the order");
  }

  if (payment.status === "captured" || payment.captured === true) {
    const result = await prisma.$transaction((tx) =>
      markAttemptCaptured(tx, payment),
    );
    if (result.duplicateCapture) {
      console.error(
        `Razorpay reported an additional captured payment for order ${result.orderId}`,
      );
    }
    await deliverPaidInvoice(result.orderId, result.shouldSendInvoice);
    return {
      orderId: attempt.order.id,
      paymentStatus: "PAID" as const,
    };
  }
  if (payment.status === "failed") {
    await markAttemptFailed(
      attempt.id,
      payment.error_description ?? "Razorpay payment failed",
      payment.id,
      payment.error_code,
    );
  }
  if (payment.status === "authorized") {
    await markAttemptAuthorized(attempt.id, payment.id);
  }
  const current = await prisma.order.findUnique({
    where: { id: attempt.order.id },
    select: { paymentStatus: true },
  });
  return {
    orderId: attempt.order.id,
    paymentStatus: current?.paymentStatus ?? "PENDING",
  };
}

export async function verifyRazorpayCheckout(
  userId: string,
  input: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  },
) {
  return processPaymentResult(userId, input);
}

const webhookSchema = z.object({
  event: z.string().min(1),
  payload: z
    .object({
      payment: z.object({ entity: razorpayPaymentSchema }).optional(),
    })
    .optional(),
});

export async function processRazorpayWebhook(
  rawBody: string,
  signature: string | null,
  eventId: string | null,
) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new ApiError(503, "Razorpay webhook is not configured");
  }
  if (!signature || !verifyRazorpayWebhookSignature(webhookSecret, rawBody, signature)) {
    throw new ApiError(400, "Razorpay webhook signature is invalid");
  }
  if (!eventId || eventId.length > 191) {
    throw new ApiError(400, "Razorpay event ID is missing or invalid");
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    throw new ApiError(400, "Razorpay webhook body is invalid JSON");
  }
  const parsed = webhookSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(400, "Razorpay webhook payload is invalid");
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const prior = await tx.razorpayWebhookEvent.findUnique({
        where: { eventId },
        select: { id: true },
      });
      if (prior) {
        return {
          duplicate: true,
          orderId: null,
          shouldSendInvoice: false,
          duplicateCapture: false,
        };
      }

      await tx.razorpayWebhookEvent.create({
        data: { eventId, eventType: parsed.data.event },
      });
      const payment = parsed.data.payload?.payment?.entity;
      if (!payment) {
        return {
          duplicate: false,
          orderId: null,
          shouldSendInvoice: false,
          duplicateCapture: false,
        };
      }
      if (
        parsed.data.event === "payment.captured" &&
        (payment.captured === true || payment.status === "captured")
      ) {
        const result = await markAttemptCaptured(tx, payment);
        return { duplicate: false, ...result };
      }
      if (parsed.data.event === "payment.failed") {
        const attempt = await tx.razorpayPaymentAttempt.findUnique({
          where: { razorpayOrderId: payment.order_id },
          include: {
            order: {
              select: {
                paymentMethod: true,
                total: true,
                currency: true,
              },
            },
          },
        });
        if (!attempt) {
          console.warn(`Razorpay failure event ${eventId} has no matching attempt`);
          return {
            duplicate: false,
            orderId: null,
            shouldSendInvoice: false,
            duplicateCapture: false,
          };
        }
        if (
          attempt.order.paymentMethod !== "RAZORPAY" ||
          attempt.amount !== BigInt(payment.amount) ||
          attempt.currency !== payment.currency ||
          attempt.order.currency !== payment.currency ||
          BigInt(Math.round(Number(attempt.order.total) * 100)) !== attempt.amount
        ) {
          throw new ApiError(400, "Razorpay payment does not match the order");
        }
        await applyAttemptFailure(
          tx,
          attempt.id,
          payment.error_description ?? "Razorpay payment failed",
          payment.id,
          payment.error_code,
        );
        return {
          duplicate: false,
          orderId: attempt.orderId,
          shouldSendInvoice: false,
          duplicateCapture: false,
        };
      }
      return {
        duplicate: false,
        orderId: null,
        shouldSendInvoice: false,
        duplicateCapture: false,
      };
    });
    if (result.duplicateCapture) {
      console.error(
        `Razorpay reported an additional captured payment for order ${result.orderId}`,
      );
    }
    await deliverPaidInvoice(result.orderId, result.shouldSendInvoice);
    return { received: true, duplicate: result.duplicate };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const prior = await prisma.razorpayWebhookEvent.findUnique({
        where: { eventId },
        select: { id: true },
      });
      if (prior) return { received: true, duplicate: true };
    }
    throw error;
  }
}
