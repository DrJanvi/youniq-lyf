import { Section } from "@/components/ui/Section";
import { buildMetadata } from "@/lib/seo";
import { getAboutUsPageSettings } from "@/services/about-us";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = buildMetadata({
  title: "About Us",
  description:
    "Discover Youniqlyf's history, fragrance craftsmanship, and commitment to thoughtful development.",
  path: "/about-us",
});

export const instant = false;

export default async function AboutUsPage() {
  const settings = await getAboutUsPageSettings();
  const desktopImage = settings.desktopImage ?? settings.mobileImage;
  const mobileImage = settings.mobileImage ?? settings.desktopImage;
  const heroImage = desktopImage ?? mobileImage;

  return (
    <div>
      {/* Hero banner and breadcrumb navigation */}
      <section className="bg-surface-card relative isolate overflow-hidden">
        {heroImage ? (
          <picture className="absolute inset-0 hidden md:block">
            <Image
              src={heroImage}
              alt=""
              fill
              unoptimized
              loading="eager"
              sizes="100vw"
              className="object-cover object-[center_54%]"
            />
          </picture>
        ) : (
          <div
            aria-hidden="true"
            className="bg-surface-card absolute inset-0 -z-10 hidden md:block"
          />
        )}
        <div className="md:hidden">
          <div className="bg-surface-card relative aspect-[2.24/1] overflow-hidden">
            {mobileImage ? (
              <Image
                src={mobileImage}
                alt=""
                fill
                unoptimized
                loading="eager"
                sizes="100vw"
                className="object-cover object-center"
              />
            ) : null}
            <nav
              aria-label="Breadcrumb"
              className="text-text-muted absolute top-3 left-6 z-10 text-xs sm:left-8"
            >
              <Link
                href="/"
                className="hover:text-text-primary transition-colors"
              >
                Home
              </Link>
              <span className="mx-2" aria-hidden="true">
                /
              </span>
              <span className="text-text-primary font-medium">About us</span>
            </nav>
          </div>
          <div className="bg-surface-main px-6 py-3 sm:px-8">
            <h1 className="font-cormorant text-announcement-bg text-[1.75rem] leading-[1.08] font-medium tracking-[0.045em]">
              {settings.heroHeading.replace(/\s*\n\s*/g, " ")}
            </h1>
            <p className="text-text-muted mt-1.5 max-w-md text-sm leading-5">
              {settings.heroDescription}
            </p>
          </div>
        </div>
        <Section className="relative z-10 hidden min-h-102.5 py-5 sm:min-h-110 md:block md:min-h-97.5 md:py-5 lg:min-h-102.5">
          <nav aria-label="Breadcrumb" className="text-text-muted text-xs">
            <Link
              href="/"
              className="hover:text-text-primary transition-colors"
            >
              Home
            </Link>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <span className="text-text-primary font-medium">About us</span>
          </nav>
          <div className="flex min-h-87.5 items-center py-14 sm:min-h-93.75 md:min-h-82.5 md:py-10">
            <div className="max-w-xl">
              <h1 className="font-cormorant text-announcement-bg text-5xl leading-[1.08] font-medium tracking-[0.075em] whitespace-pre-line">
                {settings.heroHeading}
              </h1>
              <p className="text-text-muted mt-3 max-w-md text-sm leading-6 sm:text-base">
                {settings.heroDescription}
              </p>
            </div>
          </div>
        </Section>
      </section>

      {/* Company journey and milestone timeline */}
      <Section className="bg-surface-main mt-0! py-12 md:py-14 lg:py-16">
        <section aria-labelledby="about-journey-heading">
          <div className="grid gap-4 md:grid-cols-[1fr_0.55fr] md:items-start md:gap-10">
            <h2
              id="about-journey-heading"
              className="font-cormorant text-text-primary text-4xl leading-tight font-medium sm:text-5xl"
            >
              {settings.journeyHeading}
            </h2>
            <p className="text-text-muted max-w-md text-sm leading-6 md:justify-self-end">
              {settings.journeyDescription}
            </p>
          </div>

          <ol
            aria-label="Company history timeline"
            className="border-surface-border md:before:bg-surface-card relative mt-10 grid gap-7 border-l pl-6 md:mt-14 md:grid-cols-4 md:gap-0 md:border-l-0 md:pl-0 md:before:absolute md:before:top-[2.85rem] md:before:right-1/4 md:before:left-1 md:before:h-px md:before:content-['']"
          >
            {settings.milestones.map((milestone, index) => (
              <li
                key={`${milestone.year}-${index}`}
                className="relative min-h-28 min-w-0 md:pr-7"
              >
                <span className="font-cormorant text-brand-primary-dark text-3xl font-bold">
                  {milestone.year}
                </span>
                <span
                  aria-hidden="true"
                  className="border-surface-border bg-surface-main absolute top-3.5 -left-6 ml-[-0.5px] size-3 -translate-x-1/2 rounded-full border-[3px] md:top-[2.53rem] md:left-0"
                />
                <h3 className="text-announcement-bg mt-3 text-sm font-bold md:mt-8">
                  {milestone.title}
                </h3>
                <p className="text-text-muted mt-1 max-w-[28ch] text-sm leading-5">
                  {milestone.description}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </Section>

      {/* Company principles */}
      <Section className="mt-0! bg-white py-12 md:py-16">
        <section aria-labelledby="about-principles-heading">
          <h2
            id="about-principles-heading"
            className="font-cormorant text-text-primary text-center text-3xl font-medium sm:text-4xl"
          >
            {settings.principlesHeading}
          </h2>
          <div className="border-surface-border bg-surface-main mt-8 rounded-[28px] border p-6 sm:p-8 md:mt-10 md:p-10">
            <ul className="grid gap-8 md:grid-cols-3 md:gap-10">
              {settings.principles.map((principle) => (
                <li key={principle.id} className="min-w-0">
                  <Image
                    src={principle.icon}
                    alt=""
                    width={52}
                    height={52}
                    unoptimized
                    aria-hidden="true"
                    className="size-12 object-contain"
                  />
                  <h3 className="font-cormorant text-text-primary mt-4 text-2xl font-medium">
                    {principle.title}
                  </h3>
                  <p className="text-text-muted mt-2 text-sm leading-6">
                    {principle.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </Section>

      {/* Who we are story */}
      <Section className="mt-0! bg-white py-8 md:py-14">
        <section
          aria-labelledby="about-who-heading"
          className="grid items-center gap-8 md:grid-cols-2 md:gap-10 lg:gap-14"
        >
          <div className="relative">
            <div className="bg-surface-card ring-surface-border relative aspect-[1.42/1] overflow-hidden rounded-2xl ring-1">
              {settings.whoImage ? (
                <Image
                  src={settings.whoImage}
                  alt=""
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="from-brand-primary-soft to-surface-card absolute inset-0 bg-linear-to-br"
                />
              )}
            </div>
            <div className="bg-brand-primary-dark absolute -right-2 -bottom-5 grid size-24 place-items-center rounded-full p-3 text-center text-[10px] leading-4 font-semibold tracking-[0.12em] text-white shadow-md sm:-right-4 sm:size-28">
              <span>{settings.whoBadge}</span>
            </div>
          </div>
          <div className="pt-2 md:pt-0">
            <h2
              id="about-who-heading"
              className="font-cormorant text-text-primary text-3xl leading-tight font-medium tracking-[0.06em] sm:text-4xl"
            >
              {settings.whoHeading}
            </h2>
            <h3 className="text-text-primary mt-2 text-base font-medium sm:text-lg">
              {settings.whoSubheading}
            </h3>
            <div className="mt-4 space-y-3">
              {settings.whoParagraphs.map((paragraph, index) => (
                <p key={index} className="text-text-muted text-sm leading-5">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>
      </Section>

      {/* Fragrance legacy and company highlights */}
      <Section className="mt-0! bg-white py-10 md:py-16">
        <section
          aria-labelledby="about-legacy-heading"
          className="grid items-center gap-8 md:grid-cols-2 md:gap-10 lg:gap-14"
        >
          <div className="bg-surface-card ring-surface-border relative aspect-1.25/1 overflow-hidden rounded-2xl ring-1">
            {settings.legacyImage ? (
              <Image
                src={settings.legacyImage}
                alt=""
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div
                aria-hidden="true"
                className="from-brand-primary-soft to-surface-card absolute inset-0 bg-linear-to-br"
              />
            )}
          </div>
          <div>
            <h2
              id="about-legacy-heading"
              className="font-cormorant text-text-primary text-3xl leading-tight font-medium tracking-[0.04em] sm:text-4xl"
            >
              {settings.legacyHeading}
            </h2>
            <p className="text-text-primary mt-3 text-sm leading-5">
              {settings.legacyIntro}
            </p>
            <ul className="my-6 grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-3">
              {settings.legacyStats.map((stat) => (
                <li
                  key={stat.id}
                  className="flex min-w-0 flex-col items-start gap-2"
                >
                  <span className="bg-surface-card grid size-9 place-items-center rounded-full">
                    <Image
                      src={stat.icon}
                      alt=""
                      width={20}
                      height={20}
                      unoptimized
                      aria-hidden="true"
                      className="size-5 object-contain"
                    />
                  </span>
                  <span className="text-text-muted text-xs leading-4">
                    {stat.title}
                  </span>
                </li>
              ))}
            </ul>
            <div className="space-y-3">
              <p className="text-text-muted text-sm leading-5">
                {settings.legacyParagraph1}
              </p>
              <p className="text-text-muted text-sm leading-5">
                {settings.legacyParagraph2}
              </p>
            </div>
          </div>
        </section>
      </Section>

      {/* Why customers choose Youniqlyf */}
      <Section className="mt-0! bg-white py-10 md:py-16">
        <section
          aria-labelledby="about-why-choose-heading"
          className="grid gap-8 md:grid-cols-[0.82fr_1.18fr] md:gap-10 lg:gap-12"
        >
          <div className="flex flex-col">
            <h2
              id="about-why-choose-heading"
              className="font-cormorant text-text-primary text-3xl leading-tight font-medium tracking-[0.04em] sm:text-4xl"
            >
              {settings.whyChooseHeading}
            </h2>
            <p className="text-text-muted mt-3 max-w-md text-sm leading-5">
              {settings.whyChooseDescription}
            </p>
            <div className="bg-surface-card ring-surface-border relative mt-5 aspect-[1.55/1] overflow-hidden rounded-2xl ring-1">
              {settings.whyChooseImage ? (
                <Image
                  src={settings.whyChooseImage}
                  alt=""
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 42vw"
                  className="object-cover"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="from-brand-primary-soft to-surface-card absolute inset-0 bg-linear-to-br"
                />
              )}
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 md:gap-5">
            {settings.whyChooseCards.map((card) => (
              <li
                key={card.id}
                className="bg-surface-main flex min-h-52 flex-col justify-between rounded-2xl p-5 sm:p-6"
              >
                <h3 className="font-cormorant text-text-primary text-xl leading-tight font-medium sm:text-2xl">
                  {card.title}
                </h3>
                <p className="text-text-muted mt-6 text-sm leading-5">
                  {card.description}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </Section>
    </div>
  );
}
