import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { WishlistButton } from "@/components/shop/WishlistButton";
import { PriceTag } from "@/components/ui/PriceTag";
import { Rating } from "@/components/ui/Rating";
import type { ProductDTO } from "@/services/product";
import Image from "next/image";
import { StorefrontLink as Link } from "@/components/layout/StorefrontLink";

const TAG_LABELS: Record<string, string> = {
  "best-selling": "Bestseller",
  "new-release": "New release",
};

type ProductCardProps = {
  product: ProductDTO;
  wished?: boolean;
  showRating?: boolean;
};

export function ProductCard({
  product,
  wished = false,
  showRating = true,
}: ProductCardProps) {
  const image = product.images[0];
  const tagSlug = product.tags[0];
  const firstTag = tagSlug
    ? (TAG_LABELS[tagSlug] ?? tagSlug.replace(/-/g, " "))
    : null;
  const lowestVariantPrice = product.variants.reduce<
    (typeof product.variants)[number] | null
  >(
    (lowest, variant) =>
      !lowest || variant.finalPrice < lowest.finalPrice ? variant : lowest,
    null,
  );
  const displayPrice = lowestVariantPrice ?? product;
  const displayDiscountPercent =
    lowestVariantPrice?.discountPercent ?? product.discountPercent;
  return (
    <article className="group border-surface-border flex min-w-0 flex-col gap-2 rounded-xl border bg-white p-2 md:rounded-2xl md:p-3">
      {image ? (
        <div className="relative mb-1 md:mb-3">
          <Link href={`/products/${product.slug}`} className="block">
            <div className="bg-surface-main relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[0.875rem]">
              <Image
                src={image}
                alt={product.title}
                width={300}
                height={300}
                unoptimized
                className="hover-zoom h-full w-full rounded-2xl object-contain"
              />

              {firstTag ? (
                <span className="text-text-primary pointer-events-none absolute top-2 right-2 rounded-full bg-white px-2 py-1 text-[9px] leading-3 font-medium tracking-wide uppercase md:top-5 md:right-5 md:px-3 md:text-[10px]">
                  {firstTag}
                </span>
              ) : null}

              {displayDiscountPercent > 0 ? (
                <span className="bg-badge-sale text-badge-sale-text pointer-events-none absolute top-2 left-2 rounded-full px-2 py-1 text-[9px] leading-3 font-medium uppercase md:top-5 md:left-5 md:px-4 md:py-2 md:text-sm">
                  {displayDiscountPercent}% OFF
                </span>
              ) : null}
            </div>
          </Link>
          <div className="pointer-events-none absolute inset-0 rounded-[0.875rem] bg-black/10 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100" />
          <div className="absolute right-3 bottom-3 hidden md:block">
            <WishlistButton productId={product.id} initial={wished} overlay />
          </div>

          <div className="pointer-events-none absolute inset-0 hidden items-center justify-center md:flex">
            <div className="pointer-events-auto">
              <AddToCartButton
                productId={product.id}
                productHref={`/products/${product.slug}`}
                requiresVariant={product.hasVariants}
                disabled={!product.inStock}
                overlay
              />
            </div>
          </div>
        </div>
      ) : null}
      <Link href={`/products/${product.slug}`}>
        <p className="text-text-muted text-[10px] font-medium md:text-xs">
          {product.category.name}
        </p>
        <h3 className="font-cormorant group-hover:text-brand-primary mt-1 line-clamp-2 min-h-10 text-sm leading-5 font-bold transition-colors duration-300 ease-out md:mt-1.5 md:min-h-14 md:text-lg md:leading-7">
          {product.title}
        </h3>
      </Link>
      {showRating ? (
        <Rating value={product.rating} count={product.reviewCount} compact />
      ) : null}
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-1 md:gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1">
          {lowestVariantPrice ? (
            <span className="text-text-muted text-[10px] font-medium">
              From
            </span>
          ) : null}
          <PriceTag
            price={displayPrice.price}
            finalPrice={displayPrice.finalPrice}
            currency={product.currency}
            compact
          />
        </div>
        <div className="hidden shrink-0 md:block">
          <AddToCartButton
            productId={product.id}
            productHref={`/products/${product.slug}`}
            requiresVariant={product.hasVariants}
            disabled={!product.inStock}
            iconOnly
          />
        </div>
      </div>
      <div className="mb-1 flex items-center gap-1 md:hidden">
        <AddToCartButton
          productId={product.id}
          productHref={`/products/${product.slug}`}
          requiresVariant={product.hasVariants}
          disabled={!product.inStock}
          overlay
          className="min-w-0 flex-1 justify-center gap-1! px-2! py-2! text-[10px]! tracking-normal! opacity-100!"
        />
        <WishlistButton
          productId={product.id}
          initial={wished}
          overlay
          className="size-8! opacity-100! shadow-none ring-1 ring-neutral-200"
        />
      </div>
    </article>
  );
}
