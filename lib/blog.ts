export const BLOG_CATEGORIES = [
  "Perfume & Fragrance",
  "Beauty & Skincare",
  "Lifestyle",
  "Tips & Guides",
  "Brand Stories",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export function isBlogCategory(value: string): value is BlogCategory {
  return BLOG_CATEGORIES.some((category) => category === value);
}

export function hasBlogContentText(content: string) {
  return content
    .replace(/<[^>]*>/g, "")
    .replace(/(?:&nbsp;|&#160;|&#xA0;)/gi, " ")
    .trim().length > 0;
}

export type BlogArticleCard = {
  id: string;
  slug: string;
  title: string;
  category: BlogCategory;
  publishedAt: string;
  readTime: number;
  excerpt: string;
  image: string;
};
