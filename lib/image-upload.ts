export const MAX_IMAGE_SIZE = 2_000_000;
export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const ACCEPTED_IMAGE_TYPES = "image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp";
const allowedImageTypeSet: ReadonlySet<string> = new Set(ALLOWED_IMAGE_TYPES);

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

export function isAllowedImageType(mimeType: string): mimeType is AllowedImageType {
  return allowedImageTypeSet.has(mimeType);
}

export function isValidImageSize(size: number) {
  return Number.isInteger(size) && size > 0 && size < MAX_IMAGE_SIZE;
}
