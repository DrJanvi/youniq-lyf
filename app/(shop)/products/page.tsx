import { PageHeader } from "@/components/shop/PageHeader";
import { ProductListing } from "@/components/shop/ProductListing";
import { Section } from "@/components/ui/Section";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const instant = false;

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const sp = await searchParams;
  const q = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const filtered = Object.keys(sp).some((k) => k !== "page");
  return buildMetadata({
    title: q ? `Search results for "${q}"` : "All products",
    description:
      "Browse all Youniqlyf products: perfumes, body care, hair care and more.",
    // Filtered/search URLs canonicalise to the plain listing and are kept out of the index.
    path: "/products",
    noindex: filtered,
  });
}

export default async function ProductsPage({ searchParams }: Props) {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="All Products"
        description="Beauty, fragrance & home rituals for every day."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Products", href: "/products" },
        ]}
      />
      <Section>
        <ProductListing
          searchParams={await searchParams}
          basePath="/products"
        />
      </Section>
    </div>
  );
}
