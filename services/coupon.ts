import "server-only";
import { randomBytes } from "node:crypto";
import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import { ApiError } from "@/lib/http";
import type { ListParams } from "@/lib/admin/list-params";
import { paginated, type PageParams } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { round2 } from "@/lib/pricing";
import type { couponInputSchema } from "@/lib/validation";
import { getCart } from "./cart";

type CouponInput = z.infer<typeof couponInputSchema>;

const serialize = <T extends { value: unknown; minimumSubtotal: unknown; maxDiscount: unknown }>(coupon: T) => ({
  ...coupon,
  value: Number(coupon.value),
  minimumSubtotal: coupon.minimumSubtotal === null ? null : Number(coupon.minimumSubtotal),
  maxDiscount: coupon.maxDiscount === null ? null : Number(coupon.maxDiscount),
});

const couponData = (input: CouponInput) => ({
  code: input.code.trim().toUpperCase(),
  type: input.type,
  value: input.value,
  minimumSubtotal: input.minimumSubtotal ?? null,
  maxDiscount: input.maxDiscount ?? null,
  startsAt: input.startsAt ?? null,
  endsAt: input.endsAt ?? null,
  isActive: input.isActive,
});

export async function listCoupons(page: PageParams, p?: ListParams) {
  const filters = p?.filters ?? {};
  const now = new Date();
  const where: Prisma.CouponWhereInput = {
    ...(p?.q ? { code: { contains: p.q.trim().toUpperCase() } } : {}),
    ...(filters.type ? { type: filters.type as "PERCENT" | "FIXED" } : {}),
    ...(filters.status === "active" ? { isActive: true } : filters.status === "inactive" ? { isActive: false } : {}),
    ...(filters.status === "expired" ? { endsAt: { lt: now } } : {}),
  };
  const orderBy: Prisma.CouponOrderByWithRelationInput = { [p?.sort ?? "createdAt"]: p?.dir ?? "desc" };
  const [rows, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      orderBy: [orderBy, { id: "asc" }],
      skip: page.skip,
      take: page.limit,
    }),
    prisma.coupon.count({ where }),
  ]);
  return paginated(rows.map(serialize), total, page);
}

export async function getCoupon(id: string) {
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  return coupon ? serialize(coupon) : null;
}

export async function createCoupon(input: CouponInput) {
  return serialize(await prisma.coupon.create({ data: couponData(input) }));
}

export async function updateCoupon(id: string, input: CouponInput) {
  const existing = await prisma.coupon.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new ApiError(404, "Coupon not found");
  return serialize(await prisma.coupon.update({ where: { id }, data: couponData(input) }));
}

export async function deleteCoupon(id: string) {
  const deleted = await prisma.coupon.deleteMany({ where: { id } });
  if (deleted.count === 0) throw new ApiError(404, "Coupon not found");
}

export async function generateCouponCode() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = `BANAFA-${randomBytes(5).toString("hex").toUpperCase()}`;
    const existing = await prisma.coupon.findUnique({ where: { code }, select: { id: true } });
    if (!existing) return code;
  }
  throw new ApiError(503, "Could not generate a unique coupon code. Please try again.");
}

export async function quoteCoupon(code: string, subtotal: number) {
  const normalizedCode = code.trim().toUpperCase();
  const coupon = await prisma.coupon.findUnique({ where: { code: normalizedCode } });
  if (!coupon || !coupon.isActive) throw new ApiError(400, "This coupon code is invalid or inactive");

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) throw new ApiError(400, "This coupon is not active yet");
  if (coupon.endsAt && coupon.endsAt <= now) throw new ApiError(400, "This coupon has expired");

  const eligibleSubtotal = round2(subtotal);
  if (eligibleSubtotal <= 0) throw new ApiError(400, "A coupon cannot be applied to a zero-value order");
  const minimumSubtotal = coupon.minimumSubtotal === null ? null : Number(coupon.minimumSubtotal);
  if (minimumSubtotal !== null && eligibleSubtotal < minimumSubtotal) {
    throw new ApiError(400, `This coupon requires a minimum order of ${minimumSubtotal.toFixed(2)}`);
  }

  let discountAmount =
    coupon.type === "PERCENT"
      ? round2((eligibleSubtotal * Number(coupon.value)) / 100)
      : Number(coupon.value);
  if (coupon.maxDiscount !== null) discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
  discountAmount = round2(Math.min(eligibleSubtotal, discountAmount));
  if (discountAmount <= 0) throw new ApiError(400, "This coupon does not reduce the order total");

  return {
    couponId: coupon.id,
    code: coupon.code,
    discountAmount,
    total: round2(eligibleSubtotal - discountAmount),
  };
}

export async function previewCoupon(userId: string, code: string) {
  const cart = await getCart(userId);
  if (cart.items.length === 0) throw new ApiError(400, "Cart is empty");
  const { code: normalizedCode, discountAmount, total } = await quoteCoupon(code, cart.total);
  return { code: normalizedCode, discountAmount, total };
}
