export const MAX_IMAGE_SIZE = 2_000_000;
export const MAX_PRODUCT_IMAGE_SIZE = 15_000_000;
export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const ACCEPTED_IMAGE_TYPES = "image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp";
const allowedImageTypeSet: ReadonlySet<string> = new Set(ALLOWED_IMAGE_TYPES);

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];
export type ImageUploadPurpose = "general" | "product";

export function isAllowedImageType(mimeType: string): mimeType is AllowedImageType {
  return allowedImageTypeSet.has(mimeType);
}

export function isValidImageSize(size: number, purpose: ImageUploadPurpose = "general") {
  const maxSize = purpose === "product" ? MAX_PRODUCT_IMAGE_SIZE : MAX_IMAGE_SIZE;
  return (
    Number.isInteger(size) &&
    size > 0 &&
    (purpose === "product" ? size <= maxSize : size < maxSize)
  );
}

export function getImageSizeLimitText(purpose: ImageUploadPurpose = "general") {
  return purpose === "product" ? "at most 15 MB" : "less than 2 MB";
}
