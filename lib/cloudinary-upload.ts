import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { ApiError } from "@/lib/http";

type CloudinaryResourceType = "image" | "video";

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

export async function uploadCloudinaryStorefrontAsset(
  file: File,
  resourceType: CloudinaryResourceType,
  assetLabel: string,
) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new ApiError(500, "Cloudinary is not configured on the server.");
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
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
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
        : `Cloudinary rejected the ${assetLabel} upload.`;
    throw new ApiError(502, errorMessage);
  }

  const secureUrl = isRecord(uploadResult) ? uploadResult.secure_url : undefined;
  if (typeof secureUrl !== "string" || !secureUrl.startsWith("https://")) {
    throw new ApiError(502, `Cloudinary did not return a secure ${assetLabel} URL.`);
  }

  return secureUrl;
}
