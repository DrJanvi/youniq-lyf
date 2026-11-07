import { createHash } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import shopifyExport from "@/sample-data/get-all-products.json";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/session";
import { ApiError, api } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { productInputSchema } from "@/lib/validation";
import { createProduct } from "@/services/product";

const shopifyIdSchema = z
  .union([z.string().min(1), z.number().int().positive()])
  .transform(String);

const shopifyImageSchema = z.object({
  id: shopifyIdSchema.optional(),
  src: z.string().optional(),
  position: z.number().optional(),
});

const shopifyVariantSchema = z.object({
  id: shopifyIdSchema.optional(),
  title: z.string().optional(),
  option1: z.string().nullable().optional(),
  option2: z.string().nullable().optional(),
  option3: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  available: z.boolean().optional(),
  price: z.union([z.string(), z.number()]).nullable().optional(),
  grams: z.number().optional(),
  featured_image: z
    .union([shopifyImageSchema, shopifyIdSchema])
    .nullable()
    .optional(),
});

const shopifyProductSchema = z.object({
  id: shopifyIdSchema,
  title: z.string(),
  handle: z.string().optional(),
  body_html: z.string().nullable().optional(),
  created_at: z.string().optional(),
  published_at: z.string().nullable().optional(),
  vendor: z.string().optional(),
  product_type: z.string().optional(),
  tags: z.array(z.string()).optional(),
  variants: z.array(shopifyVariantSchema).max(50),
  images: z.array(shopifyImageSchema).max(100),
});

type ShopifyProduct = z.infer<typeof shopifyProductSchema>;
type ShopifyImage = z.infer<typeof shopifyImageSchema>;

const descriptionSanitizer = {
  allowedTags: [
    "a",
    "blockquote",
    "br",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "li",
    "ol",
    "p",
    "strong",
    "u",
    "ul",
  ],
  allowedAttributes: { a: ["href", "name", "target", "rel"] },
  allowedSchemes: ["http", "https", "mailto"],
};

const colorNames: Array<[string, string]> = [
  ["light blue", "#93C5FD"],
  ["dark blue", "#1D4ED8"],
  ["navy", "#1E3A8A"],
  ["yellow", "#FDE047"],
  ["blue", "#3B82F6"],
  ["black", "#111827"],
  ["white", "#FFFFFF"],
  ["red", "#EF4444"],
  ["green", "#22C55E"],
  ["pink", "#EC4899"],
  ["purple", "#8B5CF6"],
  ["orange", "#F97316"],
  ["brown", "#92400E"],
  ["beige", "#D6C1A5"],
  ["tan", "#C19A6B"],
  ["gold", "#D4AF37"],
  ["silver", "#A8A29E"],
  ["grey", "#808080"],
  ["gray", "#808080"],
];

function cleanText(value: string, maxLength: number) {
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength)
    .trim();
}

function parsePrice(value: string | number | null | undefined, productId: string) {
  const price = typeof value === "number" ? value : Number(value);
  if (value == null || !Number.isFinite(price) || price < 0 || price > 10_000_000) {
    throw new ApiError(400, `Product ${productId} has an invalid variant price.`);
  }
  return Math.round(price * 100) / 100;
}

function validateShopifyImageUrl(src: string, productId: string) {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    throw new ApiError(400, `Product ${productId} has an invalid image URL.`);
  }
  if (url.protocol !== "https:" || url.hostname !== "cdn.shopify.com") {
    throw new ApiError(400, `Product ${productId} has an unsupported image URL.`);
  }
  return url.toString();
}

function getFeaturedImageId(featuredImage: ShopifyProduct["variants"][number]["featured_image"]) {
  if (typeof featuredImage === "string") return featuredImage;
  return featuredImage?.id;
}

function getFeaturedImageSrc(
  featuredImage: ShopifyProduct["variants"][number]["featured_image"],
) {
  return typeof featuredImage === "object" && featuredImage !== null
    ? featuredImage.src
    : undefined;
}

function getColor(variant: ShopifyProduct["variants"][number]) {
  const candidates = [variant.option1, variant.option2, variant.option3, variant.title]
    .filter((value): value is string => Boolean(value))
    .map((value) => cleanText(value, 120).toLowerCase());
  for (const candidate of candidates) {
    if (/^#[\da-f]{6}$/i.test(candidate)) return candidate.toUpperCase();
    const color = colorNames.find(([name]) =>
      new RegExp(`(^|[^a-z])${name.replace(" ", "\\s+")}([^a-z]|$)`).test(candidate),
    );
    if (color) return color[1];
  }
  return "#808080";
}

function getCategoryName(product: ShopifyProduct) {
  const searchableText = [
    product.title,
    product.product_type ?? "",
    ...(product.tags ?? []),
  ].join(" ");
  if (/\bwallet\b/i.test(searchableText)) return "Wallets";
  if (/\b(bag|tote|backpack|purse|clutch)\b/i.test(searchableText)) return "Bags";
  return "Accessories";
}

function categoryMatches(name: string, categoryName: string) {
  if (categoryName === "Wallets") return /\bwallets?\b/i.test(name);
  if (categoryName === "Bags") return /\b(bags?|handbags?|purses?|totes?|backpacks?)\b/i.test(name);
  return /\baccessories\b/i.test(name);
}

async function uploadImages(product: ShopifyProduct, images: ShopifyImage[]) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new ApiError(500, "Cloudinary is not configured on the server.");
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  const uniqueImages = new Map<string, string>();
  for (const image of images) {
    if (!image.src) {
      throw new ApiError(400, `Product ${product.id} has an image without a source URL.`);
    }
    const src = validateShopifyImageUrl(image.src, product.id);
    uniqueImages.set(src, src);
  }

  const uploaded = new Map<string, string>();
  const imageEntries = [...uniqueImages.keys()];
  for (let index = 0; index < imageEntries.length; index += 3) {
    const batch = imageEntries.slice(index, index + 3);
    const results = await Promise.all(
      batch.map(async (src) => {
        const publicId = `product_${product.id}_${createHash("sha256")
          .update(src)
          .digest("hex")
          .slice(0, 20)}`;
        const result = await cloudinary.uploader.upload(src, {
          folder: "shopify/products",
          public_id: publicId,
          overwrite: true,
          unique_filename: false,
          resource_type: "image",
        });
        if (!result.secure_url.startsWith("https://")) {
          throw new ApiError(502, "Cloudinary did not return a secure image URL.");
        }
        return [src, result.secure_url] as const;
      }),
    );
    for (const [src, secureUrl] of results) uploaded.set(src, secureUrl);
  }
  return uploaded;
}

async function resolveCategory(
  categoryName: string,
  image: string,
  categories: Array<{ id: string; name: string }>,
) {
  const existing = categories.find((category) => categoryMatches(category.name, categoryName));
  if (existing) return existing.id;

  const slug = slugify(categoryName);
  const category = await prisma.category.upsert({
    where: { slug },
    update: { deletedAt: null },
    create: {
      name: categoryName,
      slug,
      image,
      description: `Imported Shopify ${categoryName.toLowerCase()} products.`,
    },
    select: { id: true, name: true },
  });
  categories.push(category);
  return category.id;
}

async function resolveBrand(value: string | undefined) {
  const name = value ? cleanText(value, 120) : "";
  const slug = slugify(name);
  if (!name || !slug) return null;
  const brand = await prisma.brand.upsert({
    where: { slug },
    update: { deletedAt: null },
    create: { name, slug },
    select: { id: true },
  });
  return brand.id;
}

async function resolveProductType(value: string | undefined) {
  const name = value ? cleanText(value, 120) : "";
  const slug = slugify(name);
  if (!name || !slug) return null;
  const productType = await prisma.productType.upsert({
    where: { slug },
    update: { deletedAt: null },
    create: { name, slug },
    select: { id: true },
  });
  return productType.id;
}

async function importProduct(product: ShopifyProduct, categories: Array<{ id: string; name: string }>) {
  const title = cleanText(product.title, 250);
  if (!title) throw new ApiError(400, `Product ${product.id} has no valid title.`);

  const topImages = [...product.images].sort(
    (left, right) => (left.position ?? 0) - (right.position ?? 0),
  );
  const allImages = [...topImages];
  for (const variant of product.variants) {
    const featuredImage = variant.featured_image;
    if (typeof featuredImage === "object" && featuredImage?.src) allImages.push(featuredImage);
  }

  const uploadedImages = await uploadImages(product, allImages);
  const gallery = topImages.flatMap((image) => {
    if (!image.src) return [];
    const secureUrl = uploadedImages.get(validateShopifyImageUrl(image.src, product.id));
    return secureUrl ? [secureUrl] : [];
  });
  if (!gallery.length) {
    throw new ApiError(400, `Product ${product.id} has no usable product images.`);
  }

  const imageById = new Map(
    allImages.flatMap((image) =>
      image.id && image.src
        ? [[image.id, uploadedImages.get(validateShopifyImageUrl(image.src, product.id))] as const]
        : [],
    ),
  );
  const variantPrices = product.variants.map((variant) => parsePrice(variant.price, product.id));
  if (!variantPrices.length) {
    throw new ApiError(400, `Product ${product.id} has no variants to import.`);
  }
  const basePrice = Math.min(...variantPrices);
  const variants = product.variants.map((variant, index) => {
    const variantName =
      cleanText(variant.title ?? "", 120) === "Default Title"
        ? [variant.option1, variant.option2, variant.option3]
            .filter((value): value is string => Boolean(value))
            .map((value) => cleanText(value, 120))
            .join(" / ") || "Default"
        : cleanText(variant.title ?? "", 120) || `Option ${index + 1}`;
    const featuredId = getFeaturedImageId(variant.featured_image);
    const featuredSrc = getFeaturedImageSrc(variant.featured_image);
    const featuredUrl =
      (featuredId ? imageById.get(featuredId) : undefined) ??
      (featuredSrc
        ? uploadedImages.get(validateShopifyImageUrl(featuredSrc, product.id))
        : undefined);
    const price = variantPrices[index];
    return {
      name: variantName,
      sku: variant.sku ? cleanText(variant.sku, 120) || null : null,
      color: getColor(variant),
      images: featuredUrl ? [featuredUrl] : [],
      priceOverride: price === basePrice ? null : price,
      stock: variant.available ? 1 : 0,
      isActive: true,
    };
  });

  const sanitizedDescription = sanitizeHtml(product.body_html ?? "", descriptionSanitizer).trim();
  const description = sanitizedDescription || title;
  const tags = [...new Set((product.tags ?? []).map((tag) => cleanText(tag, 50)).filter(Boolean))];
  const categoryId = await resolveCategory(getCategoryName(product), gallery[0], categories);
  const brandId = await resolveBrand(product.vendor);
  const productTypeId = await resolveProductType(product.product_type);
  const createdAt = product.created_at ? new Date(product.created_at) : undefined;
  if (createdAt && Number.isNaN(createdAt.getTime())) {
    throw new ApiError(400, `Product ${product.id} has an invalid creation date.`);
  }

  const input = productInputSchema.parse({
    title,
    slug: cleanText(product.handle ?? "", 255) || title,
    description,
    images: gallery,
    price: basePrice,
    currency: "INR",
    stock: variants.reduce((total, variant) => total + variant.stock, 0),
    variants,
    isActive: Boolean(product.published_at),
    categoryId,
    brandId,
    productTypeId,
    tags,
  });
  return createProduct(input, { shopifyId: product.id, createdAt });
}

export const POST = api(async (request) => {
  await requireAdminApi();

  const requestedLimit = new URL(request.url).searchParams.get("limit");
  const limit = requestedLimit === null ? 10 : Number(requestedLimit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 25) {
    throw new ApiError(400, "The limit must be an integer between 1 and 25.");
  }

  const products = z.array(shopifyProductSchema).parse(shopifyExport);
  const sourceIds = products.map(({ id }) => id);
  const importedRows = await prisma.product.findMany({
    where: { shopifyId: { in: sourceIds } },
    select: { shopifyId: true },
  });
  const importedIds = new Set(
    importedRows.flatMap((product) => (product.shopifyId ? [product.shopifyId] : [])),
  );
  const alreadyImported = importedIds.size;
  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
  });
  const cloudinaryConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;
  if (!cloudinaryConfigured && importedIds.size < products.length) {
    throw new ApiError(500, "Cloudinary is not configured on the server.");
  }

  console.info(
    `[shopify-import] Starting: ${alreadyImported}/${products.length} already imported; batch limit ${limit}.`,
  );
  let processed = 0;
  for (const [index, product] of products.entries()) {
    if (importedIds.has(product.id)) {
      console.info(`[shopify-import] Skipping ${product.id}: already imported.`);
      continue;
    }
    if (processed >= limit) break;

    console.info(
      `[shopify-import] Processing ${index + 1}/${products.length}: ${product.id} "${cleanText(product.title, 120)}".`,
    );
    try {
      await importProduct(product, categories);
      importedIds.add(product.id);
      processed += 1;
      console.info(
        `[shopify-import] Imported ${product.id}; ${importedIds.size}/${products.length} complete.`,
      );
    } catch (error) {
      console.error(
        `[shopify-import] Failed ${product.id}:`,
        error instanceof Error ? error.message : "Unknown import error",
      );
      throw error;
    }
  }

  const remaining = products.length - importedIds.size;
  return {
    total: products.length,
    processed,
    alreadyImported,
    remaining,
    complete: remaining === 0,
  };
});
