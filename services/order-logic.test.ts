import assert from "node:assert/strict";
import test from "node:test";
import type { Prisma } from "@prisma/client";
import { computePricing } from "@/lib/pricing";
import { productVariantInputSchema } from "@/lib/validation";
import { ApiError } from "@/lib/http";
import {
  decrementApprovedOrderInventory,
  snapshotOrderItem,
} from "./order-logic";

function createTransaction({
  isActive = true,
  variantCount = 1,
  variantUpdateCount = 1,
  productCount = 1,
}: {
  isActive?: boolean;
  variantCount?: number;
  variantUpdateCount?: number;
  productCount?: number;
} = {}) {
  const calls: { model: string; args: unknown }[] = [];
  const tx = {
    productVariant: {
      findFirst: async (args: unknown) => {
        calls.push({ model: "variant.findFirst", args });
        return variantCount ? { isActive } : null;
      },
      updateMany: async (args: unknown) => {
        calls.push({ model: "variant.updateMany", args });
        return { count: variantUpdateCount };
      },
    },
    product: {
      updateMany: async (args: unknown) => {
        calls.push({ model: "product.updateMany", args });
        return { count: productCount };
      },
    },
  } as unknown as Prisma.TransactionClient;
  return { tx, calls };
}

const baseLine = {
  product: {
    id: "product-1",
    title: "Scent",
    finalPrice: 100,
    images: ["https://example.com/product.jpg"],
  },
  quantity: 2,
};

test("validates a color variant and accepts no price override", () => {
  const variant = productVariantInputSchema.parse({
    name: "Ruby",
    color: "#cc2244",
    images: [],
    priceOverride: null,
    stock: 3,
  });
  assert.equal(variant.priceOverride, null);
  assert.equal(variant.stock, 3);
  assert.throws(() =>
    productVariantInputSchema.parse({
      name: "Ruby",
      color: "red",
      images: [],
      stock: 3,
    }),
  );
});

test("uses a variant override as the base for product discounts", () => {
  const price = computePricing(
    { id: "product-1", categoryId: "category-1", price: 125 },
    [
      {
        id: "discount-1",
        name: "20 percent off",
        type: "PERCENT",
        value: 20,
        productId: "product-1",
        categoryId: null,
      },
    ],
  );
  assert.equal(price.price, 125);
  assert.equal(price.finalPrice, 100);
});

test("snapshots variant details and fallback gallery images", () => {
  assert.deepEqual(
    snapshotOrderItem({
      ...baseLine,
      variant: {
        id: "variant-1",
        name: "Ruby",
        color: "#cc2244",
        images: [],
        finalPrice: 110,
      },
    }),
    {
      productId: "product-1",
      variantId: "variant-1",
      title: "Scent",
      variantName: "Ruby",
      variantColor: "#cc2244",
      variantImages: ["https://example.com/product.jpg"],
      unitPrice: 110,
      quantity: 2,
    },
  );
});

test("preserves the legacy order-item shape and price without a variant", () => {
  assert.deepEqual(snapshotOrderItem({ ...baseLine, variant: null }), {
    productId: "product-1",
    variantId: null,
    title: "Scent",
    unitPrice: 100,
    quantity: 2,
  });
});

test("approval decrements both the selected variant and active aggregate stock", async () => {
  const { tx, calls } = createTransaction();
  await decrementApprovedOrderInventory(tx, [
    {
      productId: "product-1",
      title: "Scent",
      quantity: 2,
      variantId: "variant-1",
      variantName: "Ruby",
    },
  ]);
  assert.deepEqual(calls.map(({ model }) => model), [
    "variant.findFirst",
    "variant.updateMany",
    "product.updateMany",
  ]);
  assert.deepEqual(calls[1].args, {
    where: {
      id: "variant-1",
      productId: "product-1",
      stock: { gte: 2 },
    },
    data: { stock: { decrement: 2 } },
  });
  assert.deepEqual(calls[2].args, {
    where: { id: "product-1", stock: { gte: 2 } },
    data: {
      stock: { decrement: 2 },
      soldCount: { increment: 2 },
    },
  });
});

test("approval of a removed variant preserves its historical stock record", async () => {
  const { tx, calls } = createTransaction({ isActive: false });
  await decrementApprovedOrderInventory(tx, [
    {
      productId: "product-1",
      title: "Scent",
      quantity: 1,
      variantId: "variant-1",
      variantName: "Ruby",
    },
  ]);
  assert.deepEqual(calls[2].args, {
    where: { id: "product-1" },
    data: { soldCount: { increment: 1 } },
  });
});

test("approval without a variant retains the product-stock flow", async () => {
  const { tx, calls } = createTransaction();
  await decrementApprovedOrderInventory(tx, [
    {
      productId: "product-1",
      title: "Scent",
      quantity: 2,
      variantId: null,
      variantName: null,
    },
  ]);
  assert.deepEqual(calls.map(({ model }) => model), ["product.updateMany"]);
  assert.deepEqual(calls[0].args, {
    where: { id: "product-1", stock: { gte: 2 } },
    data: {
      stock: { decrement: 2 },
      soldCount: { increment: 2 },
    },
  });
});

test("approval reports insufficient stock instead of silently succeeding", async () => {
  const { tx } = createTransaction({ variantUpdateCount: 0 });
  await assert.rejects(
    decrementApprovedOrderInventory(tx, [
      {
        productId: "product-1",
        title: "Scent",
        quantity: 2,
        variantId: "variant-1",
        variantName: "Ruby",
      },
    ]),
    (error: unknown) =>
      error instanceof ApiError &&
      error.status === 409 &&
      error.message.includes("Insufficient stock"),
  );
});
