import { requireAdminApi } from "@/lib/auth/session";
import { ApiError, api } from "@/lib/http";
import { isAllowedImageType, isValidImageSize } from "@/lib/image-upload";
import { uploadCloudinaryStorefrontAsset } from "@/lib/cloudinary-upload";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function hasValidImageSignature(bytes: Uint8Array, mimeType: string) {
  if (mimeType === "image/png") {
    return PNG_SIGNATURE.every((byte, index) => bytes[index] === byte);
  }
  if (mimeType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  return (
    mimeType === "image/webp" &&
    String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.subarray(8, 12)) === "WEBP"
  );
}

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
    throw new ApiError(400, "Choose an image to upload.");
  }
  if (!isValidImageSize(file.size)) {
    throw new ApiError(400, "Image size must be less than 2 MB.");
  }
  if (!isAllowedImageType(file.type)) {
    throw new ApiError(400, "Only PNG, JPEG, and WebP images are allowed.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasValidImageSignature(bytes, file.type)) {
    throw new ApiError(400, "The file contents do not match a supported image format.");
  }

  const secureUrl = await uploadCloudinaryStorefrontAsset(file, "image", "image");
  return { secureUrl };
});
