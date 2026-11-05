"use client";

import { ProductImageGallery } from "@/components/shop/ProductImageGallery";
import { ProductPurchaseActions } from "@/components/shop/ProductPurchaseActions";
import { WishlistButton } from "@/components/shop/WishlistButton";
import { PriceTag } from "@/components/ui/PriceTag";
import { Rating } from "@/components/ui/Rating";
import type { ProductDTO } from "@/services/product";
import { RotateCcw, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function ProductDetailsPanel({
  product,
  wished,
}: {
  product: ProductDTO;
  wished: boolean;
}) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ?? null;
  const lowestVariant = product.variants.reduce<
    (typeof product.variants)[number] | null
  >(
    (lowest, variant) =>
      !lowest || variant.finalPrice < lowest.finalPrice ? variant : lowest,
    null,
  );
  const displayPrice = selectedVariant ?? lowestVariant ?? product;
  const galleryImages =
    selectedVariant?.images.length ? selectedVariant.images : product.images;
  const selectedStock = product.hasVariants
    ? (selectedVariant?.stock ?? 0)
    : product.stock;
  const canPurchase = product.hasVariants
    ? Boolean(selectedVariant && selectedVariant.stock > 0)
    : product.stock > 0;

  return (
    <div className="grid items-start gap-8 md:grid-cols-2 md:gap-10 lg:gap-12">
      <ProductImageGallery
        key={selectedVariantId ?? "product"}
        images={galleryImages}
        title={product.title}
        bestseller={product.tags.includes("best-selling")}
      />

      <div className="flex flex-col gap-5 md:sticky md:top-24 md:self-start">
        <div className="flex flex-col gap-3 border-b border-surface-border pb-5">
          <p className="text-xs font-medium tracking-[0.12em] text-text-muted uppercase">
            {product.category.name}
          </p>
          <h1 className="font-cormorant text-[clamp(2rem,4vw,3rem)] leading-[1.08] font-medium tracking-[0.06em] text-text-primary uppercase">
            {product.title}
          </h1>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="#reviews"
              aria-label={`${product.rating.toFixed(1)} out of 5, ${product.reviewCount} reviews`}
              className="flex items-center gap-2"
            >
              <Rating value={product.rating} />
              <span className="text-sm font-medium text-text-primary">
                {product.rating ? product.rating.toFixed(1) : "New"}
              </span>
              <span className="text-sm text-text-muted underline">
                ({product.reviewCount}{" "}
                {product.reviewCount === 1 ? "review" : "reviews"})
              </span>
            </Link>
            <WishlistButton
              productId={product.id}
              initial={wished}
              iconOnly
              className="inline-flex size-10 items-center justify-center rounded-full border border-surface-border bg-white px-0! py-0! text-text-primary hover:bg-surface-card [&_svg]:size-5"
            />
          </div>
        </div>

        {product.hasVariants ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-text-primary">
              Color
            </span>
            <div role="group" aria-label="Choose a color" className="flex gap-3">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  aria-label={`${variant.name}${variant.stock < 1 ? ", out of stock" : ""}`}
                  aria-pressed={selectedVariantId === variant.id}
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={`size-9 rounded-full border-2 shadow-sm transition ${
                    selectedVariantId === variant.id
                      ? "border-brand-primary ring-2 ring-brand-primary/25 ring-offset-2"
                      : "border-white ring-1 ring-surface-border hover:ring-brand-primary"
                  }`}
                  style={{ backgroundColor: variant.color }}
                />
              ))}
            </div>
            <p aria-live="polite" className="text-xs text-text-muted">
              {!product.variants.length
                ? "No colors are currently available"
                : selectedVariant
                  ? `Color: ${selectedVariant.name}`
                  : "Choose a color to see availability"}
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <span className="[&_del]:text-sm [&_span]:text-xl">
            {!selectedVariant && lowestVariant ? (
              <span className="mr-2 text-sm text-text-muted">From</span>
            ) : null}
            <PriceTag
              price={displayPrice.price}
              finalPrice={displayPrice.finalPrice}
              currency={product.currency}
            />
          </span>
          {displayPrice.discountPercent > 0 ? (
            <span className="rounded-md bg-badge-sale px-3 py-1.5 text-[10px] font-semibold tracking-[0.08em] text-status-error uppercase">
              Save {displayPrice.discountPercent}%
            </span>
          ) : null}
        </div>

        <p className="text-sm leading-6 text-text-muted">
          {product.description}
        </p>

        <p className="flex items-center gap-2 text-sm">
          <span
            aria-hidden="true"
            className={`size-2 rounded-full ${
              canPurchase ? "bg-status-success" : "bg-surface-card"
            }`}
          />
          <span className="text-text-muted">
            {product.hasVariants && !product.variants.length
              ? "No colors currently available"
              : product.hasVariants && !selectedVariant
                ? "Choose a color to check stock"
              : selectedStock > 0
                ? `${selectedStock} in stock - ready to dispatch`
                : "Currently out of stock"}
          </span>
        </p>

        {canPurchase ? (
          <ProductPurchaseActions
            key={selectedVariant?.id ?? "product"}
            productId={product.id}
            variantId={selectedVariant?.id}
            stock={selectedStock}
          />
        ) : null}

        <div className="mt-1 grid grid-cols-3 gap-3 border-t border-surface-border pt-5">
          <div className="flex items-start gap-2 text-brand-primary-dark">
            <ShieldCheck
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
            />
            <p className="text-[11px] leading-4 text-text-primary">
              <span className="block font-semibold">Secure checkout</span>
              <span className="text-text-muted">Encrypted payments</span>
            </p>
          </div>
          <div className="flex items-start gap-2 border-x border-surface-border px-2 text-brand-primary-dark">
            <RotateCcw
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
            />
            <p className="text-[11px] leading-4 text-text-primary">
              <span className="block font-semibold">Easy returns</span>
              <span className="text-text-muted">Within 14 days</span>
            </p>
          </div>
          <div className="flex items-start gap-2 text-brand-primary-dark">
            <Truck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p className="text-[11px] leading-4 text-text-primary">
              <span className="block font-semibold">Free delivery</span>
              <span className="text-text-muted">Orders over AED 250</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
