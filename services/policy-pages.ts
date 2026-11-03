import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { ApiError } from "@/lib/http";
import { hasRichTextContent, sanitizeRichTextContent } from "@/lib/blog-content";
import { prisma } from "@/lib/prisma";
import { invalidatePublicCache, PUBLIC_CACHE_TAGS } from "@/lib/public-cache";

export const POLICY_PAGES = [
  { slug: "terms-and-conditions", title: "Terms & Conditions" },
  { slug: "privacy-policy", title: "Privacy Policy" },
  { slug: "return-exchange-policy", title: "Return & Exchange Policy" },
  {
    slug: "shipping-payment-cancellation-policy",
    title: "Shipping, Payment & Cancellation Policy",
  },
  { slug: "refunds-policy", title: "Refunds Policy" },
] as const;

export type PolicyPageSlug = (typeof POLICY_PAGES)[number]["slug"];

export function isPolicyPageSlug(slug: string): slug is PolicyPageSlug {
  return POLICY_PAGES.some((page) => page.slug === slug);
}

export async function listPolicyPages() {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CACHE_TAGS.policies);
  const records = await prisma.policyPageContent.findMany({
    where: { slug: { in: POLICY_PAGES.map(({ slug }) => slug) } },
  });
  const contentBySlug = new Map(records.map(({ slug, content }) => [slug, content]));

  return POLICY_PAGES.map((page) => ({
    ...page,
    content: contentBySlug.get(page.slug) ?? "",
  }));
}

export async function getPolicyPageContent(slug: PolicyPageSlug) {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_CACHE_TAGS.policies);
  const record = await prisma.policyPageContent.findUnique({ where: { slug } });
  return record?.content ?? "";
}

export async function savePolicyPageContent(
  slug: string,
  content: string,
) {
  if (!isPolicyPageSlug(slug)) throw new ApiError(404, "Policy page not found");

  const safeContent = sanitizeRichTextContent(content);
  if (!hasRichTextContent(safeContent)) {
    throw new ApiError(400, "Policy content is required");
  }

  const savedContent = await prisma.policyPageContent.upsert({
    where: { slug },
    create: { slug, content: safeContent },
    update: { content: safeContent },
  });
  invalidatePublicCache(PUBLIC_CACHE_TAGS.policies);
  return savedContent;
}
