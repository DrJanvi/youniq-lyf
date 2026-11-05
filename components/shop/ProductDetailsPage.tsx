import { ProductAboutAccordion } from "@/components/shop/ProductAboutAccordion";
import { ProductDetailsPanel } from "@/components/shop/ProductDetailsPanel";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ProductReviews } from "@/components/shop/ProductReviews";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Section } from "@/components/ui/Section";
import type { ProductDTO } from "@/services/product";
import type { listApprovedReviews } from "@/services/review";

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
        <ProductDetailsPanel product={product} wished={wished} />
      </Section>

      {product.aboutPoints.length || product.aboutIntro ? (
        <Section
          as="section"
          aria-labelledby="about-product"
          className="bg-surface-main py-14 md:py-20"
        >
          <div className="mx-auto max-w-5xl">
            <h2
              id="about-product"
              className="font-cormorant text-center text-3xl font-semibold tracking-[0.06em] text-text-primary uppercase md:text-5xl"
            >
              About this product
            </h2>
            {product.aboutIntro ? (
              <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-7 whitespace-pre-line text-text-muted">
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
            className="font-cormorant mb-8 text-center text-3xl font-semibold tracking-[0.06em] text-text-primary uppercase md:mb-10 md:text-4xl"
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
        className="border-t border-surface-border bg-surface-main py-14 md:py-20"
      >
        <h2
          id="reviews"
          className="font-cormorant mb-10 text-center text-3xl font-semibold text-text-primary md:text-5xl"
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
