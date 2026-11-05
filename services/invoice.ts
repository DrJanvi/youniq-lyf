import { ApiError } from "@/lib/http";
import { formatInvoiceNumber } from "@/lib/invoice/number";
import { generateInvoicePdf, type InvoicePdfData } from "@/lib/invoice/pdf";
import { getMailer } from "@/lib/mail";
import { round2 } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import "server-only";

const invoiceWithOrder = {
  order: { include: { items: true, user: { select: { email: true } } } },
} satisfies Prisma.InvoiceInclude;

type InvoiceRecord = Prisma.InvoiceGetPayload<{
  include: typeof invoiceWithOrder;
}>;

const staleSendingThresholdMs = 15 * 60 * 1000;

function toPdfData(
  invoice: InvoiceRecord,
  recipientEmail = invoice.recipientEmail,
): InvoicePdfData {
  const items = invoice.order.items.map((item) => ({
    title: item.variantName ? `${item.title} (${item.variantName})` : item.title,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
  }));
  const lineSubtotal = round2(
    items.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
  );

  return {
    sequence: invoice.sequence,
    issuedAt: invoice.issuedAt,
    currency: invoice.order.currency,
    recipientEmail,
    shippingName: invoice.order.shippingName,
    shippingPhone: invoice.order.shippingPhone,
    shippingAddress: invoice.order.shippingAddress,
    lineSubtotal,
    couponCode: invoice.order.couponCode,
    couponDiscount: Number(invoice.order.couponDiscount),
    total: Number(invoice.order.total),
    items,
  };
}

async function loadInvoice(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: invoiceWithOrder,
  });
  if (!invoice) throw new ApiError(404, "Invoice not found");
  return invoice;
}

export async function getInvoicePdfForUser(orderId: string, userId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { orderId, order: { userId, deletedAt: null } },
    include: invoiceWithOrder,
  });
  if (!invoice) throw new ApiError(404, "Invoice not found");

  const data = toPdfData(
    invoice,
    invoice.recipientEmail ?? invoice.order.user.email,
  );
  return {
    pdf: await generateInvoicePdf(data),
    filename: `${formatInvoiceNumber(invoice.sequence)}.pdf`,
  };
}

async function deliverInvoice(invoiceId: string) {
  const now = new Date();
  const staleBefore = new Date(now.getTime() - staleSendingThresholdMs);
  const claim = await prisma.invoice.updateMany({
    where: {
      id: invoiceId,
      OR: [
        { emailStatus: { in: ["PENDING", "FAILED"] } },
        { emailStatus: "SENDING", lastAttemptAt: null },
        { emailStatus: "SENDING", lastAttemptAt: { lt: staleBefore } },
      ],
    },
    data: {
      emailStatus: "SENDING",
      emailAttempts: { increment: 1 },
      lastAttemptAt: now,
      lastError: null,
    },
  });

  if (!claim.count) {
    const current = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { emailStatus: true },
    });
    if (!current) throw new ApiError(404, "Invoice not found");
    if (current.emailStatus === "SENT") return { emailStatus: "SENT" as const };
    throw new ApiError(409, "Invoice email delivery is already in progress");
  }

  try {
    const invoice = await loadInvoice(invoiceId);
    const recipientEmail = invoice.recipientEmail ?? invoice.order.user.email;
    if (!recipientEmail)
      throw new Error("Customer account has no email address");
    if (!invoice.recipientEmail) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { recipientEmail },
      });
    }

    const data = toPdfData(invoice, recipientEmail);
    const pdf = await generateInvoicePdf(data);
    const invoiceNumber = formatInvoiceNumber(invoice.sequence);
    await getMailer().send(
      recipientEmail,
      `Your Youniqlyf invoice ${invoiceNumber}`,
      `Dear ${invoice.order.shippingName || "Customer"},\n\nPlease find your digital invoice ${invoiceNumber} attached.\n\nBuabed Youniqlyf Perfumes Industry FZCO`,
      [{ filename: `${invoiceNumber}.pdf`, content: pdf }],
    );
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { emailStatus: "SENT", sentAt: new Date(), lastError: null },
    });
    return { emailStatus: "SENT" as const };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown invoice delivery error";
    try {
      const failed = await prisma.invoice.updateMany({
        where: { id: invoiceId, emailStatus: "SENDING" },
        data: { emailStatus: "FAILED", lastError: message },
      });
      if (!failed.count) {
        console.error(
          `Invoice ${invoiceId} delivery failed, but its status could not be updated`,
        );
      }
    } catch (statusError) {
      console.error(
        `Could not record delivery failure for invoice ${invoiceId}`,
        statusError,
      );
    }
    console.error(`Invoice ${invoiceId} delivery failed: ${message}`, error);
    return { emailStatus: "FAILED" as const, error: message };
  }
}

export async function sendInvoiceForOrder(orderId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { orderId },
    select: { id: true },
  });
  if (!invoice) throw new ApiError(404, "Invoice not found for order");
  return deliverInvoice(invoice.id);
}

export async function retryInvoiceEmail(orderId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { orderId },
    select: { id: true },
  });
  if (!invoice) throw new ApiError(404, "Invoice not found for order");
  return deliverInvoice(invoice.id);
}
