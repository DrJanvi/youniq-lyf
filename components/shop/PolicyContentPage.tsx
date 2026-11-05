import { PageHeader } from "@/components/shop/PageHeader";
import { Section } from "@/components/ui/Section";
import { sanitizeRichTextContent } from "@/lib/blog-content";
import {
  getPolicyPageContent,
  type PolicyPageSlug,
} from "@/services/policy-pages";

export async function PolicyContentPage({
  slug,
  title,
}: {
  slug: PolicyPageSlug;
  title: string;
}) {
  const content = await getPolicyPageContent(slug);

  return (
    <div>
      <PageHeader
        title={title}
        crumbs={[
          { name: "Home", href: "/" },
          { name: title, href: `/${slug}` },
        ]}
      />
      <Section className="mt-0! py-10 md:py-14">
        <article className="storefront-rich-content mx-auto text-sm leading-7 text-text-muted sm:text-base">
          {content ? (
            <div
              dangerouslySetInnerHTML={{
                __html: sanitizeRichTextContent(content),
              }}
            />
          ) : (
            <p>
              Policy information will be published here once it is approved.
            </p>
          )}
        </article>
      </Section>
    </div>
  );
}
