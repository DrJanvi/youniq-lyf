import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "@/lib/http";
import type { CareerResumeExtension } from "@/lib/career-upload";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getCloudinaryCredentials() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new ApiError(500, "Cloudinary is not configured on the server.");
  }
  if (!/^[a-zA-Z0-9-]+$/.test(cloudName)) {
    throw new ApiError(500, "Cloudinary cloud name is invalid.");
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  return { cloudName, apiKey, apiSecret };
}

function signUpload(params: Record<string, string>, apiSecret: string) {
  const paramString = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return createHash("sha1").update(`${paramString}${apiSecret}`).digest("hex");
}

export async function uploadCareerResume(
  file: File,
  extension: CareerResumeExtension,
) {
  const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const publicId = `career-applications/${randomUUID()}.${extension}`;
  const signedParams = {
    public_id: publicId,
    timestamp,
    type: "authenticated",
  };
  const uploadForm = new FormData();
  uploadForm.set("file", file);
  uploadForm.set("api_key", apiKey);
  uploadForm.set("public_id", publicId);
  uploadForm.set("timestamp", timestamp);
  uploadForm.set("type", "authenticated");
  uploadForm.set("signature", signUpload(signedParams, apiSecret));

  let uploadResponse: Response;
  try {
    uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
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
        : "Cloudinary rejected the resume upload.";
    throw new ApiError(502, errorMessage);
  }
  if (!isRecord(uploadResult) || uploadResult.public_id !== publicId) {
    throw new ApiError(502, "Cloudinary returned an invalid resume reference.");
  }

  return publicId;
}

export function createCareerResumeDownloadUrl(
  publicId: string,
  extension: CareerResumeExtension,
) {
  getCloudinaryCredentials();
  return cloudinary.utils.private_download_url(publicId, extension, {
    resource_type: "raw",
    type: "authenticated",
    expires_at: Math.floor(Date.now() / 1000) + 5 * 60,
    attachment: true,
  });
}
