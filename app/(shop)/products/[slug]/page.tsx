import { ProductDetailsPage } from "@/components/shop/ProductDetailsPage";
import { JsonLd } from "@/components/ui/JsonLd";
import { getCurrentUser } from "@/lib/auth/session";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import {
  getProductBySlug,
  getProductSeoBySlug,
  listRelatedProducts,
} from "@/services/product";
import { getReviewDistribution, listApprovedReviews } from "@/services/review";
import { wishlistIds } from "@/services/wishlist";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export const instant = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductSeoBySlug((await params).slug);
  if (!product) return {};
  return buildMetadata({
    title: product.seoTitle ?? product.title,
    description: product.seoDescription ?? product.description,
    path: `/products/${product.slug}`,
    image: product.image,
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const user = await getCurrentUser();
  const [reviews, reviewDistribution, wishedIds, recommendations] = await Promise.all([
    listApprovedReviews(product.id, { page: 1, limit: 50, skip: 0 }),
    getReviewDistribution(product.id),
    user ? wishlistIds(user.id) : Promise.resolve([] as string[]),
    listRelatedProducts(product.category.id, product.id, 4),
  ]);
  const path = `/products/${product.slug}`;
  const lowestVariant = product.variants.reduce<
    (typeof product.variants)[number] | null
  >(
    (lowest, variant) =>
      !lowest || variant.finalPrice < lowest.finalPrice ? variant : lowest,
    null,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images,
    sku: product.id,
    brand: product.brand
      ? { "@type": "Brand", name: product.brand.name }
      : undefined,
    category: product.category.name,
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(path),
      priceCurrency: product.currency,
      price: lowestVariant?.finalPrice ?? product.finalPrice,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <ProductDetailsPage
        product={product}
        reviews={reviews}
        reviewDistribution={reviewDistribution}
        wished={wishedIds.includes(product.id)}
        recommendations={recommendations}
        userName={user?.name ?? ""}
      />
    </>
  );
}
