import "server-only";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/http";
import { paginated, type PageParams } from "@/lib/pagination";
import { round2 } from "@/lib/pricing";
import { getCart } from "./cart";
import { quoteCoupon } from "./coupon";
import { sendInvoiceForOrder } from "./invoice";
import type { OrderStatus, PaymentMethod, Prisma } from "@prisma/client";
import type { ListParams } from "@/lib/admin/list-params";
import type { OrderDeliveryUpdate } from "@/lib/validation";

const customerInclude = {
  items: { include: { product: { select: { images: true } } } },
  invoice: {
    select: { sequence: true, emailStatus: true, issuedAt: true, sentAt: true },
  },
} as const;
const adminListInclude = {
  items: true,
  user: { select: { email: true, name: true } },
  invoice: {
    select: { sequence: true, emailStatus: true, issuedAt: true, sentAt: true },
  },
} as const;
const adminInclude = {
  ...adminListInclude,
  invoice: {
    select: {
      sequence: true,
      emailStatus: true,
      recipientEmail: true,
      emailAttempts: true,
      lastAttemptAt: true,
      lastError: true,
      issuedAt: true,
      sentAt: true,
    },
  },
  deliveryAttempts: { orderBy: { createdAt: "desc" } },
} as const;

type OrderItemRecord = {
  id: string;
  orderId: string;
  productId: string;
  title: string;
  unitPrice: Prisma.Decimal;
  quantity: number;
  product?: { images: Prisma.JsonValue };
};

function serialize<T extends {
  subtotal: Prisma.Decimal;
  discountTotal: Prisma.Decimal;
  couponDiscount: Prisma.Decimal;
  total: Prisma.Decimal;
  items: OrderItemRecord[];
}>(
  o: T,
): Omit<T, "subtotal" | "discountTotal" | "couponDiscount" | "total" | "items"> & {
  subtotal: number;
  discountTotal: number;
  couponDiscount: number;
  total: number;
  items: Array<Omit<OrderItemRecord, "unitPrice"> & { unitPrice: number }>;
} {
  return {
    ...o,
    subtotal: Number(o.subtotal),
    discountTotal: Number(o.discountTotal),
    couponDiscount: Number(o.couponDiscount),
    total: Number(o.total),
    items: o.items.map((i) => ({ ...i, unitPrice: Number(i.unitPrice) })),
  };
}

/** Mock checkout: turns the cart into a PENDING order awaiting admin approval. */
export async function checkout(
  userId: string,
  input: { addressId: string; paymentMethod: PaymentMethod; couponCode?: string },
) {
  const cart = await getCart(userId);
  if (!cart.items.length) throw new ApiError(400, "Cart is empty");
  const coupon = input.couponCode ? await quoteCoupon(input.couponCode, cart.total) : null;
  const address = await prisma.savedAddress.findFirst({
    where: { id: input.addressId, userId },
  });
  if (!address) throw new ApiError(404, "Saved address not found");
  for (const l of cart.items) {
    if (l.quantity > l.product.stock) throw new ApiError(409, `"${l.product.title}" has only ${l.product.stock} in stock`);
  }
  const shippingAddress = [
    address.addressLine,
    address.city,
    address.state,
    address.country,
    address.postalCode,
  ].join(", ");
  const customer = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!customer) throw new ApiError(404, "Customer not found");

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId,
        shippingName: `${address.firstName} ${address.lastName}`,
        shippingPhone: address.phone,
        shippingAddress,
        paymentMethod: input.paymentMethod,
        currency: cart.items[0]?.product.currency ?? "AED",
        subtotal: cart.subtotal,
        discountTotal: round2(cart.discountTotal + (coupon?.discountAmount ?? 0)),
        couponId: coupon?.couponId ?? null,
        couponCode: coupon?.code ?? null,
        couponDiscount: coupon?.discountAmount ?? 0,
        total: coupon?.total ?? cart.total,
        items: {
          create: cart.items.map((l) => ({
            productId: l.product.id,
            title: l.product.title,
            unitPrice: l.product.finalPrice,
            quantity: l.quantity,
          })),
        },
        invoice: { create: { recipientEmail: customer.email } },
      },
      include: customerInclude,
    });
    await tx.cartItem.deleteMany({ where: { cart: { userId } } });
    return created;
  });

  let invoiceEmailStatus = order.invoice?.emailStatus ?? "PENDING";
  try {
    const delivery = await sendInvoiceForOrder(order.id);
    invoiceEmailStatus = delivery.emailStatus;
  } catch (error) {
    console.error(`Could not attempt invoice delivery for order ${order.id}`, error);
  }

  return serialize({
    ...order,
    invoice: order.invoice
      ? { ...order.invoice, emailStatus: invoiceEmailStatus }
      : null,
  });
}

export async function listUserOrders(userId: string, page: PageParams) {
  const where = { userId, deletedAt: null };
  const [rows, total] = await Promise.all([
    prisma.order.findMany({ where, include: customerInclude, orderBy: { createdAt: "desc" }, skip: page.skip, take: page.limit }),
    prisma.order.count({ where }),
  ]);
  return paginated(rows.map(serialize), total, page);
}

export async function getUserOrder(userId: string, orderId: string) {
  const row = await prisma.order.findFirst({
    where: { id: orderId, userId, deletedAt: null },
    include: customerInclude,
  });
  return row ? serialize(row) : null;
}

export async function listOrdersAdmin(page: PageParams, status?: OrderStatus, p?: ListParams) {
  const where: Prisma.OrderWhereInput = {
    ...(p?.filters.deleted === "deleted"
      ? { deletedAt: { not: null } }
      : p?.filters.deleted === "active"
        ? { deletedAt: null }
        : {}),
    ...(status ? { status } : {}),
    ...(p?.q
      ? { OR: [{ id: { startsWith: p.q } }, { shippingName: { contains: p.q } }, { shippingPhone: { contains: p.q } }, { user: { email: { contains: p.q } } }] }
      : {}),
  };
  const orderBy: Prisma.OrderOrderByWithRelationInput =
    p?.sort === "customer" ? { shippingName: p.dir } : { [p?.sort ?? "createdAt"]: p?.dir ?? "desc" };
  const [rows, total] = await Promise.all([
    prisma.order.findMany({ where, include: adminListInclude, orderBy: [orderBy, { id: "asc" }], skip: page.skip, take: page.limit }),
    prisma.order.count({ where }),
  ]);
  return paginated(rows.map(serialize), total, page);
}

export async function getOrderAdmin(id: string) {
  const row = await prisma.order.findUnique({ where: { id }, include: adminInclude });
  return row ? serialize(row) : null;
}

/** Orders that have been accepted or entered delivery cannot be removed. */
export async function deleteOrder(id: string) {
  const deleted = await prisma.order.updateMany({
    where: { id, status: { in: ["PENDING", "REJECTED"] }, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  if (deleted.count > 0) return;
  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true, deletedAt: true },
  });
  if (!order || order.deletedAt) throw new ApiError(404, "Order not found");
  throw new ApiError(409, "Accepted or delivery orders cannot be deleted");
}

export async function restoreOrder(id: string) {
  const restored = await prisma.order.updateMany({
    where: { id, deletedAt: { not: null }, status: { in: ["PENDING", "REJECTED"] } },
    data: { deletedAt: null },
  });
  if (restored.count) return { restored: true };
  const order = await prisma.order.findUnique({
    where: { id },
    select: { deletedAt: true },
  });
  if (!order?.deletedAt) throw new ApiError(404, "Deleted order not found");
  throw new ApiError(409, "Only pending or rejected orders can be restored");
}

export async function decideOrder(id: string, status: "APPROVED" | "REJECTED", adminNote?: string) {
  const updated = await prisma.$transaction(async (tx) => {
    // Conditional update makes the PENDING -> decided transition atomic.
    const claimed = await tx.order.updateMany({
      where: { id, status: "PENDING", deletedAt: null },
      data: { status, adminNote },
    });
    if (claimed.count === 0) {
      const exists = await tx.order.findUnique({ where: { id }, select: { id: true, deletedAt: true } });
      if (!exists || exists.deletedAt) throw new ApiError(404, "Order not found");
      throw new ApiError(409, "Order already decided");
    }
    if (status === "APPROVED") {
      const items = await tx.orderItem.findMany({ where: { orderId: id } });
      for (const it of items) {
        const r = await tx.product.updateMany({
          where: { id: it.productId, stock: { gte: it.quantity } },
          data: { stock: { decrement: it.quantity }, soldCount: { increment: it.quantity } },
        });
        if (r.count === 0) throw new ApiError(409, `Insufficient stock for "${it.title}"`);
      }
    }
    return tx.order.findUniqueOrThrow({ where: { id }, include: adminInclude });
  });
  return serialize(updated);
}

export async function updateOrderDelivery(id: string, update: OrderDeliveryUpdate) {
  const allowedFrom: OrderStatus[] =
    update.status === "DISPATCHED"
      ? ["APPROVED"]
      : update.status === "OUT_FOR_DELIVERY"
        ? ["DISPATCHED", "DELIVERY_ATTEMPT_FAILED"]
        : ["OUT_FOR_DELIVERY"];
  const data =
    update.status === "DISPATCHED"
      ? {
          status: update.status,
          deliveryPartner: update.deliveryPartner,
          deliveryReferenceId: update.deliveryReferenceId,
          deliveryTrackingUrl: update.deliveryTrackingUrl,
        }
      : { status: update.status };

  const updated = await prisma.$transaction(async (tx) => {
    const claimed = await tx.order.updateMany({
      where: { id, status: { in: allowedFrom }, deletedAt: null },
      data,
    });
    if (claimed.count === 0) {
      const exists = await tx.order.findUnique({ where: { id }, select: { id: true, deletedAt: true } });
      if (!exists || exists.deletedAt) throw new ApiError(404, "Order not found");
      throw new ApiError(409, "Invalid order status transition");
    }

    if (update.status === "DELIVERED" || update.status === "DELIVERY_ATTEMPT_FAILED") {
      await tx.orderDeliveryAttempt.create({
        data: { orderId: id, outcome: update.status, notes: update.notes },
      });
    }

    return tx.order.findUniqueOrThrow({ where: { id }, include: adminInclude });
  });
  return serialize(updated);
}
