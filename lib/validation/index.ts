import { z } from "zod";
import { BLOG_CATEGORIES, hasBlogContentText } from "@/lib/blog";
import { partnerCountryCallingCodes } from "@/lib/partner-countries";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));

export const emailSchema = z.string().trim().toLowerCase().email().max(190);

const nameSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .min(2, `${label} must be at least 2 characters`)
    .max(50, `${label} must be at most 50 characters`)
    .regex(/^[\p{L}\p{M}][\p{L}\p{M}\s'.-]*$/u, `${label} contains invalid characters`);

const phonePattern = /^\+?[0-9][0-9\s().-]*$/;
const MIN_PHONE_DIGITS = 7;
export const MAX_PHONE_DIGITS = 15;

const countPhoneDigits = (phone: string) => phone.replace(/\D/g, "").length;

export function limitPhoneDigits(phone: string, maxDigits = MAX_PHONE_DIGITS) {
  let digitCount = 0;
  return phone.replace(/\d/g, (digit) => {
    if (digitCount >= maxDigits) return "";
    digitCount += 1;
    return digit;
  });
}

const phoneSchema = z
  .string()
  .trim()
  .max(40, "Phone number is too long")
  .regex(phonePattern, "Enter a valid phone number")
  .refine(
    (phone) => countPhoneDigits(phone) >= MIN_PHONE_DIGITS,
    `Phone number must contain at least ${MIN_PHONE_DIGITS} digits`,
  )
  .refine(
    (phone) => countPhoneDigits(phone) <= MAX_PHONE_DIGITS,
    `Phone number cannot contain more than ${MAX_PHONE_DIGITS} digits`,
  );

const userGenderSchema = z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]);

export const todayDateOnly = () => new Date().toISOString().slice(0, 10);

const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, "Enter a valid date")
  .refine((value) => value <= todayDateOnly(), "Date of birth cannot be in the future");

export const customerEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .max(190, "Email is too long")
  .email("Enter a valid email address");

export const newPasswordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Must be at least 8 characters")
  .max(72, "Must be at most 72 characters")
  .regex(/[A-Za-z]/, "Must contain at least one letter")
  .regex(/\d/, "Must contain at least one number");

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required")
      .max(72, "Password is too long"),
    newPassword: newPasswordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password").max(72),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const deleteAccountSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Current password is required")
    .max(72, "Password is too long"),
});

export const customerLoginSchema = z.object({
  email: customerEmailSchema,
  password: z.string().min(1, "Password is required").max(72, "Password is too long"),
});

export const registerSchema = z.object({
  firstName: nameSchema("First name"),
  lastName: nameSchema("Last name"),
  email: customerEmailSchema,
  phone: phoneSchema,
  gender: userGenderSchema,
  dateOfBirth: dateOnlySchema,
  password: newPasswordSchema,
});

const fullNameSchema = z
  .string()
  .trim()
  .min(2, "Full name must be at least 2 characters")
  .max(100, "Full name must be at most 100 characters")
  .regex(/^[\p{L}\p{M}][\p{L}\p{M}\s'.-]*$/u, "Full name contains invalid characters");

export const accountDetailsSchema = z.object({
  name: fullNameSchema,
  phone: z.union([z.literal(""), phoneSchema]),
  gender: z.union([z.literal(""), userGenderSchema]),
  dateOfBirth: z.union([z.literal(""), dateOnlySchema]),
});

export const otpCodeSchema = z.string().regex(/^\d{6}$/, "Enter the 6-digit code");
export const registerVerifySchema = registerSchema.extend({ code: otpCodeSchema });
export const adminLoginSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(200),
});

export const productInputSchema = z.object({
  title: z.string().trim().min(2).max(250),
  slug: optionalText,
  description: z.string().trim().min(1),
  images: z.array(z.string().url()).max(20).default([]),
  aboutPoints: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(120),
        description: z.string().trim().min(1).max(1000),
      }),
    )
    .max(10)
    .default([]),
  aboutIntro: z.string().trim().max(600).nullish(),
  price: z.coerce.number().nonnegative().max(10_000_000),
  currency: z.string().trim().length(3).default("AED"),
  stock: z.coerce.number().int().min(0).default(0),
  gender: z.enum(["MALE", "FEMALE", "UNISEX"]).default("UNISEX"),
  isActive: z.boolean().default(true),
  seoTitle: optionalText,
  seoDescription: optionalText,
  categoryId: z.string().min(1),
  brandId: z.string().nullish(),
  productTypeId: z.string().nullish(),
  tags: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
});
export const productUpdateSchema = productInputSchema.partial();

export const nameInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: optionalText,
});
export const categoryInputSchema = nameInputSchema.extend({
  image: z.string().trim().url().max(191),
  description: optionalText,
  seoTitle: optionalText,
  seoDescription: optionalText,
});

export const discountInputSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    type: z.enum(["PERCENT", "FIXED"]),
    value: z.coerce.number().positive(),
    startsAt: z.coerce.date().nullish(),
    endsAt: z.coerce.date().nullish(),
    isActive: z.boolean().default(true),
    productId: z.string().nullish(),
    categoryId: z.string().nullish(),
  })
  .refine((d) => d.type !== "PERCENT" || d.value <= 100, { message: "Percent must be <= 100" })
  .refine((d) => !(d.productId && d.categoryId), { message: "Target a product or a category, not both" })
  .refine((d) => !d.startsAt || !d.endsAt || d.startsAt < d.endsAt, { message: "endsAt must be after startsAt" });

const couponCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .min(3, "Coupon code must be at least 3 characters")
  .max(64, "Coupon code must be at most 64 characters")
  .regex(/^[A-Z0-9][A-Z0-9_-]*$/, "Use letters, numbers, hyphens, or underscores");
const optionalCouponAmount = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().nonnegative().max(10_000_000).optional(),
);

export const couponInputSchema = z
  .object({
    code: couponCodeSchema,
    type: z.enum(["PERCENT", "FIXED"]),
    value: z.coerce.number().positive().max(10_000_000),
    minimumSubtotal: optionalCouponAmount,
    maxDiscount: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.coerce.number().positive().max(10_000_000).optional(),
    ),
    startsAt: z.coerce.date().nullish(),
    endsAt: z.coerce.date().nullish(),
    isActive: z.boolean().default(true),
  })
  .superRefine((coupon, ctx) => {
    if (coupon.type === "PERCENT" && coupon.value > 100) {
      ctx.addIssue({ code: "custom", path: ["value"], message: "Percent cannot exceed 100" });
    }
    if (coupon.type === "FIXED" && coupon.maxDiscount !== undefined) {
      ctx.addIssue({ code: "custom", path: ["maxDiscount"], message: "Maximum discount applies to percentage coupons only" });
    }
    if (coupon.startsAt && coupon.endsAt && coupon.startsAt >= coupon.endsAt) {
      ctx.addIssue({ code: "custom", path: ["endsAt"], message: "End must be after start" });
    }
  });
export const couponCodeInputSchema = z.object({ code: couponCodeSchema });

export const reviewInputSchema = z.object({
  productId: z.string().min(1),
  authorName: z.string().trim().min(1).max(100),
  authorEmail: z.string().trim().email().max(190).optional(),
  rating: z.coerce.number().int().min(1).max(5),
  title: optionalText,
  body: z.string().trim().min(1).max(5000),
});
export const publicReviewInputSchema = reviewInputSchema.extend({
  authorEmail: z.string().trim().email("Enter a valid email").max(190),
  title: z.string().trim().min(1, "Title is required").max(150),
});
export const adminReviewInputSchema = reviewInputSchema.extend({
  status: z.enum(["PENDING", "APPROVED", "HIDDEN"]).default("APPROVED"),
  createdAt: z.coerce.date().optional(),
});
export const reviewStatusSchema = z.object({ status: z.enum(["PENDING", "APPROVED", "HIDDEN"]) });

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(99),
});
export const cartMergeSchema = z.object({ items: z.array(cartItemSchema).max(100) });
export const wishlistItemSchema = z.object({ productId: z.string().min(1) });

export const savedAddressSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(5).max(30),
  addressLine: z.string().trim().min(5).max(1000),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  country: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().min(2).max(20),
  isDefault: z.boolean().optional(),
});

export const checkoutSchema = z.object({
  addressId: z.string().uuid(),
  paymentMethod: z.enum(["CASH_ON_DELIVERY", "RAZORPAY", "PAYU"]),
  couponCode: couponCodeSchema.optional(),
});
export const orderDecisionSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  adminNote: optionalText,
});
const deliveryNote = z.string().trim().max(1000).transform((value) => value || undefined).optional();
const deliveryTrackingUrl = z
  .string()
  .trim()
  .max(1000)
  .transform((value) => value || undefined)
  .optional()
  .refine(
    (value) => !value || (URL.canParse(value) && ["http:", "https:"].includes(new URL(value).protocol)),
    "Enter a valid HTTP(S) tracking link",
  );
export const orderDeliveryUpdateSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("DISPATCHED"),
    deliveryPartner: z.string().trim().min(1).max(120),
    deliveryReferenceId: z.string().trim().min(1).max(120),
    deliveryTrackingUrl,
  }),
  z.object({ status: z.literal("OUT_FOR_DELIVERY") }),
  z.object({ status: z.literal("DELIVERED"), notes: deliveryNote }),
  z.object({
    status: z.literal("DELIVERY_ATTEMPT_FAILED"),
    notes: z.string().trim().min(1, "Notes are required for a failed delivery attempt").max(1000),
  }),
]);
export const orderAdminUpdateSchema = z.union([orderDecisionSchema, orderDeliveryUpdateSchema]);
export type OrderDeliveryUpdate = z.infer<typeof orderDeliveryUpdateSchema>;

const bannerLink = z.string().trim().max(1000).refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), "Enter a full URL or a path starting with /");

export const heroBannerSchema = z.object({
  desktopImage: z.string().trim().url().max(1000),
  mobileImage: z.string().trim().url().max(1000).optional(),
  link: bannerLink,
  alt: optionalText,
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const highlightedPostSchema = z.object({
  image: z.string().trim().url().max(1000),
  link: z.string().trim().url().max(1000),
  alt: optionalText,
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const blogArticleSchema = z.object({
  title: z.string().trim().min(2).max(255),
  category: z.enum(BLOG_CATEGORIES),
  publishedAt: z.coerce.date(),
  readTime: z.coerce.number().int().min(1).max(240),
  excerpt: z.string().trim().min(1).max(320),
  image: z.string().trim().url().max(1000),
  content: z
    .string()
    .trim()
    .min(1)
    .max(100_000)
    .refine(hasBlogContentText, "Full content is required"),
});

export const highlightedCategorySchema = z
  .object({
    image: z.string().trim().url().max(1000),
    title: z.string().trim().min(1).max(255),
    description: z.string().trim().min(1).max(5000),
    buttonLink: z
      .string()
      .trim()
      .min(1)
      .max(1000)
      .refine(
        (value) =>
          (value.startsWith("/") && !value.startsWith("//")) ||
          (URL.canParse(value) && ["http:", "https:"].includes(new URL(value).protocol)),
        "Enter an internal path or a valid HTTP(S) URL",
      ),
    durationSeconds: z.coerce.number().int().min(1).max(315_446_399),
    isEnabled: z.boolean(),
    autoRestart: z.boolean(),
  }  );

export const contactSubjects = [
  "Order enquiry",
  "Product information",
  "Shipping and delivery",
  "Returns and exchanges",
  "Wholesale enquiry",
  "Other",
] as const;

const contactPhoneSchema = z
  .string()
  .trim()
  .min(7, "Enter a valid phone number")
  .max(30, "Phone number is too long")
  .regex(/^\+?[\d\s().-]+$/, "Enter a valid phone number")
  .refine((value) => {
    const digits = value.replace(/\D/g, "").length;
    return digits >= 7 && digits <= 15;
  }, "Phone number must contain 7 to 15 digits");

export const contactSubmissionSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100, "Name must be at most 100 characters"),
  phone: contactPhoneSchema,
  email: customerEmailSchema,
  subject: z.enum(contactSubjects, { error: "Select a subject" }),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000, "Message must be at most 5000 characters"),
  consent: z.boolean().refine((accepted) => accepted, "Please agree before sending your enquiry"),
});

export const partnerInterestValues = ["DISTRIBUTOR", "INFLUENCER_CREATOR", "OTHER"] as const;

export const partnerInterestOptions = [
  { value: partnerInterestValues[0], label: "Distributor", description: "Bring our collection to new markets." },
  { value: partnerInterestValues[1], label: "Influencer / Creator", description: "Create beautiful stories with us." },
  { value: partnerInterestValues[2], label: "Others", description: "Explore every opportunity." },
] as const;

export const partnerRequestSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Enter your full name")
      .max(100, "Name must be at most 100 characters")
      .regex(/^[\p{L}\p{M}][\p{L}\p{M}\s'.-]*$/u, "Enter a valid name"),
    countryCode: z
      .string()
      .trim()
      .regex(/^\+\d{1,3}$/, "Select a valid country code")
      .refine((value) => partnerCountryCallingCodes.has(value), "Select a valid country code"),
    phoneNumber: z
      .string()
      .trim()
      .min(1, "Enter your mobile number")
      .max(30, "Mobile number is too long")
      .regex(/^[\d\s().-]+$/, "Enter a valid mobile number")
      .transform((value) => value.replace(/\D/g, "")),
    interest: z.enum(partnerInterestValues, { error: "Select an area of interest" }),
  })
  .superRefine((value, context) => {
    const totalDigits = value.countryCode.length - 1 + value.phoneNumber.length;
    if (totalDigits < 7 || totalDigits > 15) {
      context.addIssue({
        code: "custom",
        path: ["phoneNumber"],
        message: "Mobile number must contain 7 to 15 digits, including the country code",
      });
    }
  });

export const careerJobRoleValues = [
  "MARKETING",
  "SALES",
  "E_COMMERCE",
  "OPERATIONS",
  "OTHER",
] as const;

export const careerJobRoleOptions = [
  { value: "MARKETING", label: "Marketing" },
  { value: "SALES", label: "Sales" },
  { value: "E_COMMERCE", label: "E-commerce" },
  { value: "OPERATIONS", label: "Operations" },
  { value: "OTHER", label: "Other" },
] as const;

export const careerApplicationSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Enter your full name")
      .max(100, "Name must be at most 100 characters")
      .regex(/^[\p{L}\p{M}][\p{L}\p{M}\s'.-]*$/u, "Enter a valid name"),
    email: customerEmailSchema,
    jobRole: z.enum(careerJobRoleValues, { error: "Select a job role" }),
    countryCode: z
      .string()
      .trim()
      .regex(/^\+\d{1,3}$/, "Select a valid country code")
      .refine((value) => partnerCountryCallingCodes.has(value), "Select a valid country code"),
    phoneNumber: z
      .string()
      .trim()
      .min(1, "Enter your mobile number")
      .max(30, "Mobile number is too long")
      .regex(/^[\d\s().-]+$/, "Enter a valid mobile number")
      .transform((value) => value.replace(/\D/g, "")),
    consent: z.boolean().refine((accepted) => accepted, "Please agree before submitting your application"),
  })
  .superRefine((value, context) => {
    const totalDigits = value.countryCode.length - 1 + value.phoneNumber.length;
    if (totalDigits < 7 || totalDigits > 15) {
      context.addIssue({
        code: "custom",
        path: ["phoneNumber"],
        message: "Mobile number must contain 7 to 15 digits, including the country code",
      });
    }
  });

export const careerPageSettingSchema = z.object({
  imageUrl: z
    .string()
    .trim()
    .max(1000, "Image URL must be at most 1000 characters")
    .nullable()
    .refine(
      (value) =>
        value === null ||
        (URL.canParse(value) &&
          new URL(value).protocol === "https:" &&
          new URL(value).hostname === "res.cloudinary.com"),
      "Select a secure Cloudinary image or use the placeholder",
    ),
});

const optionalContactText = (max: number) =>
  z.string().trim().max(max).transform((value) => value || undefined);

const contactImageUrl = z
  .string()
  .trim()
  .max(1000, "Image URL is too long")
  .refine(
    (value) =>
      !value ||
      (value.startsWith("/") && !value.startsWith("//")) ||
      (URL.canParse(value) && ["http:", "https:"].includes(new URL(value).protocol)),
    "Enter a relative image path or a valid HTTP(S) URL",
  )
  .transform((value) => value || undefined);

export const contactPageSettingSchema = z.object({
  heading: z.string().trim().min(1).max(120),
  tagline: z.string().trim().min(1).max(500),
  contactHeading: z.string().trim().min(1).max(200),
  contactIntro: z.string().trim().min(1).max(5000),
  email: customerEmailSchema,
  alternateEmail: z.union([customerEmailSchema, z.literal("")]).optional().transform((value) => value || undefined),
  phone: contactPhoneSchema,
  whatsapp: optionalContactText(40),
  supportTitle: z.string().trim().min(1).max(120),
  supportDescription: z.string().trim().min(1).max(500),
  image: contactImageUrl,
  imageAlt: z.string().trim().max(255),
});

export const contactLocationSchema = z.object({
  city: z.string().trim().min(1).max(120),
  country: z.string().trim().min(1).max(120),
  company: optionalContactText(190),
  address: z.string().trim().min(1).max(2000),
  phone: optionalContactText(40),
  whatsapp: optionalContactText(40),
  sortOrder: z.coerce.number().int().min(0).max(10000),
  isActive: z.boolean(),
});

export const contactFaqSchema = z.object({
  question: z.string().trim().min(1).max(500),
  answer: z.string().trim().min(1).max(30_000),
  page: z.enum(["CONTACT", "FAQ_PAGE"]),
  sortOrder: z.coerce.number().int().min(0).max(10000),
  isActive: z.boolean(),
});

export const policyPageContentSchema = z.object({
  content: z.string().trim().min(1, "Content is required").max(500_000),
});

export const contactSubmissionReadSchema = z.object({ read: z.boolean() });

const aboutImageUrl = z
  .string()
  .trim()
  .max(1000, "Image URL must be at most 1000 characters")
  .refine(
    (value) =>
      !value ||
      (URL.canParse(value) && ["http:", "https:"].includes(new URL(value).protocol)),
    "Enter a valid HTTP(S) image URL",
  )
  .transform((value) => value || null);

const aboutPrincipleIcon = z
  .string()
  .trim()
  .min(1)
  .max(1000)
  .refine(
    (value) =>
      (value.startsWith("/") && !value.startsWith("//")) ||
      (URL.canParse(value) && ["http:", "https:"].includes(new URL(value).protocol)),
    "Enter a relative image path or a valid HTTP(S) icon URL",
  );

const aboutMilestoneSchema = z.object({
  year: z.string().trim().min(1).max(40),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(500),
});

export const aboutUsPageSettingSchema = z.object({
  heroHeading: z.string().trim().min(1).max(255),
  heroDescription: z.string().trim().min(1).max(1000),
  desktopImage: aboutImageUrl,
  mobileImage: aboutImageUrl,
  journeyHeading: z.string().trim().min(1).max(200),
  journeyDescription: z.string().trim().min(1).max(1000),
  principlesHeading: z.string().trim().min(1).max(255),
  principles: z.array(
    z.object({
      id: z.string().trim().min(1).max(36).optional(),
      icon: aboutPrincipleIcon,
      title: z.string().trim().min(1).max(160),
      description: z.string().trim().min(1).max(1000),
    }),
  ).min(1),
  whoImage: aboutImageUrl,
  whoHeading: z.string().trim().min(1).max(200),
  whoSubheading: z.string().trim().min(1).max(255),
  whoParagraphs: z.tuple([
    z.string().trim().min(1).max(5000),
    z.string().trim().min(1).max(5000),
    z.string().trim().min(1).max(5000),
    z.string().trim().min(1).max(5000),
  ]),
  whoBadge: z.string().trim().min(1).max(120),
  legacyImage: aboutImageUrl,
  legacyHeading: z.string().trim().min(1).max(255),
  legacyIntro: z.string().trim().min(1).max(5000),
  legacyParagraph1: z.string().trim().min(1).max(5000),
  legacyParagraph2: z.string().trim().min(1).max(5000),
  legacyStats: z.array(
    z.object({
      id: z.string().trim().min(1).max(36).optional(),
      icon: aboutPrincipleIcon,
      title: z.string().trim().min(1).max(160),
    }),
  ).min(1),
  whyChooseImage: aboutImageUrl,
  whyChooseHeading: z.string().trim().min(1).max(255),
  whyChooseDescription: z.string().trim().min(1).max(5000),
  whyChooseCards: z.tuple([
    z.object({
      id: z.string().trim().min(1).max(36).optional(),
      title: z.string().trim().min(1).max(160),
      description: z.string().trim().min(1).max(1000),
    }),
    z.object({
      id: z.string().trim().min(1).max(36).optional(),
      title: z.string().trim().min(1).max(160),
      description: z.string().trim().min(1).max(1000),
    }),
    z.object({
      id: z.string().trim().min(1).max(36).optional(),
      title: z.string().trim().min(1).max(160),
      description: z.string().trim().min(1).max(1000),
    }),
    z.object({
      id: z.string().trim().min(1).max(36).optional(),
      title: z.string().trim().min(1).max(160),
      description: z.string().trim().min(1).max(1000),
    }),
  ]),
  milestones: z.tuple([
    aboutMilestoneSchema,
    aboutMilestoneSchema,
    aboutMilestoneSchema,
    aboutMilestoneSchema,
  ]),
});
