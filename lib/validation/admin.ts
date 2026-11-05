import { hasBlogContentText } from "@/lib/blog";
import { z } from "zod";

/**
 * Client-side form schemas for the admin dashboard (React Hook Form).
 * Text inputs stay strings (empty = not provided); the API schemas in ./index.ts remain authoritative.
 */
const requiredUrl = (label: string) =>
  z.string().trim().min(1, `${label} is required`).max(1000, `${label} is too long`).refine((v) => URL.canParse(v), `${label} must be a valid URL`);
const optionalText = (label: string, max: number) => z.string().trim().max(max, `${label} must be at most ${max} characters`);
const price = (label: string) =>
  z.number({ error: `${label} is required` }).min(0, `${label} cannot be negative`).max(10_000_000, `${label} is too large`);

export const adminLoginFormSchema = z.object({
  username: z.string().trim().min(1, "User id is required").max(100, "User id is too long"),
  password: z.string().min(1, "Password is required").max(200, "Password is too long"),
});

export const nameFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name must be at most 120 characters"),
  slug: z.string().trim().max(120, "Slug is too long").regex(/^[a-z0-9]*(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
});

export const categoryFormSchema = nameFormSchema.extend({
  image: requiredUrl("Image URL"),
  description: optionalText("Description", 5000),
  seoTitle: optionalText("SEO title", 190),
  seoDescription: optionalText("SEO description", 300),
});

export const productFormSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(250, "Title must be at most 250 characters"),
  slug: nameFormSchema.shape.slug,
  description: z.string().trim().min(1, "Description is required"),
  images: z
    .string()
    .refine((v) => v.split("\n").map((s) => s.trim()).filter(Boolean).every((s) => URL.canParse(s)), "Every line must be a valid URL")
    .refine((v) => v.split("\n").filter((s) => s.trim()).length <= 20, "At most 20 images"),
  aboutPoints: z
    .string()
    .refine(
      (value) =>
        value
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean)
          .every((line) => {
            const [title, ...description] = line.split("|");
            return Boolean(title?.trim() && description.join("|").trim());
          }),
      "Use one point per line in the format: title | explanation",
    )
    .refine(
      (value) => value.split(/\r?\n/).filter((line) => line.trim()).length <= 10,
      "At most 10 points",
    ),
  aboutIntro: z.string().trim().max(600, "Intro must be at most 600 characters"),
  price: price("Price"),
  currency: z.string().trim().length(3, "Use a 3-letter currency code").transform((v) => v.toUpperCase()),
  stock: z.number({ error: "Stock is required" }).int("Stock must be a whole number").min(0, "Stock cannot be negative"),
  variants: z.array(
    z.object({
      id: z.string().uuid().optional(),
      name: z.string().trim().min(1, "Variant name is required").max(120),
      color: z.string().regex(/^#[\da-fA-F]{6}$/, "Use a 6-digit hex color"),
      images: z
        .string()
        .refine((value) => value.split("\n").map((line) => line.trim()).filter(Boolean).every((url) => URL.canParse(url)), "Every line must be a valid URL")
        .refine((value) => value.split("\n").filter((line) => line.trim()).length <= 20, "At most 20 images"),
      priceOverride: z.number().min(0, "Price cannot be negative").max(10_000_000, "Price is too large").optional(),
      stock: z.number({ error: "Stock is required" }).int("Stock must be a whole number").min(0, "Stock cannot be negative"),
      isActive: z.boolean(),
    }),
  ).max(50, "At most 50 color variants"),
  gender: z.enum(["UNISEX", "MALE", "FEMALE"]),
  isActive: z.boolean(),
  categoryId: z.string().min(1, "Select a category"),
  brandId: z.string(),
  productTypeId: z.string(),
  presetTags: z.array(z.string()),
  tags: z.string().refine((v) => v.split(",").map((s) => s.trim()).filter(Boolean).every((s) => s.length <= 50), "Each tag must be at most 50 characters"),
  seoTitle: optionalText("SEO title", 190),
  seoDescription: optionalText("SEO description", 300),
});

export const discountFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(120, "Name must be at most 120 characters"),
    type: z.enum(["PERCENT", "FIXED"]),
    value: z.number({ error: "Value is required" }).positive("Value must be greater than 0"),
    target: z.enum(["STORE", "PRODUCT", "CATEGORY"]),
    productId: z.string(),
    categoryId: z.string(),
    startsAt: z.string(),
    endsAt: z.string(),
    isActive: z.boolean(),
  })
  .superRefine((d, ctx) => {
    if (d.type === "PERCENT" && d.value > 100) ctx.addIssue({ code: "custom", path: ["value"], message: "Percent cannot exceed 100" });
    if (d.target === "PRODUCT" && !d.productId) ctx.addIssue({ code: "custom", path: ["productId"], message: "Select a product" });
    if (d.target === "CATEGORY" && !d.categoryId) ctx.addIssue({ code: "custom", path: ["categoryId"], message: "Select a category" });
    if (d.startsAt && d.endsAt && new Date(d.startsAt) >= new Date(d.endsAt)) {
      ctx.addIssue({ code: "custom", path: ["endsAt"], message: "End must be after start" });
    }
  });

export const couponFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .min(3, "Code must be at least 3 characters")
      .max(64, "Code must be at most 64 characters")
      .regex(/^[A-Z0-9][A-Z0-9_-]*$/, "Use letters, numbers, hyphens, or underscores"),
    type: z.enum(["PERCENT", "FIXED"]),
    value: z.number({ error: "Value is required" }).positive("Value must be greater than 0").max(10_000_000, "Value is too large"),
    minimumSubtotal: z.number().min(0, "Minimum spend cannot be negative").max(10_000_000, "Minimum spend is too large").optional(),
    maxDiscount: z.number().positive("Maximum discount must be greater than 0").max(10_000_000, "Maximum discount is too large").optional(),
    startsAt: z.string(),
    endsAt: z.string(),
    isActive: z.boolean(),
  })
  .superRefine((coupon, ctx) => {
    if (coupon.type === "PERCENT" && coupon.value > 100) {
      ctx.addIssue({ code: "custom", path: ["value"], message: "Percent cannot exceed 100" });
    }
    if (coupon.startsAt && coupon.endsAt && new Date(coupon.startsAt) >= new Date(coupon.endsAt)) {
      ctx.addIssue({ code: "custom", path: ["endsAt"], message: "End must be after start" });
    }
  });

export const heroBannerFormSchema = z.object({
  desktopImage: requiredUrl("Desktop image"),
  mobileImage: z.string().trim().url("Enter a valid URL").max(1000).or(z.literal("")),
  link: z.string().trim().min(1, "Link is required").max(1000).refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), "Enter a full URL or a path starting with /"),
  alt: optionalText("Alt text", 190),
  sortOrder: z.number({ error: "Sort order is required" }).int("Must be a whole number").min(0, "Cannot be negative"),
});

export const highlightedPostFormSchema = z.object({
  image: requiredUrl("Image URL"),
  link: requiredUrl("Link"),
  alt: optionalText("Alt text", 190),
  sortOrder: z.number({ error: "Sort order is required" }).int("Must be a whole number").min(0, "Cannot be negative"),
});

export const blogArticleFormSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(255, "Title must be at most 255 characters"),
  category: z.string().min(1, "Select a category"),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date"),
  readTime: z.number({ error: "Read time is required" }).int("Must be a whole number").min(1, "Must be at least 1 minute").max(240, "Must be at most 240 minutes"),
  excerpt: z.string().trim().min(1, "Short description is required").max(320, "Short description must be at most 320 characters"),
  image: requiredUrl("Image URL"),
  content: z
    .string()
    .trim()
    .min(1, "Full content is required")
    .max(100_000, "Content is too long")
    .refine(hasBlogContentText, "Full content is required"),
});

export const highlightedCategoryFormSchema = z
  .object({
    image: requiredUrl("Image URL"),
    title: z.string().trim().min(1, "Title is required").max(255, "Title must be at most 255 characters"),
    description: z.string().trim().min(1, "Description is required").max(5000, "Description must be at most 5000 characters"),
    buttonLink: z
      .string()
      .trim()
      .min(1, "Button link is required")
      .max(1000, "Button link is too long")
      .refine(
        (value) =>
          (value.startsWith("/") && !value.startsWith("//")) ||
          (URL.canParse(value) && ["http:", "https:"].includes(new URL(value).protocol)),
        "Enter an internal path or a valid HTTP(S) URL",
      ),
    days: z.number({ error: "Days are required" }).int("Must be a whole number").min(0).max(3650),
    hours: z.number({ error: "Hours are required" }).int("Must be a whole number").min(0).max(23),
    minutes: z.number({ error: "Minutes are required" }).int("Must be a whole number").min(0).max(59),
    seconds: z.number({ error: "Seconds are required" }).int("Must be a whole number").min(0).max(59),
    isEnabled: z.boolean(),
    autoRestart: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.days + values.hours + values.minutes + values.seconds === 0) {
      ctx.addIssue({ code: "custom", path: ["seconds"], message: "Timer duration must be greater than zero" });
    }
  });

export const reviewFormSchema = z.object({
  productId: z.string().min(1, "Select a product"),
  authorName: z.string().trim().min(1, "Author name is required").max(100, "Author name must be at most 100 characters"),
  rating: z.number({ error: "Rating is required" }).int("Rating must be a whole number").min(1, "Minimum rating is 1").max(5, "Maximum rating is 5"),
  body: z.string().trim().min(1, "Review text is required").max(5000, "Review must be at most 5000 characters"),
  status: z.enum(["PENDING", "APPROVED", "HIDDEN"]),
});

export const orderDecisionFormSchema = z.object({
  adminNote: optionalText("Note", 1000),
});
