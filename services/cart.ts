import "server-only";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/http";
import {
  getProductsByIds,
  STOREFRONT_PRODUCT_WHERE,
  type ProductDTO,
  type ProductVariantDTO,
} from "./product";
import { round2 } from "@/lib/pricing";

export type CartDTO = {
  items: {
    product: ProductDTO;
    variant: ProductVariantDTO | null;
    variantId: string | null;
    quantity: number;
    lineTotal: number;
  }[];
  itemCount: number;
  subtotal: number;
  discountTotal: number;
  total: number;
};

async function ensureCart(userId: string) {
  return prisma.cart.upsert({ where: { userId }, update: {}, create: { userId } });
}

export async function getCart(userId: string): Promise<CartDTO> {
  const cart = await prisma.cart.findUnique({ where: { userId }, include: { items: true } });
  const items = cart?.items ?? [];
  const products = await getProductsByIds(items.map((i) => i.productId));
  const byId = new Map(products.map((p) => [p.id, p]));
  const lines = items.flatMap((i) => {
    const product = byId.get(i.productId);
    if (!product || !product.isActive) return [];
    const variant = i.variantId
      ? product.variants.find((candidate) => candidate.id === i.variantId)
      : null;
    if ((i.variantId && !variant) || (!i.variantId && product.hasVariants)) {
      return [];
    }
    return [{
      product,
      variant: variant ?? null,
      variantId: variant?.id ?? null,
      quantity: i.quantity,
      lineTotal: round2((variant?.finalPrice ?? product.finalPrice) * i.quantity),
    }];
  });
  const subtotal = round2(lines.reduce((s, l) => s + (l.variant?.price ?? l.product.price) * l.quantity, 0));
  const total = round2(lines.reduce((s, l) => s + l.lineTotal, 0));
  return {
    items: lines,
    itemCount: lines.reduce((s, l) => s + l.quantity, 0),
    subtotal,
    discountTotal: round2(subtotal - total),
    total,
  };
}

export async function getCartCount(userId: string): Promise<number> {
  const cart = await prisma.cart.findUnique({ where: { userId }, select: { id: true } });
  if (!cart) return 0;
  const agg = await prisma.cartItem.aggregate({
    where: {
      cartId: cart.id,
      product: { is: STOREFRONT_PRODUCT_WHERE },
      OR: [
        {
          variantId: null,
          product: { is: { variants: { none: {} } } },
        },
        { variant: { is: { isActive: true } } },
      ],
    },
    _sum: { quantity: true },
  });
  return agg._sum.quantity ?? 0;
}

async function assertProduct(productId: string, variantId?: string) {
  const p = await prisma.product.findFirst({
    where: { id: productId, ...STOREFRONT_PRODUCT_WHERE },
    select: {
      stock: true,
      _count: { select: { variants: true } },
      variants: {
        where: { isActive: true },
        select: { id: true, stock: true },
      },
    },
  });
  if (!p) throw new ApiError(404, "Product not found");
  if (variantId) {
    const variant = p.variants.find(({ id }) => id === variantId);
    if (!variant) throw new ApiError(404, "Product color not found");
    return { stock: variant.stock, variantId: variant.id };
  }
  if (p._count.variants) {
    throw new ApiError(400, "Choose a color before adding this product");
  }
  return { stock: p.stock, variantId: null };
}

/** Sets the quantity (absolute). */
export async function setCartItem(
  userId: string,
  productId: string,
  quantity: number,
  variantId?: string,
) {
  const p = await assertProduct(productId, variantId);
  if (quantity > p.stock) throw new ApiError(409, `Only ${p.stock} in stock`);
  const cart = await ensureCart(userId);
  const variantKey = p.variantId ?? "";
  await prisma.cartItem.upsert({
    where: { cartId_productId_variantKey: { cartId: cart.id, productId, variantKey } },
    update: { quantity },
    create: { cartId: cart.id, productId, variantId: p.variantId, variantKey, quantity },
  });
  return getCart(userId);
}

export async function removeCartItem(
  userId: string,
  productId: string,
  variantId?: string,
) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (cart) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId, variantKey: variantId ?? "" },
    });
  }
  return getCart(userId);
}

export async function clearCart(userId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
}

/** Merges guest items (e.g. from localStorage) after login; quantities are summed and capped by stock. */
export async function mergeCart(
  userId: string,
  items: { productId: string; quantity: number; variantId?: string }[],
) {
  const cart = await ensureCart(userId);
  for (const it of items) {
    const p = await prisma.product.findFirst({
      where: { id: it.productId, ...STOREFRONT_PRODUCT_WHERE },
      select: {
        stock: true,
        _count: { select: { variants: true } },
        variants: {
          where: { isActive: true },
          select: { id: true, stock: true },
        },
      },
    });
    if (!p) continue;
    const variant = it.variantId
      ? p.variants.find(({ id }) => id === it.variantId)
      : null;
    if ((it.variantId && !variant) || (!it.variantId && p._count.variants)) continue;
    const stock = variant?.stock ?? p.stock;
    if (stock < 1) continue;
    const variantId = variant?.id ?? null;
    const variantKey = variantId ?? "";
    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_variantKey: {
          cartId: cart.id,
          productId: it.productId,
          variantKey,
        },
      },
    });
    const quantity = Math.min(stock, (existing?.quantity ?? 0) + it.quantity);
    await prisma.cartItem.upsert({
      where: {
        cartId_productId_variantKey: {
          cartId: cart.id,
          productId: it.productId,
          variantKey,
        },
      },
      update: { quantity },
      create: {
        cartId: cart.id,
        productId: it.productId,
        variantId,
        variantKey,
        quantity,
      },
    });
  }
  return getCart(userId);
}
