import { BestSellerSection } from "@/components/shop/BestSellerSection";
import { CategoriesSection } from "@/components/shop/CategoriesSection";
import { CustomerReviewsSection } from "@/components/shop/CustomerReviewsSection";
import { HeroSlider } from "@/components/shop/HeroSlider";
import { HighlightedCategorySection } from "@/components/shop/HighlightedCategorySection";
import { HighlightedPostsSection } from "@/components/shop/HighlightedPostsSection";
import { NewReleaseSection } from "@/components/shop/NewReleaseSection";
import { WhyChooseUsSection } from "@/components/shop/WhyChooseUsSection";
import { JsonLd } from "@/components/ui/JsonLd";
import { SITE_NAME, absoluteUrl, buildMetadata } from "@/lib/seo";
import { getWishedIds } from "@/lib/shop-data";
import { listHeroBanners } from "@/services/hero-banner";
import { listByTag } from "@/services/product";
import { listTopCategories } from "@/services/taxonomy";
import type { Metadata } from "next";
import { connection } from "next/server";

const homeTitle = `${SITE_NAME} - Bags & Accessories`;

export const metadata: Metadata = {
  ...buildMetadata({
    title: homeTitle,
    description:
      "Discover Youniq bags and Youniqlyf accessories for effortless everyday style.",
    path: "/",
  }),
  title: { absolute: homeTitle },
};

// Block rendering so the full page is sent at once.
export const instant = false;

export default async function HomePage() {
  await connection();
  const [banners, categories, best, fresh, wished] = await Promise.all([
    listHeroBanners(),
    listTopCategories(6),
    listByTag("best-selling", 6),
    listByTag("new-release", 10),
    getWishedIds(),
  ]);
  return (
    <div className="flex flex-col">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: absoluteUrl("/"),
          potentialAction: {
            "@type": "SearchAction",
            target: absoluteUrl("/products?q={search_term_string}"),
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <HeroSlider
        slides={banners.map((b) => ({
          image: b.desktopImage,
          mobileImage: b.mobileImage,
          href: b.link,
          alt: b.alt ?? undefined,
        }))}
      />
      <CategoriesSection categories={categories} />
      <BestSellerSection products={best} wishedIds={wished} />
      <HighlightedCategorySection />
      <NewReleaseSection products={fresh} wishedIds={wished} />
      <CustomerReviewsSection />
      <WhyChooseUsSection />
      <HighlightedPostsSection />
    </div>
  );
}
