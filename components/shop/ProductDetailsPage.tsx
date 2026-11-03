import { ProductAboutAccordion } from "@/components/shop/ProductAboutAccordion";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ProductImageGallery } from "@/components/shop/ProductImageGallery";
import { ProductPurchaseActions } from "@/components/shop/ProductPurchaseActions";
import { ProductReviews } from "@/components/shop/ProductReviews";
import { WishlistButton } from "@/components/shop/WishlistButton";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PriceTag } from "@/components/ui/PriceTag";
import { Rating } from "@/components/ui/Rating";
import { Section } from "@/components/ui/Section";
import type { ProductDTO } from "@/services/product";
import type { listApprovedReviews } from "@/services/review";
import { RotateCcw, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";

type ReviewPageData = Awaited<ReturnType<typeof listApprovedReviews>>;

export function ProductDetailsPage({
  product,
  reviews,
  reviewDistribution,
  wished,
  recommendations,
  userName,
}: {
  product: ProductDTO;
  reviews: ReviewPageData;
  reviewDistribution: Record<number, number>;
  wished: boolean;
  recommendations: ProductDTO[];
  userName: string;
}) {
  const path = `/products/${product.slug}`;

  return (
    <article className="flex flex-col">
      <Breadcrumbs
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Products", href: "/products" },
          {
            name: product.category.name,
            href: `/category/${product.category.slug}`,
          },
          { name: product.title, href: path },
        ]}
      />

      <Section className="pt-3 pb-14 md:pt-5 md:pb-20">
        <div className="grid items-start gap-8 md:grid-cols-2 md:gap-10 lg:gap-12">
          <ProductImageGallery
            images={product.images}
            title={product.title}
            bestseller={product.tags.includes("best-selling")}
          />

          <div className="flex flex-col gap-5 md:sticky md:top-24 md:self-start">
            <div className="flex flex-col gap-3 border-b border-[#eee7e3] pb-5">
              <p className="text-xs font-medium tracking-[0.12em] text-[#9b9591] uppercase">
                {product.category.name}
              </p>
              <h1 className="font-cormorant text-[clamp(2rem,4vw,3rem)] leading-[1.08] font-medium tracking-[0.06em] text-[#573124] uppercase">
                {product.title}
              </h1>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                  href="#reviews"
                  aria-label={`${product.rating.toFixed(1)} out of 5, ${product.reviewCount} reviews`}
                  className="flex items-center gap-2"
                >
                  <Rating value={product.rating} />
                  <span className="text-sm font-medium text-[#292320]">
                    {product.rating ? product.rating.toFixed(1) : "New"}
                  </span>
                  <span className="text-sm text-[#9b9591] underline">
                    ({product.reviewCount}{" "}
                    {product.reviewCount === 1 ? "review" : "reviews"})
                  </span>
                </Link>
                <WishlistButton
                  productId={product.id}
                  initial={wished}
                  iconOnly
                  className="inline-flex size-10 items-center justify-center rounded-full border border-[#eee7e3] bg-white px-0! py-0! text-[#514944] hover:bg-[#faf7f5] [&_svg]:size-5"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="[&_del]:text-sm [&_span]:text-xl">
                <PriceTag
                  price={product.price}
                  finalPrice={product.finalPrice}
                  currency={product.currency}
                />
              </span>
              {product.discountPercent > 0 ? (
                <span className="rounded-md bg-[#f7efed] px-3 py-1.5 text-[10px] font-semibold tracking-[0.08em] text-[#8e5148] uppercase">
                  Save {product.discountPercent}%
                </span>
              ) : null}
            </div>

            <p className="text-sm leading-6 text-[#766d69]">
              {product.description}
            </p>

            <p className="flex items-center gap-2 text-sm">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-[#9b9591]"
              />
              <span className="text-[#766d69]">
                {product.inStock
                  ? "In stock - ready to dispatch"
                  : "Currently out of stock"}
              </span>
            </p>

            {product.inStock ? (
              <ProductPurchaseActions
                productId={product.id}
                stock={product.stock}
              />
            ) : null}

            <div className="mt-1 grid grid-cols-3 gap-3 border-t border-[#eee7e3] pt-5">
              <div className="flex items-start gap-2 text-[#9a6f65]">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0"
                />
                <p className="text-[11px] leading-4 text-[#292320]">
                  <span className="block font-semibold">Secure checkout</span>
                  <span className="text-[#8c817b]">Encrypted payments</span>
                </p>
              </div>
              <div className="flex items-start gap-2 border-x border-[#eee7e3] px-2 text-[#9a6f65]">
                <RotateCcw
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0"
                />
                <p className="text-[11px] leading-4 text-[#292320]">
                  <span className="block font-semibold">Easy returns</span>
                  <span className="text-[#8c817b]">Within 14 days</span>
                </p>
              </div>
              <div className="flex items-start gap-2 text-[#9a6f65]">
                <Truck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <p className="text-[11px] leading-4 text-[#292320]">
                  <span className="block font-semibold">Free delivery</span>
                  <span className="text-[#8c817b]">Orders over AED 250</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {product.aboutPoints.length || product.aboutIntro ? (
        <Section
          as="section"
          aria-labelledby="about-product"
          className="bg-[#fcfaf9] py-14 md:py-20"
        >
          <div className="mx-auto max-w-5xl">
            <h2
              id="about-product"
              className="font-cormorant text-center text-3xl font-semibold tracking-[0.06em] text-[#573124] uppercase md:text-5xl"
            >
              About this product
            </h2>
            {product.aboutIntro ? (
              <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-7 whitespace-pre-line text-[#766d69]">
                {product.aboutIntro}
              </p>
            ) : null}
            {product.aboutPoints.length ? (
              <div className="mt-10">
                <ProductAboutAccordion items={product.aboutPoints} />
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}

      {recommendations.length ? (
        <Section
          as="section"
          aria-labelledby="recommendations-heading"
          className="py-14 md:py-20"
        >
          <h2
            id="recommendations-heading"
            className="font-cormorant mb-8 text-center text-3xl font-semibold tracking-[0.06em] text-[#573124] uppercase md:mb-10 md:text-4xl"
          >
            You may also like
          </h2>
          <ProductGrid
            products={recommendations}
            showRating
            className="lg:grid-cols-4"
          />
        </Section>
      ) : null}

      <Section
        as="section"
        aria-labelledby="reviews"
        className="border-t border-[#eee7e3] bg-[#fcfaf9] py-14 md:py-20"
      >
        <h2
          id="reviews"
          className="font-cormorant mb-10 text-center text-3xl font-semibold text-[#573124] md:text-5xl"
        >
          Customer Reviews
        </h2>
        <ProductReviews
          productId={product.id}
          userName={userName}
          average={product.rating}
          total={product.reviewCount}
          distribution={reviewDistribution}
          reviews={reviews.data.map((r) => ({
            id: r.id,
            authorName: r.authorName,
            rating: r.rating,
            title: r.title,
            body: r.body,
            createdAt: r.createdAt,
          }))}
        />
      </Section>
    </article>
  );
}
