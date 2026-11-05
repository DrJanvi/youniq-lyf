import { PageHeader } from "@/components/shop/PageHeader";
import { Accordion } from "@/components/ui/Accordion";
import { Section } from "@/components/ui/Section";
import { sanitizeRichTextContent } from "@/lib/blog-content";
import { buildMetadata } from "@/lib/seo";
import { listActiveFaqs } from "@/services/contact";
import Link from "next/link";

export const metadata = buildMetadata({
  title: "FAQs",
  description:
    "Find answers to common questions about Youniqlyf products and orders.",
  path: "/faqs",
});

export const instant = false;

export default async function FaqsPage() {
  const faqs = await listActiveFaqs("FAQ_PAGE");

  return (
    <div>
      <PageHeader
        title="FAQs"
        crumbs={[
          { name: "Home", href: "/" },
          { name: "FAQs", href: "/faqs" },
        ]}
      />
      <Section className="mt-0! py-10 md:py-14">
        {faqs.length ? (
          <div className="mx-auto">
            {faqs.map((faq) => (
              <Accordion
                key={faq.id}
                title={faq.question}
                titleClassName="font-cormorant text-lg sm:text-xl"
              >
                <div
                  className="storefront-rich-content max-w-3xl text-sm leading-6 text-[#777] sm:text-[15px]"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeRichTextContent(faq.answer),
                  }}
                />
              </Accordion>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-5xl text-sm leading-6 text-[#777]">
            <p>No FAQs are available yet. Contact us if you need assistance.</p>
            <Link
              href="/contact"
              className="text-brand-espresso mt-3 inline-block underline underline-offset-4"
            >
              Contact Us
            </Link>
          </div>
        )}
      </Section>
    </div>
  );
}
