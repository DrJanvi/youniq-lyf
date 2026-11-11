import { PageHeader } from "@/components/shop/PageHeader";
import { BlogListing } from "@/components/shop/BlogListing";
import { JsonLd } from "@/components/ui/JsonLd";
import { parsePagination } from "@/lib/pagination";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { listBlogArticles } from "@/services/blog-article";
import type { Metadata } from "next";

const title = "Stories of Bags & Style";
const description =
  "Explore Youniq bags, thoughtful accessories, styling ideas, and the details that make a look your own.";

export const instant = false;

export const metadata: Metadata = buildMetadata({
  title,
  description,
  path: "/blogs",
});

export default async function BlogsPage() {
  const initialData = await listBlogArticles(parsePagination({}, 9));
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Blogs", href: "/blogs" },
  ];

  return (
    <div className="flex flex-col">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <PageHeader
        title={title}
        description={description}
        crumbs={crumbs}
        variant="editorial"
      />
      <BlogListing initialData={initialData} />
    </div>
  );
}
