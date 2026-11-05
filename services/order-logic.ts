import { ApiError } from "@/lib/http";
import type { Prisma } from "@prisma/client";

type CartOrderLine = {
  product: {
    id: string;
    title: string;
    finalPrice: number;
    images: string[];
  };
  variant: {
    id: string;
    name: string;
    color: string;
    images: string[];
    finalPrice: number;
  } | null;
  quantity: number;
};

export function snapshotOrderItem(line: CartOrderLine) {
  return {
    productId: line.product.id,
    variantId: line.variant?.id ?? null,
    title: line.product.title,
    ...(line.variant
      ? {
          variantName: line.variant.name,
          variantColor: line.variant.color,
          variantImages: line.variant.images.length
            ? line.variant.images
            : line.product.images,
        }
      : {}),
    unitPrice: line.variant?.finalPrice ?? line.product.finalPrice,
    quantity: line.quantity,
  };
}

type OrderInventoryItem = {
  productId: string;
  title: string;
  quantity: number;
  variantId: string | null;
  variantName: string | null;
};

export async function decrementApprovedOrderInventory(
  tx: Prisma.TransactionClient,
  items: OrderInventoryItem[],
) {
  for (const item of items) {
    if (item.variantId) {
      const variant = await tx.productVariant.findFirst({
        where: { id: item.variantId, productId: item.productId },
        select: { isActive: true },
      });
      if (!variant) {
        throw new ApiError(
          409,
          `The selected color for "${item.title}" is no longer available`,
        );
      }

      const variantUpdate = await tx.productVariant.updateMany({
        where: {
          id: item.variantId,
          productId: item.productId,
          stock: { gte: item.quantity },
        },
        data: { stock: { decrement: item.quantity } },
      });
      if (!variantUpdate.count) {
        throw new ApiError(
          409,
          `Insufficient stock for "${item.title}" (${item.variantName ?? "selected color"})`,
        );
      }

      const productUpdate = await tx.product.updateMany({
        where: {
          id: item.productId,
          ...(variant.isActive ? { stock: { gte: item.quantity } } : {}),
        },
        data: {
          ...(variant.isActive ? { stock: { decrement: item.quantity } } : {}),
          soldCount: { increment: item.quantity },
        },
      });
      if (!productUpdate.count) {
        throw new ApiError(409, `Insufficient aggregate stock for "${item.title}"`);
      }
      continue;
    }

    if (item.variantName) {
      throw new ApiError(
        409,
        `The selected color for "${item.title}" can no longer be fulfilled`,
      );
    }
    const productUpdate = await tx.product.updateMany({
      where: { id: item.productId, stock: { gte: item.quantity } },
      data: {
        stock: { decrement: item.quantity },
        soldCount: { increment: item.quantity },
      },
    });
    if (!productUpdate.count) {
      throw new ApiError(409, `Insufficient stock for "${item.title}"`);
    }
  }
}
