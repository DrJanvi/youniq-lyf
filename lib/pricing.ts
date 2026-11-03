export type DiscountRule = {
  id: string;
  name: string;
  type: "PERCENT" | "FIXED";
  value: number;
  productId: string | null;
  categoryId: string | null;
};

export type Pricing = {
  price: number;
  finalPrice: number;
  discountAmount: number;
  discountPercent: number;
  discountName: string | null;
};

export const round2 = (n: number) => Math.round(n * 100) / 100;

export function applyRule(price: number, rule: DiscountRule): number {
  const off = rule.type === "PERCENT" ? (price * Math.min(rule.value, 100)) / 100 : rule.value;
  return round2(Math.min(price, Math.max(0, off)));
}

/** Picks the rule giving the biggest saving among those that target the product. */
export function computePricing(
  product: { id: string; categoryId: string; price: number },
  rules: DiscountRule[],
): Pricing {
  let best = 0;
  let bestName: string | null = null;
  for (const r of rules) {
    const matches =
      r.productId === product.id ||
      (r.productId === null && r.categoryId === product.categoryId) ||
      (r.productId === null && r.categoryId === null);
    if (!matches) continue;
    const off = applyRule(product.price, r);
    if (off > best) {
      best = off;
      bestName = r.name;
    }
  }
  const finalPrice = round2(product.price - best);
  return {
    price: product.price,
    finalPrice,
    discountAmount: best,
    discountPercent: product.price > 0 ? Math.round((best / product.price) * 100) : 0,
    discountName: bestName,
  };
}
