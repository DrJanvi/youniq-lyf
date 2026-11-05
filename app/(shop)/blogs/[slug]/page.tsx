import { BlogShareButtons } from "@/components/shop/BlogShareButtons";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { Section } from "@/components/ui/Section";
import { sanitizeBlogContent } from "@/lib/blog-content";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import {
  getBlogArticleBySlug,
  listLatestBlogArticles,
} from "@/services/blog-article";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ slug: string }> };

export const instant = false;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getBlogArticleBySlug(slug);
  if (!article) {
    return buildMetadata({
      title: "Blog story not found",
      path: `/blogs/${slug}`,
      noindex: true,
    });
  }
  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    image: article.image,
    path: `/blogs/${article.slug}`,
  });
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(date);
}

function formatCardDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getBlogArticleBySlug(slug);
  if (!article) notFound();

  const exploreArticles = await listLatestBlogArticles(article.slug);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Blogs", href: "/blogs" },
  ];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    image: article.image,
    datePublished: article.publishedAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    timeRequired: `PT${article.readTime}M`,
    mainEntityOfPage: absoluteUrl(`/blogs/${article.slug}`),
    publisher: { "@type": "Organization", name: "Youniqlyf" },
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <Breadcrumbs crumbs={crumbs} />
      <Section className="pb-7 sm:pb-10">
        <header className="mx-auto max-w-4xl py-5 text-center sm:py-8">
          <h1 className="font-cormorant text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.05] font-medium tracking-[0.045em] text-text-primary uppercase">
            {article.title}
          </h1>
          <p className="mt-4 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-xs text-text-muted sm:text-sm">
            <span>
              Posted by{" "}
              <span className="font-medium text-text-primary">
                Buabed Youniqlyf
              </span>
            </span>
            <span aria-hidden="true">|</span>
            <span>{formatDate(article.publishedAt)}</span>
            <span aria-hidden="true">|</span>
            <span>{article.readTime} Min Read</span>
          </p>
        </header>
        <div className="relative aspect-[1.3] overflow-hidden rounded-2xl bg-surface-card sm:aspect-[1.9] lg:aspect-[2.55]">
          <Image
            src={article.image}
            alt={article.title}
            fill
            unoptimized
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
          />
        </div>
        <BlogShareButtons
          title={article.title}
          url={absoluteUrl(`/blogs/${article.slug}`)}
        />
        <div
          className="blog-article-content mx-auto mt-7 max-w-6xl text-[15px] leading-7 text-text-muted sm:mt-9 sm:text-base"
          dangerouslySetInnerHTML={{
            __html: sanitizeBlogContent(article.content),
          }}
        />
      </Section>
      {exploreArticles.length > 0 ? (
        <Section className="border-t border-surface-border py-12 sm:py-16">
          <header className="mb-7 flex flex-col gap-3 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-cormorant text-4xl leading-tight text-text-primary sm:text-5xl">
              Explore more
            </h2>
            <p className="max-w-[52ch] text-sm leading-6 text-text-muted sm:text-right">
              Discover more fragrance inspirations, beauty tips, and lifestyle
              stories curated to elevate your everyday experiences with Buabed
              Youniqlyf.
            </p>
          </header>
          <div className="grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {exploreArticles.map((relatedArticle) => (
              <article key={relatedArticle.id} className="group flex flex-col">
                <Link
                  href={`/blogs/${relatedArticle.slug}`}
                  aria-label={`Read ${relatedArticle.title}`}
                  className="relative mb-3 block aspect-[1.55] overflow-hidden rounded-xl bg-surface-card"
                >
                  <Image
                    src={relatedArticle.image}
                    alt={relatedArticle.title}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </Link>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays aria-hidden="true" className="size-3.5" />
                    {formatCardDate(relatedArticle.publishedAt)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 aria-hidden="true" className="size-3.5" />
                    {relatedArticle.readTime} Min Read
                  </span>
                </div>
                <Link
                  href={`/blogs/${relatedArticle.slug}`}
                  className="group/title"
                >
                  <h3 className="font-cormorant mt-2 line-clamp-2 text-xl leading-tight font-semibold text-text-primary uppercase group-hover/title:text-brand-primary-dark">
                    {relatedArticle.title}
                  </h3>
                </Link>
                <p className="mt-2 line-clamp-2 text-sm leading-5 text-text-muted">
                  {relatedArticle.excerpt}
                </p>
                <Link
                  href={`/blogs/${relatedArticle.slug}`}
                  className="border-brand-primary/30 text-brand-primary-dark mt-3 inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-medium transition-colors hover:bg-brand-primary-hover"
                >
                  LEARN MORE{" "}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </article>
            ))}
          </div>
        </Section>
      ) : null}
    </>
  );
}
