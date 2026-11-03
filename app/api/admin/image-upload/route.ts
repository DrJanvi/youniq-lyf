import { createHash, randomUUID } from "node:crypto";
import { requireAdminApi } from "@/lib/auth/session";
import { ApiError, api } from "@/lib/http";
import { isAllowedImageType, isValidImageSize } from "@/lib/image-upload";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function signUpload(params: Record<string, string>, apiSecret: string) {
  const paramString = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return createHash("sha1").update(`${paramString}${apiSecret}`).digest("hex");
}

export const POST = api(async (request) => {
  await requireAdminApi();

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new ApiError(500, "Cloudinary is not configured on the server.");
  }

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

  if (!/^[a-zA-Z0-9-]+$/.test(cloudName)) {
    throw new ApiError(500, "Cloudinary cloud name is invalid.");
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signedParams = {
    folder: "storefront",
    public_id: randomUUID(),
    timestamp,
  };
  const uploadForm = new FormData();
  uploadForm.set("file", file);
  uploadForm.set("api_key", apiKey);
  uploadForm.set("folder", signedParams.folder);
  uploadForm.set("public_id", signedParams.public_id);
  uploadForm.set("timestamp", timestamp);
  uploadForm.set("signature", signUpload(signedParams, apiSecret));

  let uploadResponse: Response;
  try {
    uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: uploadForm },
    );
  } catch {
    throw new ApiError(502, "Could not reach Cloudinary. Please try again.");
  }

  let uploadResult: unknown;
  try {
    uploadResult = await uploadResponse.json();
  } catch {
    throw new ApiError(502, "Cloudinary returned an invalid response.");
  }

  if (!uploadResponse.ok) {
    const errorMessage =
      isRecord(uploadResult) &&
      isRecord(uploadResult.error) &&
      typeof uploadResult.error.message === "string"
        ? uploadResult.error.message
        : "Cloudinary rejected the image upload.";
    throw new ApiError(502, errorMessage);
  }

  const secureUrl = isRecord(uploadResult) ? uploadResult.secure_url : undefined;
  if (typeof secureUrl !== "string" || !secureUrl.startsWith("https://")) {
    throw new ApiError(502, "Cloudinary did not return a secure image URL.");
  }

  return { secureUrl };
});
