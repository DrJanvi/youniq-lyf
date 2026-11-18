import { api, ApiError, type IdCtx } from "@/lib/http";
import { requireAdminApi } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const GET = api<IdCtx>(async (_req, { params }) => {
  await requireAdminApi();
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!product) throw new ApiError(404, "Product not found");
  return prisma.productVariant.findMany({
    where: { productId: id },
    select: { id: true, name: true, isActive: true },
    orderBy: { createdAt: "asc" },
  });
});
