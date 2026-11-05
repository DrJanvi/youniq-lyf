import { uploadCareerResume } from "@/lib/cloudinary-career";
import {
  getCareerResumeExtension,
  getCareerResumeMetadataError,
  hasCareerResumeSignature,
  MAX_CAREER_RESUME_SIZE,
} from "@/lib/career-upload";
import { ApiError, api } from "@/lib/http";
import { careerApplicationSchema } from "@/lib/validation";
import { createCareerApplication } from "@/services/career";

const MAX_REQUEST_SIZE = MAX_CAREER_RESUME_SIZE + 64 * 1024;

function getStringField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : undefined;
}

function safeResumeFileName(filename: string, extension: string) {
  const basename = filename.split(/[\\/]/).at(-1) ?? `resume.${extension}`;
  const cleaned = basename
    .replace(/[\u0000-\u001f\u007f"\\]/g, "_")
    .slice(0, 255);
  return cleaned.toLowerCase().endsWith(`.${extension}`)
    ? cleaned
    : `resume.${extension}`;
}

export const POST = api(async (request) => {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_SIZE) {
    throw new ApiError(413, "The application upload is too large.");
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    throw new ApiError(400, "Application must be sent as multipart form data.");
  }

  const uploadedFiles = formData.getAll("resume");
  const file = uploadedFiles[0];
  if (uploadedFiles.length !== 1 || !(file instanceof File)) {
    throw new ApiError(400, "Choose one resume file.");
  }

  const metadataError = getCareerResumeMetadataError(file);
  if (metadataError) throw new ApiError(400, metadataError);
  const extension = getCareerResumeExtension(file.name);
  if (!extension) throw new ApiError(400, "Only PDF, DOC, or DOCX resumes are allowed.");

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasCareerResumeSignature(bytes, extension)) {
    throw new ApiError(400, "The file contents do not match the selected resume format.");
  }

  const input = careerApplicationSchema.parse({
    fullName: getStringField(formData, "fullName"),
    email: getStringField(formData, "email"),
    jobRole: getStringField(formData, "jobRole"),
    countryCode: getStringField(formData, "countryCode"),
    phoneNumber: getStringField(formData, "phoneNumber"),
    consent: getStringField(formData, "consent") === "true",
  });

  const publicId = await uploadCareerResume(file, extension);
  const application = await createCareerApplication(input, {
    publicId,
    fileName: safeResumeFileName(file.name, extension),
    contentType: file.type,
  });
  return Response.json(application, { status: 201 });
});
