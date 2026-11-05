import { ContactForm } from "@/components/shop/ContactForm";
import { PageHeader } from "@/components/shop/PageHeader";
import { Accordion } from "@/components/ui/Accordion";
import { Section } from "@/components/ui/Section";
import { sanitizeRichTextContent } from "@/lib/blog-content";
import { buildMetadata } from "@/lib/seo";
import { getContactPageData } from "@/services/contact";
import { Headphones, Mail, Phone } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Contact Us",
  description:
    "Contact Youniqlyf for fragrance advice, order support, returns, and wholesale enquiries.",
  path: "/contact",
});

export const instant = false;

function phoneHref(value: string) {
  return `tel:${value.replace(/[^\d+]/g, "")}`;
}

export default async function ContactPage() {
  const { settings, locations, faqs } = await getContactPageData();

  return (
    <div>
      <PageHeader
        title={settings.heading}
        description={settings.tagline}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Contact Us", href: "/contact" },
        ]}
      />

      <Section className="mt-0! py-10 md:py-14">
        <div className="grid items-start gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          <div>
            <h2 className="font-cormorant text-3xl font-medium text-text-primary md:text-4xl">
              {settings.contactHeading}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-text-muted">
              {settings.contactIntro}
            </p>

            <div className="mt-6 divide-y divide-surface-border border-y border-surface-border">
              <div className="flex gap-4 py-5">
                <Mail
                  className="text-brand-primary mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-cormorant text-text-primary text-lg font-semibold">
                    Email Us
                  </h3>
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:text-text-primary mt-1 block text-sm text-text-muted"
                  >
                    {settings.email}
                  </a>
                  {settings.alternateEmail ? (
                    <a
                      href={`mailto:${settings.alternateEmail}`}
                      className="hover:text-text-primary mt-1 block text-sm text-text-muted"
                    >
                      {settings.alternateEmail}
                    </a>
                  ) : null}
                </div>
              </div>
              <div className="flex gap-4 py-5">
                <Phone
                  className="text-brand-primary mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-cormorant text-text-primary text-lg font-semibold">
                    Call Us
                  </h3>
                  <a
                    href={phoneHref(settings.phone)}
                    className="hover:text-text-primary mt-1 block text-sm text-text-muted"
                  >
                    {settings.phone}
                  </a>
                  {settings.whatsapp ? (
                    <a
                      href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-text-primary mt-1 block text-sm text-text-muted"
                    >
                      WhatsApp: {settings.whatsapp}
                    </a>
                  ) : null}
                </div>
              </div>
              <div className="flex gap-4 py-5">
                <Headphones
                  className="text-brand-primary mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-cormorant text-text-primary text-lg font-semibold">
                    {settings.supportTitle}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-text-muted">
                    {settings.supportDescription}
                  </p>
                </div>
              </div>
            </div>

            {locations.length ? (
              <div className="mt-6">
                <h3 className="text-brand-primary-dark border-b border-surface-border pb-3 text-xs font-bold tracking-[0.12em]">
                  OUR LOCATIONS
                </h3>
                <div className="divide-y divide-surface-border">
                  {locations.map((location, index) => (
                    <div key={location.id} className="flex gap-4 py-4">
                      <span className="font-cormorant text-brand-primary pt-1 text-[18px] font-semibold tracking-wide">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h4 className="font-cormorant text-text-primary text-lg font-semibold">
                          {location.city}, {location.country}
                        </h4>
                        {location.company ? (
                          <p className="mt-1 text-xs leading-5 text-text-muted">
                            {location.company}
                          </p>
                        ) : null}
                        <p className="text-xs leading-5 text-text-muted">
                          {location.address}
                        </p>
                        {location.phone ? (
                          <a
                            href={phoneHref(location.phone)}
                            className="hover:text-text-primary mt-1 block text-xs text-text-muted"
                          >
                            {location.phone}
                          </a>
                        ) : null}
                        {location.whatsapp ? (
                          <a
                            href={`https://wa.me/${location.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-text-primary mt-1 block text-xs text-text-muted"
                          >
                            WhatsApp {location.whatsapp}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl border border-surface-border bg-surface-main p-6 shadow-md sm:p-8">
            <h2 className="font-cormorant text-3xl font-medium text-text-primary md:text-4xl">
              How can we help?
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              Complete the form and our team will be in touch.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>

        {faqs.length || settings.image ? (
          <div
            className={`mt-14 grid items-start gap-8 lg:gap-12 ${settings.image ? "lg:grid-cols-[1.1fr_0.9fr]" : ""}`}
          >
            {faqs.length ? (
              <section aria-labelledby="contact-faq-heading">
                <h2
                  id="contact-faq-heading"
                  className="font-cormorant text-text-primary text-2xl font-medium md:text-3xl"
                >
                  Frequently Asked Questions
                </h2>
                <div className="mt-4">
                  {faqs.map((faq) => (
                    <Accordion
                      key={faq.id}
                      title={faq.question}
                      titleClassName="font-cormorant text-lg"
                    >
                      <div
                        className="storefront-rich-content max-w-2xl text-sm leading-6 text-text-muted"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeRichTextContent(faq.answer),
                        }}
                      />
                    </Accordion>
                  ))}
                </div>
              </section>
            ) : null}
            {settings.image ? (
              <div className="relative rounded-2xl bg-surface-card p-0.75 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={settings.image}
                  alt={settings.imageAlt}
                  className="block h-64 w-full rounded-[13px] object-cover sm:h-80"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-5.75 rounded-[10px] border border-surface-border/50"
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </Section>
    </div>
  );
}
