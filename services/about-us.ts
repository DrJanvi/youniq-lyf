import { ApiError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { invalidatePublicCache, PUBLIC_CACHE_TAGS } from "@/lib/public-cache";
import { aboutUsPageSettingSchema } from "@/lib/validation";
import { cacheLife, cacheTag } from "next/cache";
import "server-only";
import type { z } from "zod";

export const defaultAboutUsSettings = {
  heroHeading: "STYLE THAT\nMOVES WITH YOU",
  heroDescription:
    "Discover Youniq bags and Youniqlyf accessories designed to bring effortless style and everyday function to your wardrobe.",
  desktopImage: null,
  mobileImage: null,
  journeyHeading: "Made for Your Every Day",
  journeyDescription:
    "Youniqlyf is about finding the pieces that make getting ready feel easy. Explore bags and accessories that bring personal style and useful details together.",
  principlesHeading: "Our approach to everyday style.",
  principles: [
    {
      id: "mission",
      icon: "/assets/about-us/mission.svg",
      title: "Our Mission",
      description:
        "Bring together Youniq bags and accessories that help you carry what matters and express your own style.",
    },
    {
      id: "vision",
      icon: "/assets/about-us/vision.svg",
      title: "Our Vision",
      description:
        "Make it easy to find accessories that feel personal, versatile, and ready to go wherever the day takes you.",
    },
    {
      id: "values",
      icon: "/assets/about-us/values.svg",
      title: "Our Values",
      description:
        "We value thoughtful details, easy-to-wear style, and a shopping experience that keeps you in control.",
    },
  ],
  whoImage: null,
  whoHeading: "WHO WE ARE",
  whoSubheading: "Bags and accessories to make your look your own",
  whoParagraphs: [
    "Youniqlyf is a fashion brand for bags and accessories that bring a considered finishing touch to everyday dressing.",
    "Explore Youniq bags and Youniqlyf accessories selected to balance personal style with the details you reach for throughout the day.",
    "From everyday carry to the finishing touches, our collections are made to help you find pieces that work with your wardrobe and your routine.",
    "We believe the right accessory should feel like you: easy to style, useful to carry, and ready for the moments that make up your day.",
  ] as [string, string, string, string],
  whoBadge: "STYLE YOUR WAY",
  legacyImage: null,
  legacyHeading: "BAGS & ACCESSORIES FOR YOUR EVERYDAY",
  legacyIntro:
    "Youniqlyf brings together bags and accessories to help make everyday styling feel simple, expressive, and uniquely yours.",
  legacyParagraph1:
    "Find Youniq bags for the essentials you take along, and Youniqlyf accessories that add a personal touch to your look.",
  legacyParagraph2:
    "Whether you're getting ready for a busy day or planning a special occasion, explore versatile pieces that move with your plans.",
  legacyStats: [
    {
      id: "established",
      icon: "/assets/about-us/stat-established.svg",
      title: "Everyday Style",
    },
    {
      id: "manufacturing",
      icon: "/assets/about-us/stat-manufacturing.svg",
      title: "Useful Details",
    },
    {
      id: "workforce",
      icon: "/assets/about-us/stat-workforce.svg",
      title: "Versatile Picks",
    },
    {
      id: "varieties",
      icon: "/assets/about-us/stat-varieties.svg",
      title: "Youniq Collections",
    },
  ],
  whyChooseImage: null,
  whyChooseHeading: "WHY CHOOSE YOUNIQLYF?",
  whyChooseDescription:
    "Find Youniq bags and Youniqlyf accessories that bring together personal style, everyday use, and finishing touches for every occasion.",
  whyChooseCards: [
    {
      id: "everyday-style",
      title: "Everyday Style",
      description:
        "Discover bags and accessories that make it easy to add a little more of your personality to everyday outfits.",
    },
    {
      id: "thoughtful-details",
      title: "Thoughtful Details",
      description:
        "Explore useful details and versatile styles selected with the way you dress and carry your essentials in mind.",
    },
    {
      id: "bags-for-every-plan",
      title: "Bags for Every Plan",
      description:
        "From daily routines to plans worth dressing up for, find a Youniq bag that fits the moment and your look.",
    },
    {
      id: "accessorize-your-way",
      title: "Accessorize Your Way",
      description:
        "Make your style your own with Youniqlyf accessories that bring an outfit together, from the everyday to the occasional.",
    },
  ],
  milestones: [
    {
      year: "Everyday",
      title: "Made to Move",
      description: "Explore bags and accessories for the rhythm of your day.",
    },
    {
      year: "Versatile",
      title: "Easy to Style",
      description: "Find pieces that work with more of the looks you love.",
    },
    {
      year: "Details",
      title: "The Finishing Touch",
      description: "Discover accessories that bring your personal style together.",
    },
    {
      year: "Youniq",
      title: "Make It Your Own",
      description: "Choose the bags and accessories that feel like you.",
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

export type DeletedAboutUsItem = {
  id: string;
  kind: "principle" | "legacy-stat" | "why-choose-card";
  title: string;
  description: string | null;
  deletedAt: string;
};

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
    whyChooseCards:
      record.whyChooseCards.length === 4
        ? (record.whyChooseCards.map(({ id, title, description }) => ({
            id,
            title,
            description,
          })) as AboutUsPageSettings["whyChooseCards"])
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
      principles: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } },
      legacyStats: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
      },
      whyChooseCards: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  return settings ? toSettings(settings) : defaultAboutUsSettings;
}

export async function listDeletedAboutUsItems(): Promise<DeletedAboutUsItem[]> {
  const [principles, legacyStats, whyChooseCards] = await Promise.all([
    prisma.aboutUsPrinciple.findMany({
      where: { pageSettingId: "about-us", deletedAt: { not: null } },
      select: { id: true, title: true, description: true, deletedAt: true },
    }),
    prisma.aboutUsLegacyStat.findMany({
      where: { pageSettingId: "about-us", deletedAt: { not: null } },
      select: { id: true, title: true, deletedAt: true },
    }),
    prisma.aboutUsWhyChooseCard.findMany({
      where: { pageSettingId: "about-us", deletedAt: { not: null } },
      select: { id: true, title: true, description: true, deletedAt: true },
    }),
  ]);
  return [
    ...principles.flatMap((item) =>
      item.deletedAt
        ? [
            {
              id: item.id,
              kind: "principle" as const,
              title: item.title,
              description: item.description,
              deletedAt: item.deletedAt.toISOString(),
            },
          ]
        : [],
    ),
    ...legacyStats.flatMap((item) =>
      item.deletedAt
        ? [
            {
              id: item.id,
              kind: "legacy-stat" as const,
              title: item.title,
              description: null,
              deletedAt: item.deletedAt.toISOString(),
            },
          ]
        : [],
    ),
    ...whyChooseCards.flatMap((item) =>
      item.deletedAt
        ? [
            {
              id: item.id,
              kind: "why-choose-card" as const,
              title: item.title,
              description: item.description,
              deletedAt: item.deletedAt.toISOString(),
            },
          ]
        : [],
    ),
  ].sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
}

export async function restoreAboutUsItem(
  kind: DeletedAboutUsItem["kind"],
  id: string,
) {
  const result =
    kind === "principle"
      ? await prisma.aboutUsPrinciple.updateMany({
          where: { id, pageSettingId: "about-us", deletedAt: { not: null } },
          data: { deletedAt: null },
        })
      : kind === "legacy-stat"
        ? await prisma.aboutUsLegacyStat.updateMany({
            where: { id, pageSettingId: "about-us", deletedAt: { not: null } },
            data: { deletedAt: null },
          })
        : await prisma.aboutUsWhyChooseCard.updateMany({
            where: { id, pageSettingId: "about-us", deletedAt: { not: null } },
            data: { deletedAt: null },
          });
  if (!result.count) throw new ApiError(404, "Deleted About Us item not found");
  invalidatePublicCache(PUBLIC_CACHE_TAGS.aboutUs);
  return { restored: true };
}

export async function saveAboutUsPageSettings(input: AboutUsPageInput) {
  const fields = toDatabaseFields(input);
  const settings = await prisma.$transaction(async (transaction) => {
    await transaction.aboutUsPageSetting.upsert({
      where: { id: "about-us" },
      create: { id: "about-us", ...fields },
      update: fields,
    });
    const [existingPrinciples, existingStats, existingCards] =
      await Promise.all([
        transaction.aboutUsPrinciple.findMany({
          where: { pageSettingId: "about-us" },
        }),
        transaction.aboutUsLegacyStat.findMany({
          where: { pageSettingId: "about-us" },
        }),
        transaction.aboutUsWhyChooseCard.findMany({
          where: { pageSettingId: "about-us" },
        }),
      ]);

    const principleIds = new Set(
      input.principles.flatMap(({ id }) => (id ? [id] : [])),
    );
    const removedPrinciples = existingPrinciples
      .filter((item) => !item.deletedAt && !principleIds.has(item.id))
      .map(({ id }) => id);
    if (removedPrinciples.length) {
      await transaction.aboutUsPrinciple.updateMany({
        where: { id: { in: removedPrinciples }, deletedAt: null },
        data: { deletedAt: new Date() },
      });
    }
    for (const [sortOrder, principle] of input.principles.entries()) {
      const current = principle.id
        ? existingPrinciples.find((item) => item.id === principle.id)
        : undefined;
      if (current?.deletedAt)
        throw new ApiError(
          409,
          "Restore the deleted principle before editing it",
        );
      const data = {
        icon: principle.icon,
        title: principle.title,
        description: principle.description,
        sortOrder,
      };
      if (current) {
        await transaction.aboutUsPrinciple.update({
          where: { id: current.id },
          data,
        });
      } else {
        await transaction.aboutUsPrinciple.create({
          data: {
            ...data,
            ...(principle.id ? { id: principle.id } : {}),
            pageSettingId: "about-us",
          },
        });
      }
    }

    const statIds = new Set(
      input.legacyStats.flatMap(({ id }) => (id ? [id] : [])),
    );
    const removedStats = existingStats
      .filter((item) => !item.deletedAt && !statIds.has(item.id))
      .map(({ id }) => id);
    if (removedStats.length) {
      await transaction.aboutUsLegacyStat.updateMany({
        where: { id: { in: removedStats }, deletedAt: null },
        data: { deletedAt: new Date() },
      });
    }
    for (const [sortOrder, stat] of input.legacyStats.entries()) {
      const current = stat.id
        ? existingStats.find((item) => item.id === stat.id)
        : undefined;
      if (current?.deletedAt)
        throw new ApiError(
          409,
          "Restore the deleted legacy stat before editing it",
        );
      const data = { icon: stat.icon, title: stat.title, sortOrder };
      if (current) {
        await transaction.aboutUsLegacyStat.update({
          where: { id: current.id },
          data,
        });
      } else {
        await transaction.aboutUsLegacyStat.create({
          data: {
            ...data,
            ...(stat.id ? { id: stat.id } : {}),
            pageSettingId: "about-us",
          },
        });
      }
    }

    const cardIds = new Set(
      input.whyChooseCards.flatMap(({ id }) => (id ? [id] : [])),
    );
    const removedCards = existingCards
      .filter((item) => !item.deletedAt && !cardIds.has(item.id))
      .map(({ id }) => id);
    if (removedCards.length) {
      await transaction.aboutUsWhyChooseCard.updateMany({
        where: { id: { in: removedCards }, deletedAt: null },
        data: { deletedAt: new Date() },
      });
    }
    for (const [sortOrder, card] of input.whyChooseCards.entries()) {
      const current = card.id
        ? existingCards.find((item) => item.id === card.id)
        : undefined;
      if (current?.deletedAt)
        throw new ApiError(
          409,
          "Restore the deleted feature card before editing it",
        );
      const data = {
        title: card.title,
        description: card.description,
        sortOrder,
      };
      if (current) {
        await transaction.aboutUsWhyChooseCard.update({
          where: { id: current.id },
          data,
        });
      } else {
        await transaction.aboutUsWhyChooseCard.create({
          data: {
            ...data,
            ...(card.id ? { id: card.id } : {}),
            pageSettingId: "about-us",
          },
        });
      }
    }

    const settings = await transaction.aboutUsPageSetting.findUniqueOrThrow({
      where: { id: "about-us" },
      include: {
        principles: {
          where: { deletedAt: null },
          orderBy: { sortOrder: "asc" },
        },
        legacyStats: {
          where: { deletedAt: null },
          orderBy: { sortOrder: "asc" },
        },
        whyChooseCards: {
          where: { deletedAt: null },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    return toSettings(settings);
  });
  invalidatePublicCache(PUBLIC_CACHE_TAGS.aboutUs);
  return settings;
}
