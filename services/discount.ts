import "server-only";
import { prisma } from "@/lib/prisma";
import { paginated, type PageParams } from "@/lib/pagination";
import { ApiError } from "@/lib/http";
import type { z } from "zod";
import type { Prisma } from "@prisma/client";
import type { ListParams } from "@/lib/admin/list-params";
import type { discountInputSchema } from "@/lib/validation";

type Input = z.infer<typeof discountInputSchema>;

const data = (i: Input) => ({
  name: i.name,
  type: i.type,
  value: i.value,
  startsAt: i.startsAt ?? null,
  endsAt: i.endsAt ?? null,
  isActive: i.isActive,
  productId: i.productId || null,
  categoryId: i.categoryId || null,
  variantScope: i.variantScope,
});

const serialize = <T extends { value: unknown }>(d: T) => ({ ...d, value: Number(d.value) });

async function assertVariantTargets(tx: Prisma.TransactionClient, input: Input) {
  if (input.variantScope !== "SELECTED") return;
  const productId = input.productId;
  if (!productId) throw new ApiError(400, "Selected variants require a product discount");
  const variants = await tx.productVariant.findMany({
    where: { id: { in: input.variantIds }, productId },
    select: { id: true },
  });
  if (variants.length !== input.variantIds.length) {
    throw new ApiError(400, "Selected variants must belong to the selected product");
  }
}

export async function listDiscounts(page: PageParams, p?: ListParams) {
  const f = p?.filters ?? {};
  const now = new Date();
  const where: Prisma.DiscountWhereInput = {
    ...(f.deleted === "deleted"
      ? { deletedAt: { not: null } }
      : f.deleted === "active"
        ? { deletedAt: null }
        : {}),
    ...(p?.q ? { name: { contains: p.q } } : {}),
    ...(f.type ? { type: f.type as "PERCENT" | "FIXED" } : {}),
    ...(f.status === "active" ? { isActive: true } : f.status === "inactive" ? { isActive: false } : {}),
    ...(f.status === "expired" ? { endsAt: { lt: now } } : {}),
  };
  const dir = p?.dir ?? "desc";
  const orderBy: Prisma.DiscountOrderByWithRelationInput = { [p?.sort ?? "createdAt"]: dir };
  const [rows, total] = await Promise.all([
    prisma.discount.findMany({
      where,
      orderBy: [orderBy, { id: "asc" }],
      skip: page.skip,
      take: page.limit,
      include: { product: { select: { title: true } }, category: { select: { name: true } } },
    }),
    prisma.discount.count({ where }),
  ]);
  return paginated(rows.map(serialize), total, page);
}

export async function getDiscount(id: string) {
  const row = await prisma.discount.findUnique({
    where: { id },
    include: { variantTargets: { select: { variantId: true } } },
  });
  return row
    ? { ...serialize(row), variantIds: row.variantTargets.map(({ variantId }) => variantId) }
    : null;
}

export async function createDiscount(input: Input) {
  const row = await prisma.$transaction(async (tx) => {
    await assertVariantTargets(tx, input);
    const discount = await tx.discount.create({ data: data(input) });
    if (input.variantIds.length) {
      await tx.discountVariant.createMany({
        data: input.variantIds.map((variantId) => ({ discountId: discount.id, variantId })),
      });
    }
    return discount;
  });
  return serialize(row);
}

export async function updateDiscount(id: string, input: Input) {
  const row = await prisma.$transaction(async (tx) => {
    await assertVariantTargets(tx, input);
    const existing = await tx.discount.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return null;
    const discount = await tx.discount.update({ where: { id }, data: data(input) });
    await tx.discountVariant.deleteMany({ where: { discountId: id } });
    if (input.variantIds.length) {
      await tx.discountVariant.createMany({
        data: input.variantIds.map((variantId) => ({ discountId: id, variantId })),
      });
    }
    return discount;
  });
  if (!row) throw new ApiError(404, "Discount not found");
  return serialize(row);
}

export async function deleteDiscount(id: string) {
  const deleted = await prisma.discount.updateMany({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  if (!deleted.count) throw new ApiError(404, "Discount not found");
}

export async function restoreDiscount(id: string) {
  const restored = await prisma.discount.updateMany({
    where: { id, deletedAt: { not: null } },
    data: { deletedAt: null },
  });
  if (!restored.count) throw new ApiError(404, "Deleted discount not found");
  return { restored: true };
}
