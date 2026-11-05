import type { ListParams } from "@/lib/admin/list-params";
import {
  hasRichTextContent,
  sanitizeRichTextContent,
} from "@/lib/blog-content";
import { ApiError } from "@/lib/http";
import { paginated, type PageParams } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { invalidatePublicCache, PUBLIC_CACHE_TAGS } from "@/lib/public-cache";
import { slugify, uniqueSlug } from "@/lib/slug";
import { Prisma, type ContactFaqPage } from "@prisma/client";
import { cacheLife, cacheTag } from "next/cache";
import "server-only";

export const defaultContactSettings = {
  id: "contact-us",
  heading: "GET IN TOUCH",
  tagline:
    "Have a question about our products or your order? We'd love to hear from you.",
  contactHeading: "We're always close by.",
  contactIntro:
    "Whether you need help choosing a fragrance or have a question about an order, our team is ready to assist.",
  email: "info@buabedyouniqlyf.com",
  alternateEmail: null,
  phone: "+966 12 627 4600",
  whatsapp: "+966 55 565 5711",
  supportTitle: "Customer Support",
  supportDescription:
    "For product advice, order updates, returns, and wholesale enquiries.",
  image: null,
  imageAlt: "Youniqlyf Perfumes location",
};

function activeContactFaqs(page: ContactFaqPage) {
  return prisma.contactFaq.findMany({
    where: { isActive: true, page, deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getContactPageData() {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CACHE_TAGS.contact, PUBLIC_CACHE_TAGS.contactFaqs);
  const [settings, locations, faqs] = await Promise.all([
    prisma.contactPageSetting.findUnique({ where: { id: "contact-us" } }),
    prisma.contactLocation.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { city: "asc" }],
    }),
    activeContactFaqs("CONTACT"),
  ]);
  return { settings: settings ?? defaultContactSettings, locations, faqs };
}

export async function listActiveFaqs(page: ContactFaqPage) {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CACHE_TAGS.contactFaqs);
  return activeContactFaqs(page);
}

export async function saveContactPageSettings(input: {
  heading: string;
  tagline: string;
  contactHeading: string;
  contactIntro: string;
  email: string;
  alternateEmail?: string;
  phone: string;
  whatsapp?: string;
  supportTitle: string;
  supportDescription: string;
  image?: string;
  imageAlt: string;
}) {
  const settings = await prisma.contactPageSetting.upsert({
    where: { id: "contact-us" },
    create: {
      id: "contact-us",
      ...input,
      alternateEmail: input.alternateEmail ?? null,
      whatsapp: input.whatsapp ?? null,
      image: input.image ?? null,
    },
    update: {
      ...input,
      alternateEmail: input.alternateEmail ?? null,
      whatsapp: input.whatsapp ?? null,
      image: input.image ?? null,
    },
  });
  invalidatePublicCache(PUBLIC_CACHE_TAGS.contact);
  return settings;
}

export async function listContactLocations() {
  return prisma.contactLocation.findMany({
    orderBy: [{ sortOrder: "asc" }, { city: "asc" }],
  });
}

export async function createContactLocation(input: {
  city: string;
  country: string;
  company?: string;
  address: string;
  phone?: string;
  whatsapp?: string;
  sortOrder: number;
  isActive: boolean;
}) {
  const slug = await uniqueSlug(
    `${input.city}-${input.country}`,
    async (candidate) =>
      Boolean(
        await prisma.contactLocation.findUnique({ where: { slug: candidate } }),
      ),
  );
  const location = await prisma.contactLocation.create({
    data: { ...input, slug },
  });
  invalidatePublicCache(PUBLIC_CACHE_TAGS.contact);
  return location;
}

export async function updateContactLocation(
  id: string,
  input: {
    city: string;
    country: string;
    company?: string;
    address: string;
    phone?: string;
    whatsapp?: string;
    sortOrder: number;
    isActive: boolean;
  },
) {
  const existing = await prisma.contactLocation.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) throw new ApiError(404, "Location not found");
  const baseSlug = slugify(`${input.city}-${input.country}`);
  const slug = await uniqueSlug(baseSlug, async (candidate) => {
    const match = await prisma.contactLocation.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    return Boolean(match && match.id !== id);
  });
  const location = await prisma.contactLocation.update({
    where: { id },
    data: { ...input, slug },
  });
  invalidatePublicCache(PUBLIC_CACHE_TAGS.contact);
  return location;
}

export async function deleteContactLocation(id: string) {
  const result = await prisma.contactLocation.updateMany({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  if (!result.count) throw new ApiError(404, "Location not found");
  invalidatePublicCache(PUBLIC_CACHE_TAGS.contact);
}

export async function restoreContactLocation(id: string) {
  const result = await prisma.contactLocation.updateMany({
    where: { id, deletedAt: { not: null } },
    data: { deletedAt: null },
  });
  if (!result.count) throw new ApiError(404, "Deleted location not found");
  invalidatePublicCache(PUBLIC_CACHE_TAGS.contact);
  return { restored: true };
}

export async function listContactFaqs() {
  return prisma.contactFaq.findMany({
    orderBy: [{ page: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function createContactFaq(input: {
  question: string;
  answer: string;
  page: ContactFaqPage;
  sortOrder: number;
  isActive: boolean;
}) {
  const answer = sanitizeRichTextContent(input.answer);
  if (!hasRichTextContent(answer))
    throw new ApiError(400, "FAQ answer is required");
  const faq = await prisma.contactFaq.create({ data: { ...input, answer } });
  invalidatePublicCache(PUBLIC_CACHE_TAGS.contactFaqs);
  return faq;
}

export async function updateContactFaq(
  id: string,
  input: {
    question: string;
    answer: string;
    page: ContactFaqPage;
    sortOrder: number;
    isActive: boolean;
  },
) {
  const answer = sanitizeRichTextContent(input.answer);
  if (!hasRichTextContent(answer))
    throw new ApiError(400, "FAQ answer is required");
  const result = await prisma.contactFaq.updateMany({
    where: { id },
    data: { ...input, answer },
  });
  if (!result.count) throw new ApiError(404, "FAQ not found");
  const faq = await prisma.contactFaq.findUniqueOrThrow({ where: { id } });
  invalidatePublicCache(PUBLIC_CACHE_TAGS.contactFaqs);
  return faq;
}

export async function deleteContactFaq(id: string) {
  const result = await prisma.contactFaq.updateMany({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  if (!result.count) throw new ApiError(404, "FAQ not found");
  invalidatePublicCache(PUBLIC_CACHE_TAGS.contactFaqs);
}

export async function restoreContactFaq(id: string) {
  const result = await prisma.contactFaq.updateMany({
    where: { id, deletedAt: { not: null } },
    data: { deletedAt: null },
  });
  if (!result.count) throw new ApiError(404, "Deleted FAQ not found");
  invalidatePublicCache(PUBLIC_CACHE_TAGS.contactFaqs);
  return { restored: true };
}
export async function createContactSubmission(input: {
  fullName: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  consent: boolean;
}) {
  return prisma.contactSubmission.create({ data: input, select: { id: true } });
}

export async function listContactSubmissions(
  page: PageParams,
  params: ListParams,
) {
  const readFilter = params.filters.read;
  const where: Prisma.ContactSubmissionWhereInput = {
    ...(readFilter === "read"
      ? { readAt: { not: null } }
      : readFilter === "unread"
        ? { readAt: null }
        : {}),
    ...(params.q
      ? {
          OR: [
            { fullName: { contains: params.q } },
            { email: { contains: params.q } },
            { phone: { contains: params.q } },
            { subject: { contains: params.q } },
            { message: { contains: params.q } },
          ],
        }
      : {}),
  };
  const orderBy: Prisma.ContactSubmissionOrderByWithRelationInput = {
    [params.sort]: params.dir,
  };
  const [rows, total] = await Promise.all([
    prisma.contactSubmission.findMany({
      where,
      orderBy: [orderBy, { id: "asc" }],
      skip: page.skip,
      take: page.limit,
    }),
    prisma.contactSubmission.count({ where }),
  ]);
  return paginated(rows, total, page);
}

export async function setContactSubmissionRead(id: string, read: boolean) {
  const result = await prisma.contactSubmission.updateMany({
    where: { id },
    data: { readAt: read ? new Date() : null },
  });
  if (!result.count) throw new ApiError(404, "Message not found");
  return prisma.contactSubmission.findUniqueOrThrow({ where: { id } });
}
