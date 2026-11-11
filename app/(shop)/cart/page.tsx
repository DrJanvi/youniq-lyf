import { CartItemRow } from "@/components/shop/CartItemRow";
import {
  CartClearButton,
  CartFooterActions,
} from "@/components/shop/CartPageActions";
import { CartOrderSummary } from "@/components/shop/CartOrderSummary";
import { PageHeader } from "@/components/shop/PageHeader";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Section } from "@/components/ui/Section";
import { requireUserPage } from "@/lib/auth/session";
import { buildMetadata } from "@/lib/seo";
import { getCart } from "@/services/cart";
import { listByTag } from "@/services/product";
import type { Metadata } from "next";
import Link from "next/link";

export const instant = false;

export const metadata: Metadata = buildMetadata({
  title: "Your cart",
  path: "/cart",
  noindex: true,
});

export default async function CartPage() {
  const user = await requireUserPage("/cart");
  const [cart, bestSellers, newReleases] = await Promise.all([
    getCart(user.id),
    listByTag("best-selling", 8),
    listByTag("new-release", 8),
  ]);
  const cartProductIds = new Set(cart.items.map((item) => item.product.id));
  const recommendations = [...bestSellers, ...newReleases]
    .filter((product, index, products) => {
      return (
        !cartProductIds.has(product.id) &&
        products.findIndex((candidate) => candidate.id === product.id) === index
      );
    })
    .slice(0, 4);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Your cart"
        description="Your Youniq picks, gathered in one place and ready for your next look."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Cart", href: "/cart" },
        ]}
      />

      <Section as="main" className="mx-auto w-full px-4 pb-4 sm:px-6 lg:px-8">
        {cart.items.length === 0 ? (
          <div className="min-h-49 pt-9 text-center">
            <div role="status">
              <h2 className="font-cormorant text-[30px] leading-6 font-semibold text-text-primary">
                Your cart is currently empty
              </h2>
              <p className="mt-3 text-[12px] leading-4 text-text-muted">
                Explore our collections and find a new ritual.
              </p>
              <Link
                href="/products"
                className="mt-7 inline-flex h-12 min-w-41 items-center justify-center rounded-full border border-brand-primary/30 px-4 text-[14px] font-medium tracking-wider text-brand-primary-dark uppercase transition-colors hover:bg-surface-card"
              >
                Return to shop
              </Link>
            </div>
          </div>
        ) : (
          <div className="mx-auto mt-9 lg:grid lg:grid-cols-[minmax(0,1.9fr)_minmax(290px,1fr)] lg:gap-17">
            <section aria-label="Cart items" className="min-w-0">
              <div className="mb-6.25 flex min-h-9 items-start justify-between gap-4">
                <div>
                  <p className="text-[14px] leading-5 font-medium text-text-primary">
                    <span className="text-status-error">{cart.items.length}</span>{" "}
                    {cart.items.length === 1 ? "saved item" : "saved items"}
                  </p>
                  <p className="mt-1 text-[12px] leading-4 text-text-muted">
                    Complimentary delivery on every order
                  </p>
                </div>
                <CartClearButton />
              </div>

              <div className="hidden grid-cols-[minmax(0,1fr)_116px_128px] gap-8 bg-surface-card px-5 py-2 text-[14px] font-semibold tracking-[0.08em] text-text-primary uppercase sm:grid">
                <span className="font-cormorant text-center">Product</span>
                <span className="font-cormorant text-center">Quantity</span>
                <span className="font-cormorant min-w-20 text-right">
                  Total
                </span>
              </div>
              <ul>
                {cart.items.map((item) => (
                  <CartItemRow
                    key={`${item.product.id}:${item.variantId ?? "base"}`}
                    productId={item.product.id}
                    variantId={item.variantId}
                    variantName={item.variant?.name ?? null}
                    variantColor={item.variant?.color ?? null}
                    slug={item.product.slug}
                    title={item.product.title}
                    image={item.variant?.images[0] ?? item.product.images[0]}
                    category={item.product.category.name}
                    price={item.variant?.price ?? item.product.price}
                    finalPrice={item.variant?.finalPrice ?? item.product.finalPrice}
                    currency={item.product.currency}
                    quantity={item.quantity}
                    stock={item.variant?.stock ?? item.product.stock}
                    lineTotal={item.lineTotal}
                  />
                ))}
              </ul>
              <CartFooterActions
                productIds={[...new Set(cart.items.map((item) => item.product.id))]}
              />
            </section>

            <CartOrderSummary
              key={cart.items.map((item) => `${item.product.id}:${item.variantId ?? "base"}:${item.quantity}:${item.variant?.finalPrice ?? item.product.finalPrice}`).join("|")}
              cart={cart}
            />
          </div>
        )}

        {cart.items.length > 0 && recommendations.length > 0 ? (
          <section
            className="mt-16 md:mt-24"
            aria-labelledby="recommendations-heading"
          >
            <h2
              id="recommendations-heading"
              className="font-cormorant mb-8 text-center text-[clamp(2.5rem,3vw,4rem)] font-medium tracking-[0.08em] text-text-primary uppercase md:mb-10"
            >
              You may also like
            </h2>
            <ProductGrid
              products={recommendations}
              showRating
              className="lg:grid-cols-4"
            />
            <div className="mt-8 flex justify-center">
              <Link
                href="/products"
                className="bg-brand-primary-dark hover:bg-brand-primary-hover text-white inline-flex h-11.5 min-w-26.5 items-center justify-center gap-2 rounded-full px-5 text-[16px] tracking-[0.06em] uppercase transition-colors"
              >
                View more
                <span aria-hidden="true" className="text-sm leading-none">
                  →
                </span>
              </Link>
            </div>
          </section>
        ) : null}
      </Section>
    </div>
  );
}
