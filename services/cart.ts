import "server-only";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/http";
import { getProductsByIds, type ProductDTO } from "./product";
import { round2 } from "@/lib/pricing";

export type CartDTO = {
  items: { product: ProductDTO; quantity: number; lineTotal: number }[];
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
    return [{ product, quantity: i.quantity, lineTotal: round2(product.finalPrice * i.quantity) }];
  });
  const subtotal = round2(lines.reduce((s, l) => s + l.product.price * l.quantity, 0));
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
  const agg = await prisma.cartItem.aggregate({ where: { cartId: cart.id }, _sum: { quantity: true } });
  return agg._sum.quantity ?? 0;
}

async function assertProduct(productId: string) {
  const p = await prisma.product.findUnique({ where: { id: productId }, select: { isActive: true, stock: true } });
  if (!p || !p.isActive) throw new ApiError(404, "Product not found");
  return p;
}

/** Sets the quantity (absolute). */
export async function setCartItem(userId: string, productId: string, quantity: number) {
  const p = await assertProduct(productId);
  if (quantity > p.stock) throw new ApiError(409, `Only ${p.stock} in stock`);
  const cart = await ensureCart(userId);
  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity },
    create: { cartId: cart.id, productId, quantity },
  });
  return getCart(userId);
}

export async function removeCartItem(userId: string, productId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
  return getCart(userId);
}

export async function clearCart(userId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
}

/** Merges guest items (e.g. from localStorage) after login; quantities are summed and capped by stock. */
export async function mergeCart(userId: string, items: { productId: string; quantity: number }[]) {
  const cart = await ensureCart(userId);
  for (const it of items) {
    const p = await prisma.product.findUnique({ where: { id: it.productId }, select: { isActive: true, stock: true } });
    if (!p || !p.isActive || p.stock < 1) continue;
    const existing = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: it.productId } },
    });
    const quantity = Math.min(p.stock, (existing?.quantity ?? 0) + it.quantity);
    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: it.productId } },
      update: { quantity },
      create: { cartId: cart.id, productId: it.productId, quantity },
    });
  }
  return getCart(userId);
}
