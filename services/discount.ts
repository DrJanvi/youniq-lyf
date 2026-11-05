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
});

const serialize = <T extends { value: unknown }>(d: T) => ({ ...d, value: Number(d.value) });

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
  const row = await prisma.discount.findUnique({ where: { id } });
  return row ? serialize(row) : null;
}

export async function createDiscount(input: Input) {
  return serialize(await prisma.discount.create({ data: data(input) }));
}

export async function updateDiscount(id: string, input: Input) {
  const row = await prisma.discount.update({ where: { id }, data: data(input) }).catch(() => null);
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
