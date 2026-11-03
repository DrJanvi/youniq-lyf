import "server-only";
import { revalidateTag } from "next/cache";

export const PUBLIC_CACHE_TAGS = {
  aboutUs: "public:about-us",
  blogs: "public:blogs",
  contact: "public:contact",
  contactFaqs: "public:contact-faqs",
  heroBanners: "public:hero-banners",
  highlightedPosts: "public:highlighted-posts",
  policies: "public:policies",
  products: "public:products",
  reviews: "public:reviews",
  taxonomy: "public:taxonomy",
} as const;

export function invalidatePublicCache(...tags: string[]) {
  for (const tag of new Set(tags)) {
    revalidateTag(tag, { expire: 0 });
  }
}
