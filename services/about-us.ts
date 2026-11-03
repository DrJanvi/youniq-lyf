import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { z } from "zod";
import { aboutUsPageSettingSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { invalidatePublicCache, PUBLIC_CACHE_TAGS } from "@/lib/public-cache";

export const defaultAboutUsSettings = {
  heroHeading: "THE ART OF\nFRAGRANCE, CRAFTED\nWITH PASSION",
  heroDescription:
    "Discover timeless fragrances crafted with passion, quality, and modern elegance.",
  desktopImage: null,
  mobileImage: null,
  journeyHeading: "Our Journey",
  journeyDescription:
    "Decades of experience shaped by a steady commitment to fragrance, care and thoughtful development.",
  principlesHeading: "The principles behind every creation.",
  principles: [
    {
      id: "mission",
      icon: "/assets/about-us/mission.svg",
      title: "Our Mission",
      description:
        "To create exceptional fragrances and personal care products through quality, innovation, and craftsmanship, delivering distinctive experiences that exceed customer expectations.",
    },
    {
      id: "vision",
      icon: "/assets/about-us/vision.svg",
      title: "Our Vision",
      description:
        "We honor the raw beauty of Arabian ingredients, selecting every note with care and preserving the character that makes it unique.",
    },
    {
      id: "values",
      icon: "/assets/about-us/values.svg",
      title: "Our Values",
      description:
        "We believe in uncompromising quality, creative excellence, integrity, and lasting customer relationships. Every fragrance reflects our commitment to consistency, originality, and trust.",
    },
  ],
  whoImage: null,
  whoHeading: "WHO WE ARE",
  whoSubheading: "Quality, Consistency, Creativity Beyond Expectations",
  whoParagraphs: [
    "Established in 1995 in Jebel Ali Free Zone, Buabed Banafa Perfumes brings decades of fragrance expertise, combining the richness of Arabian, African, and European scents with modern innovation.",
    "With manufacturing facilities in the UAE and Saudi Arabia, we specialize in perfumes, cosmetics, skincare, haircare, and personal care products, crafted to meet international quality standards.",
    "From signature fragrances to customized blends, every product is developed in-house with a commitment to quality, originality, and customer satisfaction.",
    "Our strategic marketing is based on our hard work and persistence, making our production compete with international brands on originality, clean compositions, and affordable prices.",
  ] as [string, string, string, string],
  whoBadge: "TRADITION REIMAGINED",
  legacyImage: null,
  legacyHeading: "A LEGACY OF FRAGRANCE SINCE 1995",
  legacyIntro:
    "Established in 1995 in Jebel Ali Free Zone, Buabed Banafa Perfumes was founded with a vision to create exceptional fragrances inspired by the richness of Arabian heritage and crafted to meet international quality standards.",
  legacyParagraph1:
    "With years of expertise in fragrance manufacturing, we have expanded our capabilities to include perfumes, cosmetics, skincare, haircare, personal care, and home fragrances. Our commitment to quality, innovation, and craftsmanship continues to shape every product we create.",
  legacyParagraph2:
    "Today, we continue to bring together traditional Arabian perfumery and modern manufacturing techniques to create distinctive fragrance experiences. From concept and development to production, our focus remains on quality, consistency, and delivering products that reflect our passion for perfumery.",
  legacyStats: [
    { id: "established", icon: "/assets/about-us/stat-established.svg", title: "Established" },
    { id: "manufacturing", icon: "/assets/about-us/stat-manufacturing.svg", title: "Manufacturing Expansion" },
    { id: "workforce", icon: "/assets/about-us/stat-workforce.svg", title: "Specialized Workforce" },
    { id: "varieties", icon: "/assets/about-us/stat-varieties.svg", title: "Fragrance Varieties" },
  ],
  whyChooseImage: null,
  whyChooseHeading: "WHY CHOOSE BUABED BANAFA?",
  whyChooseDescription:
    "Discover a world where fragrance heritage meets everyday luxury. From captivating perfumes to thoughtfully crafted personal care essentials, every creation brings a distinctive touch to your daily rituals.",
  whyChooseCards: [
    {
      id: "fragrance-expertise",
      title: "Decades Of Fragrance Expertise",
      description:
        "With decades of industry experience, we blend fragrance knowledge, craftsmanship, and tradition to create distinctive products with timeless appeal.",
    },
    {
      id: "quality-excellence",
      title: "Quality Excellence",
      description:
        "At Buabed Banafa, quality is at the heart of everything we do. From selecting ingredients to developing our products, we focus on delivering excellence, consistency, and attention to detail at every stage.",
    },
    {
      id: "crafted-in-house",
      title: "Crafted In-House",
      description:
        "Our in-house development and manufacturing capabilities bring creativity, expertise, and precision together at every stage. We focus on consistent quality, refined craftsmanship, and innovation to create products that reflect our commitment to excellence.",
    },
    {
      id: "world-of-fragrances",
      title: "A World Of Fragrances",
      description:
        "Inspired by the fragrance traditions of Arabia, Africa, and Europe, our collections bring together distinctive aromas, from warm woody notes to fresh floral and oriental blends, crafted to suit diverse preferences and occasions.",
    },
  ],
  milestones: [
    {
      year: "1995",
      title: "Established",
      description: "Founded in Jebel Ali Free Zone.",
    },
    {
      year: "2003",
      title: "Manufacturing Expansion",
      description:
        "Expanded manufacturing into personal care products in Saudi Arabia.",
    },
    {
      year: "500+",
      title: "Specialized Workforce",
      description:
        "A skilled team supporting production and product development.",
    },
    {
      year: "Today",
      title: "Fragrance Varieties",
      description:
        "A diverse fragrance portfolio inspired by tradition and modern trends.",
    },
  ],
} satisfies AboutUsPageSettings;

export type AboutUsPageSettings = {
  heroHeading: string;
  heroDescription: string;
  desktopImage: string | null;
  mobileImage: string | null;
  journeyHeading: string;
  journeyDescription: string;
  principlesHeading: string;
  principles: {
    id: string;
    icon: string;
    title: string;
    description: string;
  }[];
  whoImage: string | null;
  whoHeading: string;
  whoSubheading: string;
  whoParagraphs: [string, string, string, string];
  whoBadge: string;
  legacyImage: string | null;
  legacyHeading: string;
  legacyIntro: string;
  legacyParagraph1: string;
  legacyParagraph2: string;
  legacyStats: { id: string; icon: string; title: string }[];
  whyChooseImage: string | null;
  whyChooseHeading: string;
  whyChooseDescription: string;
  whyChooseCards: { id: string; title: string; description: string }[];
  milestones: { year: string; title: string; description: string }[];
};

export type AboutUsPageInput = z.infer<typeof aboutUsPageSettingSchema>;

function toSettings(record: {
  heroHeading: string;
  heroDescription: string;
  desktopImage: string | null;
  mobileImage: string | null;
  journeyHeading: string;
  journeyDescription: string;
  principlesHeading: string;
  principles: {
    id: string;
    icon: string;
    title: string;
    description: string;
  }[];
  whoImage: string | null;
  whoHeading: string;
  whoSubheading: string;
  whoParagraph1: string | null;
  whoParagraph2: string | null;
  whoParagraph3: string | null;
  whoParagraph4: string | null;
  whoBadge: string;
  legacyImage: string | null;
  legacyHeading: string;
  legacyIntro: string | null;
  legacyParagraph1: string | null;
  legacyParagraph2: string | null;
  legacyStats: { id: string; icon: string; title: string }[];
  whyChooseImage: string | null;
  whyChooseHeading: string;
  whyChooseDescription: string | null;
  whyChooseCards: { id: string; title: string; description: string }[];
  milestone1Year: string;
  milestone1Title: string;
  milestone1Description: string;
  milestone2Year: string;
  milestone2Title: string;
  milestone2Description: string;
  milestone3Year: string;
  milestone3Title: string;
  milestone3Description: string;
  milestone4Year: string;
  milestone4Title: string;
  milestone4Description: string;
}): AboutUsPageSettings {
  return {
    heroHeading: record.heroHeading,
    heroDescription: record.heroDescription,
    desktopImage: record.desktopImage,
    mobileImage: record.mobileImage,
    journeyHeading: record.journeyHeading,
    journeyDescription: record.journeyDescription,
    principlesHeading: record.principlesHeading,
    principles: record.principles.length
      ? record.principles.map(({ id, icon, title, description }) => ({
          id,
          icon,
          title,
          description,
        }))
      : defaultAboutUsSettings.principles,
    whoImage: record.whoImage,
    whoHeading: record.whoHeading,
    whoSubheading: record.whoSubheading,
    whoParagraphs: [
      record.whoParagraph1 ?? defaultAboutUsSettings.whoParagraphs[0],
      record.whoParagraph2 ?? defaultAboutUsSettings.whoParagraphs[1],
      record.whoParagraph3 ?? defaultAboutUsSettings.whoParagraphs[2],
      record.whoParagraph4 ?? defaultAboutUsSettings.whoParagraphs[3],
    ] as [string, string, string, string],
    whoBadge: record.whoBadge,
    legacyImage: record.legacyImage,
    legacyHeading: record.legacyHeading,
    legacyIntro: record.legacyIntro ?? defaultAboutUsSettings.legacyIntro,
    legacyParagraph1:
      record.legacyParagraph1 ?? defaultAboutUsSettings.legacyParagraph1,
    legacyParagraph2:
      record.legacyParagraph2 ?? defaultAboutUsSettings.legacyParagraph2,
    legacyStats: record.legacyStats.length
      ? record.legacyStats.map(({ id, icon, title }) => ({ id, icon, title }))
      : defaultAboutUsSettings.legacyStats,
    whyChooseImage: record.whyChooseImage,
    whyChooseHeading: record.whyChooseHeading,
    whyChooseDescription:
      record.whyChooseDescription ??
      defaultAboutUsSettings.whyChooseDescription,
    whyChooseCards: record.whyChooseCards.length === 4
      ? record.whyChooseCards.map(({ id, title, description }) => ({
          id,
          title,
          description,
        })) as AboutUsPageSettings["whyChooseCards"]
      : defaultAboutUsSettings.whyChooseCards,
    milestones: [
      {
        year: record.milestone1Year,
        title: record.milestone1Title,
        description: record.milestone1Description,
      },
      {
        year: record.milestone2Year,
        title: record.milestone2Title,
        description: record.milestone2Description,
      },
      {
        year: record.milestone3Year,
        title: record.milestone3Title,
        description: record.milestone3Description,
      },
      {
        year: record.milestone4Year,
        title: record.milestone4Title,
        description: record.milestone4Description,
      },
    ],
  };
}

function toDatabaseFields(input: AboutUsPageInput) {
  return {
    heroHeading: input.heroHeading,
    heroDescription: input.heroDescription,
    desktopImage: input.desktopImage,
    mobileImage: input.mobileImage,
    journeyHeading: input.journeyHeading,
    journeyDescription: input.journeyDescription,
    principlesHeading: input.principlesHeading,
    whoImage: input.whoImage,
    whoHeading: input.whoHeading,
    whoSubheading: input.whoSubheading,
    whoParagraph1: input.whoParagraphs[0],
    whoParagraph2: input.whoParagraphs[1],
    whoParagraph3: input.whoParagraphs[2],
    whoParagraph4: input.whoParagraphs[3],
    whoBadge: input.whoBadge,
    legacyImage: input.legacyImage,
    legacyHeading: input.legacyHeading,
    legacyIntro: input.legacyIntro,
    legacyParagraph1: input.legacyParagraph1,
    legacyParagraph2: input.legacyParagraph2,
    whyChooseImage: input.whyChooseImage,
    whyChooseHeading: input.whyChooseHeading,
    whyChooseDescription: input.whyChooseDescription,
    milestone1Year: input.milestones[0].year,
    milestone1Title: input.milestones[0].title,
    milestone1Description: input.milestones[0].description,
    milestone2Year: input.milestones[1].year,
    milestone2Title: input.milestones[1].title,
    milestone2Description: input.milestones[1].description,
    milestone3Year: input.milestones[2].year,
    milestone3Title: input.milestones[2].title,
    milestone3Description: input.milestones[2].description,
    milestone4Year: input.milestones[3].year,
    milestone4Title: input.milestones[3].title,
    milestone4Description: input.milestones[3].description,
  };
}

export async function getAboutUsPageSettings(): Promise<AboutUsPageSettings> {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CACHE_TAGS.aboutUs);
  const settings = await prisma.aboutUsPageSetting.findUnique({
    where: { id: "about-us" },
    include: {
      principles: { orderBy: { sortOrder: "asc" } },
      legacyStats: { orderBy: { sortOrder: "asc" } },
      whyChooseCards: { orderBy: { sortOrder: "asc" } },
    },
  });
  return settings ? toSettings(settings) : defaultAboutUsSettings;
}

export async function saveAboutUsPageSettings(input: AboutUsPageInput) {
  const fields = toDatabaseFields(input);
  const settings = await prisma.$transaction(async (transaction) => {
    await transaction.aboutUsPageSetting.upsert({
      where: { id: "about-us" },
      create: { id: "about-us", ...fields },
      update: fields,
    });
    await transaction.aboutUsPrinciple.deleteMany({
      where: { pageSettingId: "about-us" },
    });
    await transaction.aboutUsPrinciple.createMany({
      data: input.principles.map((principle, sortOrder) => ({
        ...principle,
        pageSettingId: "about-us",
        sortOrder,
      })),
    });
    await transaction.aboutUsLegacyStat.deleteMany({
      where: { pageSettingId: "about-us" },
    });
    await transaction.aboutUsLegacyStat.createMany({
      data: input.legacyStats.map((stat, sortOrder) => ({
        ...stat,
        pageSettingId: "about-us",
        sortOrder,
      })),
    });
    await transaction.aboutUsWhyChooseCard.deleteMany({
      where: { pageSettingId: "about-us" },
    });
    await transaction.aboutUsWhyChooseCard.createMany({
      data: input.whyChooseCards.map((card, sortOrder) => ({
        ...card,
        pageSettingId: "about-us",
        sortOrder,
      })),
    });
    const settings = await transaction.aboutUsPageSetting.findUniqueOrThrow({
      where: { id: "about-us" },
      include: {
        principles: { orderBy: { sortOrder: "asc" } },
        legacyStats: { orderBy: { sortOrder: "asc" } },
        whyChooseCards: { orderBy: { sortOrder: "asc" } },
      },
    });
    return toSettings(settings);
  });
  invalidatePublicCache(PUBLIC_CACHE_TAGS.aboutUs);
  return settings;
}
