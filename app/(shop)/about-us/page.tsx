import { Section } from "@/components/ui/Section";
import { buildMetadata } from "@/lib/seo";
import { getAboutUsPageSettings } from "@/services/about-us";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = buildMetadata({
  title: "About Us",
  description:
    "Discover Banafa's history, fragrance craftsmanship, and commitment to thoughtful development.",
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
      <section className="relative isolate overflow-hidden bg-[#f8f3ec]">
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
            className="absolute inset-0 -z-10 hidden bg-[#f2e9dd] md:block"
          />
        )}
        <div className="md:hidden">
          <div className="relative aspect-[2.24/1] overflow-hidden bg-[#f2e9dd]">
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
              className="absolute top-3 left-6 z-10 text-xs text-[#5f5852] sm:left-8"
            >
              <Link
                href="/"
                className="hover:text-brand-espresso transition-colors"
              >
                Home
              </Link>
              <span className="mx-2" aria-hidden="true">
                /
              </span>
              <span className="text-brand-espresso font-medium">About us</span>
            </nav>
          </div>
          <div className="bg-[#FFFCF9] px-6 py-3 sm:px-8">
            <h1 className="font-cormorant text-announcement-bg text-[1.75rem] leading-[1.08] font-medium tracking-[0.045em]">
              {settings.heroHeading.replace(/\s*\n\s*/g, " ")}
            </h1>
            <p className="mt-1.5 max-w-md text-sm leading-5 text-[#847b77]">
              {settings.heroDescription}
            </p>
          </div>
        </div>
        <Section className="relative z-10 hidden min-h-102.5 py-5 sm:min-h-110 md:block md:min-h-97.5 md:py-5 lg:min-h-102.5">
          <nav aria-label="Breadcrumb" className="text-xs text-[#9a918d]">
            <Link
              href="/"
              className="hover:text-brand-espresso transition-colors"
            >
              Home
            </Link>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <span className="text-brand-espresso font-medium">About us</span>
          </nav>
          <div className="flex min-h-87.5 items-center py-14 sm:min-h-93.75 md:min-h-82.5 md:py-10">
            <div className="max-w-xl">
              <h1 className="font-cormorant text-announcement-bg text-5xl leading-[1.08] font-medium tracking-[0.075em] whitespace-pre-line">
                {settings.heroHeading}
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-[#847b77] sm:text-base">
                {settings.heroDescription}
              </p>
            </div>
          </div>
        </Section>
      </section>

      {/* Company journey and milestone timeline */}
      <Section className="mt-0! bg-[#FFFCF9] py-12 md:py-14 lg:py-16">
        <section aria-labelledby="about-journey-heading">
          <div className="grid gap-4 md:grid-cols-[1fr_0.55fr] md:items-start md:gap-10">
            <h2
              id="about-journey-heading"
              className="font-cormorant text-4xl leading-tight font-medium text-[#292522] sm:text-5xl"
            >
              {settings.journeyHeading}
            </h2>
            <p className="max-w-md text-sm leading-6 text-[#847b77] md:justify-self-end">
              {settings.journeyDescription}
            </p>
          </div>

          <ol
            aria-label="Company history timeline"
            className="relative mt-10 grid gap-7 border-l border-[#eee8e5] pl-6 md:mt-14 md:grid-cols-4 md:gap-0 md:border-l-0 md:pl-0 md:before:absolute md:before:top-[2.85rem] md:before:right-1/4 md:before:left-1 md:before:h-px md:before:bg-[#eee8e5] md:before:content-['']"
          >
            {settings.milestones.map((milestone, index) => (
              <li
                key={`${milestone.year}-${index}`}
                className="relative min-h-28 min-w-0 md:pr-7"
              >
                <span className="font-cormorant text-3xl font-bold text-[#9F614D]">
                  {milestone.year}
                </span>
                <span
                  aria-hidden="true"
                  className="absolute top-3.5 -left-6 ml-[-0.5px] size-3 -translate-x-1/2 rounded-full border-[3px] border-[#5c4842] bg-[#fffdfb] md:top-[2.53rem] md:left-0"
                />
                <h3 className="text-announcement-bg mt-3 text-sm font-bold md:mt-8">
                  {milestone.title}
                </h3>
                <p className="mt-1 max-w-[28ch] text-sm leading-5 text-[#847b77]">
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
            className="font-cormorant text-center text-3xl font-medium text-[#292522] sm:text-4xl"
          >
            {settings.principlesHeading}
          </h2>
          <div className="mt-8 rounded-[28px] border border-[#eee8e5] bg-[#fdfdfd] p-6 sm:p-8 md:mt-10 md:p-10">
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
                  <h3 className="font-cormorant mt-4 text-2xl font-medium text-[#292522]">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#847b77]">
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
            <div className="relative aspect-[1.42/1] overflow-hidden rounded-2xl bg-[#e8dfd5] ring-1 ring-[#eee8e5]">
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
                  className="absolute inset-0 bg-[linear-gradient(145deg,#eee4d9,#d4c2b1)]"
                />
              )}
            </div>
            <div className="absolute -right-2 -bottom-5 grid size-24 place-items-center rounded-full bg-[#c9ada1] p-3 text-center text-[10px] leading-4 font-semibold tracking-[0.12em] text-white shadow-[0_12px_25px_-12px_rgba(55,35,28,.55)] sm:-right-4 sm:size-28">
              <span>{settings.whoBadge}</span>
            </div>
          </div>
          <div className="pt-2 md:pt-0">
            <h2
              id="about-who-heading"
              className="font-cormorant text-3xl leading-tight font-medium tracking-[0.06em] text-[#292522] sm:text-4xl"
            >
              {settings.whoHeading}
            </h2>
            <h3 className="mt-2 text-base font-medium text-[#292522] sm:text-lg">
              {settings.whoSubheading}
            </h3>
            <div className="mt-4 space-y-3">
              {settings.whoParagraphs.map((paragraph, index) => (
                <p key={index} className="text-sm leading-5 text-[#77716d]">
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
          <div className="relative aspect-1.25/1 overflow-hidden rounded-2xl bg-[#e8dfd5] ring-1 ring-[#eee8e5]">
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
                className="absolute inset-0 bg-[linear-gradient(145deg,#eee4d9,#d4c2b1)]"
              />
            )}
          </div>
          <div>
            <h2
              id="about-legacy-heading"
              className="font-cormorant text-3xl leading-tight font-medium tracking-[0.04em] text-[#292522] sm:text-4xl"
            >
              {settings.legacyHeading}
            </h2>
            <p className="mt-3 text-sm leading-5 text-[#292522]">
              {settings.legacyIntro}
            </p>
            <ul className="my-6 grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-3">
              {settings.legacyStats.map((stat) => (
                <li
                  key={stat.id}
                  className="flex min-w-0 flex-col items-start gap-2"
                >
                  <span className="grid size-9 place-items-center rounded-full bg-[#faf3ee]">
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
                  <span className="text-xs leading-4 text-[#5f5852]">
                    {stat.title}
                  </span>
                </li>
              ))}
            </ul>
            <div className="space-y-3">
              <p className="text-sm leading-5 text-[#77716d]">
                {settings.legacyParagraph1}
              </p>
              <p className="text-sm leading-5 text-[#77716d]">
                {settings.legacyParagraph2}
              </p>
            </div>
          </div>
        </section>
      </Section>

      {/* Why customers choose Banafa */}
      <Section className="mt-0! bg-white py-10 md:py-16">
        <section
          aria-labelledby="about-why-choose-heading"
          className="grid gap-8 md:grid-cols-[0.82fr_1.18fr] md:gap-10 lg:gap-12"
        >
          <div className="flex flex-col">
            <h2
              id="about-why-choose-heading"
              className="font-cormorant text-3xl leading-tight font-medium tracking-[0.04em] text-[#292522] sm:text-4xl"
            >
              {settings.whyChooseHeading}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-5 text-[#77716d]">
              {settings.whyChooseDescription}
            </p>
            <div className="relative mt-5 aspect-[1.55/1] overflow-hidden rounded-2xl bg-[#e8dfd5] ring-1 ring-[#eee8e5]">
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
                  className="absolute inset-0 bg-[linear-gradient(145deg,#eee4d9,#d4c2b1)]"
                />
              )}
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 md:gap-5">
            {settings.whyChooseCards.map((card) => (
              <li
                key={card.id}
                className="flex min-h-52 flex-col justify-between rounded-2xl bg-[#fafafa] p-5 sm:p-6"
              >
                <h3 className="font-cormorant text-xl leading-tight font-medium text-[#292522] sm:text-2xl">
                  {card.title}
                </h3>
                <p className="mt-6 text-sm leading-5 text-[#77716d]">
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
