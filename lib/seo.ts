import type { Metadata } from "next";

export const SITE_NAME = "Banafa";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildMetadata(opts: {
  title: string;
  description?: string;
  path: string;
  image?: string;
  noindex?: boolean;
}): Metadata {
  const description = opts.description?.replace(/\s+/g, " ").trim().slice(0, 160);
  return {
    title: opts.title,
    description,
    alternates: { canonical: absoluteUrl(opts.path) },
    robots: opts.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: opts.title,
      description,
      url: absoluteUrl(opts.path),
      siteName: SITE_NAME,
      images: opts.image ? [{ url: opts.image }] : undefined,
    },
    twitter: { card: opts.image ? "summary_large_image" : "summary", title: opts.title, description },
  };
}

export type Crumb = { name: string; href: string };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.href),
    })),
  };
}
