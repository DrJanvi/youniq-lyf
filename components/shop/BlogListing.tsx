"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock3, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Section } from "@/components/ui/Section";
import { BLOG_CATEGORIES, type BlogArticleCard, type BlogCategory } from "@/lib/blog";

const PAGE_SIZE = 9;
const CATEGORY_FILTERS = [
  { value: null, label: "All Stories" },
  ...BLOG_CATEGORIES.map((category) => ({ value: category, label: category })),
] satisfies { value: BlogCategory | null; label: string }[];

type BlogPageResponse = {
  data: BlogArticleCard[];
  pagination: { page: number; hasNext: boolean };
};

function isBlogArticleCard(value: unknown): value is BlogArticleCard {
  if (typeof value !== "object" || value === null) return false;
  const article = value as Record<string, unknown>;
  return (
    typeof article.id === "string" &&
    typeof article.slug === "string" &&
    typeof article.title === "string" &&
    typeof article.category === "string" &&
    typeof article.publishedAt === "string" &&
    typeof article.readTime === "number" &&
    typeof article.excerpt === "string" &&
    typeof article.image === "string"
  );
}

function isBlogPageResponse(value: unknown): value is BlogPageResponse {
  if (typeof value !== "object" || value === null) return false;
  const response = value as Record<string, unknown>;
  if (!Array.isArray(response.data) || !response.data.every(isBlogArticleCard)) {
    return false;
  }
  if (typeof response.pagination !== "object" || response.pagination === null) {
    return false;
  }
  const pagination = response.pagination as Record<string, unknown>;
  return (
    typeof pagination.page === "number" &&
    typeof pagination.hasNext === "boolean"
  );
}

async function fetchBlogPage(
  category: BlogCategory | null,
  page: number,
): Promise<BlogPageResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
  });
  if (category) params.set("category", category);

  const response = await fetch(`/api/blogs?${params}`);
  const result: unknown = await response.json();
  if (!response.ok) {
    const message =
      typeof result === "object" &&
      result !== null &&
      "error" in result &&
      typeof result.error === "string"
        ? result.error
        : "Could not load articles.";
    throw new Error(message);
  }
  if (!isBlogPageResponse(result)) {
    throw new Error("The article service returned an invalid response.");
  }
  return result;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function ArticleMeta({ article }: { article: BlogArticleCard }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8b8580]">
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays aria-hidden="true" className="size-3.5" />
        {formatDate(article.publishedAt)}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock3 aria-hidden="true" className="size-3.5" />
        {article.readTime} Min Read
      </span>
    </div>
  );
}

function FeaturedArticles({ articles }: { articles: BlogArticleCard[] }) {
  if (articles.length === 0) return null;
  const [lead, ...sideArticles] = articles;

  return (
    <Section className="py-10 sm:py-14">
      <h2 className="mb-6 font-cormorant text-3xl leading-tight text-[#241d19] sm:text-4xl">
        Take a look at the latest articles
      </h2>
      <div
        className={`grid gap-4 ${sideArticles.length ? "lg:grid-cols-[1.08fr_1fr]" : ""}`}
      >
        <article className="flex flex-col overflow-hidden rounded-2xl bg-[#faf9f8] p-4 ring-1 ring-black/5 sm:p-5">
          <div className="flex flex-col items-start">
            <ArticleMeta article={lead} />
            <Link href={`/blogs/${lead.slug}`} className="group">
              <h3 className="mt-3 font-cormorant text-2xl leading-tight text-[#2c211d] group-hover:text-[#a98678] sm:text-3xl">
                {lead.title}
              </h3>
            </Link>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#89817b]">
              {lead.excerpt}
            </p>
            <Link
              href={`/blogs/${lead.slug}`}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#b99586] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#8d6a5e]"
            >
              LEARN MORE <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <Link
            href={`/blogs/${lead.slug}`}
            aria-label={`Read ${lead.title}`}
            className="relative mt-5 block aspect-[1.9] overflow-hidden rounded-xl"
          >
            <Image
              src={lead.image}
              alt={lead.title}
              fill
              unoptimized
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover transition-transform duration-500 hover:scale-[1.03]"
            />
          </Link>
        </article>
        {sideArticles.length ? (
          <div className="grid gap-4">
            {sideArticles.map((article) => (
              <article
                key={article.id}
                className="grid gap-4 rounded-2xl bg-[#faf9f8] p-4 ring-1 ring-black/5 sm:grid-cols-[minmax(150px,0.9fr)_1fr] sm:items-center sm:p-5"
              >
                <Link
                  href={`/blogs/${article.slug}`}
                  aria-label={`Read ${article.title}`}
                  className="relative block aspect-[1.35] overflow-hidden rounded-xl"
                >
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 30vw"
                    className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                  />
                </Link>
                <div className="flex flex-col items-start">
                  <ArticleMeta article={article} />
                  <Link href={`/blogs/${article.slug}`} className="group">
                    <h3 className="mt-3 line-clamp-2 font-cormorant text-xl leading-tight text-[#2c211d] group-hover:text-[#a98678] sm:text-2xl">
                      {article.title}
                    </h3>
                  </Link>
                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#89817b]">
                    {article.excerpt}
                  </p>
                  <Link
                    href={`/blogs/${article.slug}`}
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#b99586] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#8d6a5e]"
                  >
                    LEARN MORE{" "}
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </Section>
  );
}

function StoryCard({ article }: { article: BlogArticleCard }) {
  return (
    <article className="group flex flex-col">
      <Link
        href={`/blogs/${article.slug}`}
        aria-label={`Read ${article.title}`}
        className="relative mb-3 block aspect-[1.55] overflow-hidden rounded-xl bg-[#f7f3f0]"
      >
        <Image
          src={article.image}
          alt={article.title}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>
      <ArticleMeta article={article} />
      <Link href={`/blogs/${article.slug}`} className="group/title">
        <h3 className="mt-2 line-clamp-2 font-cormorant text-xl leading-tight font-semibold text-[#2c211d] uppercase group-hover/title:text-[#a98678]">
          {article.title}
        </h3>
      </Link>
      <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#89817b]">
        {article.excerpt}
      </p>
      <Link
        href={`/blogs/${article.slug}`}
        className="mt-3 inline-flex w-fit items-center gap-2 rounded-full border border-[#d8bdb2] px-4 py-2 text-[11px] font-medium text-[#a98678] transition-colors hover:bg-[#b99586] hover:text-white"
      >
        LEARN MORE <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </article>
  );
}

export function BlogListing({
  initialData,
}: {
  initialData: BlogPageResponse;
}) {
  const [articles, setArticles] = useState(initialData.data);
  const [hasNext, setHasNext] = useState(initialData.pagination.hasNext);
  const [page, setPage] = useState(initialData.pagination.page);
  const [activeCategory, setActiveCategory] = useState<BlogCategory | null>(
    null,
  );
  const [pending, setPending] = useState(false);

  async function changeCategory(category: BlogCategory | null) {
    if (pending || category === activeCategory) return;
    setPending(true);
    try {
      const result = await fetchBlogPage(category, 1);
      setActiveCategory(category);
      setArticles(result.data);
      setPage(result.pagination.page);
      setHasNext(result.pagination.hasNext);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not load articles.",
      );
    } finally {
      setPending(false);
    }
  }

  async function loadMore() {
    if (pending || !hasNext) return;
    setPending(true);
    try {
      const result = await fetchBlogPage(activeCategory, page + 1);
      setArticles((current) => [...current, ...result.data]);
      setPage(result.pagination.page);
      setHasNext(result.pagination.hasNext);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not load articles.",
      );
    } finally {
      setPending(false);
    }
  }

  const featured = articles.slice(0, 3);
  const remaining = articles.slice(3);

  return (
    <>
      <FeaturedArticles articles={featured} />
      <Section className="pb-14 sm:pb-20">
        <header className="mb-7 text-center">
          <h2 className="font-cormorant text-4xl leading-tight text-[#241d19] sm:text-5xl">
            Latest Stories
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-[#89817b] sm:text-sm">
            Thoughtful stories on fragrance, beauty, and the art of living well.
          </p>
        </header>
        <div className="mb-8 flex justify-center overflow-x-auto pb-2">
          <div
            role="group"
            aria-label="Filter stories by category"
            className="flex w-max max-w-full items-center gap-1 rounded-xl border border-[#ece8e5] bg-[#faf9f8] p-1"
          >
            {CATEGORY_FILTERS.map((filter) => (
              <button
                key={filter.label}
                type="button"
                aria-pressed={activeCategory === filter.value}
                disabled={pending}
                onClick={() => void changeCategory(filter.value)}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs transition-colors sm:px-4 ${activeCategory === filter.value ? "bg-[#b99586] text-white" : "text-[#8b8580] hover:text-[#35251f]"} disabled:cursor-wait disabled:opacity-70`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        {remaining.length ? (
          <div
            className={`grid gap-x-5 gap-y-9 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${pending ? "opacity-60" : ""}`}
            aria-busy={pending}
          >
            {remaining.map((article) => (
              <StoryCard key={article.id} article={article} />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#89817b]">
            No stories found in this category.
          </p>
        ) : null}
        {hasNext ? (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => void loadMore()}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-full bg-[#b99586] px-5 py-3 text-xs font-medium text-white transition-colors hover:bg-[#8d6a5e] disabled:cursor-wait disabled:opacity-60"
            >
              {pending ? "Loading…" : "LOAD MORE"}
              <ArrowRight aria-hidden="true" className="size-4" />
            </button>
          </div>
        ) : null}
      </Section>
    </>
  );
}
