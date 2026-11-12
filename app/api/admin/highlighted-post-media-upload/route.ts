import { requireAdminApi } from "@/lib/auth/session";
import { uploadCloudinaryStorefrontAsset } from "@/lib/cloudinary-upload";
import { ApiError, api } from "@/lib/http";
import {
  getHighlightedPostMediaType,
  hasValidHighlightedPostMediaSignature,
} from "@/lib/highlighted-post-media";

export const POST = api(async (request) => {
  await requireAdminApi();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    throw new ApiError(400, "Upload must be sent as multipart form data.");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new ApiError(400, "Choose an image or video to upload.");
  }

  const mediaType = formData.get("mediaType");
  const detectedMediaType = getHighlightedPostMediaType(file.type);
  if (
    (mediaType !== "image" && mediaType !== "video") ||
    detectedMediaType !== mediaType
  ) {
    throw new ApiError(400, "Choose a PNG, JPEG, or WebP image, or an MP4, MOV, or WebM video.");
  }

  const signature = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (!hasValidHighlightedPostMediaSignature(signature, file.type)) {
    throw new ApiError(400, "The file contents do not match a supported image or video format.");
  }

  const secureUrl = await uploadCloudinaryStorefrontAsset(file, mediaType, mediaType);
  return { secureUrl };
});
