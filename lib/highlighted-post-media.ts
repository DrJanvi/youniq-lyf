import { isAllowedImageType } from "@/lib/image-upload";

export type HighlightedPostMediaType = "image" | "video";

export const HIGHLIGHTED_POST_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"] as const;
export const ACCEPTED_HIGHLIGHTED_POST_MEDIA_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ...HIGHLIGHTED_POST_VIDEO_TYPES,
  ".mp4",
  ".mov",
  ".webm",
].join(",");

const videoTypeSet: ReadonlySet<string> = new Set(HIGHLIGHTED_POST_VIDEO_TYPES);
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export function isHighlightedPostVideoUrl(url: string) {
  return /\/video\/upload\/|\.mp4(?:[?#]|$)|\.mov(?:[?#]|$)|\.webm(?:[?#]|$)/i.test(url);
}

export function getHighlightedPostMediaType(mimeType: string): HighlightedPostMediaType | null {
  if (isAllowedImageType(mimeType)) return "image";
  return videoTypeSet.has(mimeType) ? "video" : null;
}

export function hasValidHighlightedPostMediaSignature(bytes: Uint8Array, mimeType: string) {
  if (mimeType === "image/png") {
    return PNG_SIGNATURE.every((byte, index) => bytes[index] === byte);
  }
  if (mimeType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === "image/webp") {
    return String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.subarray(8, 12)) === "WEBP";
  }
  if (mimeType === "video/webm") {
    return bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
  }
  return (
    (mimeType === "video/mp4" || mimeType === "video/quicktime") &&
    String.fromCharCode(...bytes.subarray(4, 8)) === "ftyp"
  );
}
