import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/shop/ProductListing";
import { PageHeader } from "@/components/shop/PageHeader";
import { Section } from "@/components/ui/Section";
import { buildMetadata } from "@/lib/seo";
import { getTaxonomyBySlug } from "@/services/taxonomy";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const instant = false;

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getTaxonomyBySlug("category", slug);
  if (!category) return {};
  const filtered = Object.keys(await searchParams).some((k) => k !== "page");
  return buildMetadata({
    title: category.seoTitle ?? category.name,
    description:
      category.seoDescription ??
      category.description ??
      `Shop ${category.name} at Banafa.`,
    path: `/category/${slug}`,
    noindex: filtered,
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const category = await getTaxonomyBySlug("category", slug);
  if (!category) notFound();
  return (
    <div className="flex flex-col">
      <PageHeader
        title={category.name}
        description={category.description}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Products", href: "/products" },
          { name: category.name, href: `/category/${slug}` },
        ]}
      />
      <Section>
        <ProductListing
          searchParams={await searchParams}
          basePath={`/category/${slug}`}
          fixedCategory={slug}
        />
      </Section>
    </div>
  );
}
