import { requireAdminApi } from "@/lib/auth/session";
import { createCareerResumeDownloadUrl } from "@/lib/cloudinary-career";
import { getCareerResumeExtension } from "@/lib/career-upload";
import { ApiError, api, type IdCtx } from "@/lib/http";
import { getCareerApplicationResume } from "@/services/career";

function contentDispositionFilename(filename: string) {
  const safeAscii = filename.replace(/[^\x20-\x7e]|["\\;]/g, "_");
  const encoded = encodeURIComponent(filename).replace(
    /['()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return `attachment; filename="${safeAscii}"; filename*=UTF-8''${encoded}`;
}

export const GET = api<IdCtx>(async (_request, { params }) => {
  await requireAdminApi();
  const { id } = await params;
  const resume = await getCareerApplicationResume(id);
  const extension = getCareerResumeExtension(resume.resumeFileName);
  if (!extension) {
    throw new ApiError(500, "The stored resume format is invalid.");
  }

  const downloadUrl = createCareerResumeDownloadUrl(
    resume.resumePublicId,
    extension,
  );
  let downloadResponse: Response;
  try {
    downloadResponse = await fetch(downloadUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    throw new ApiError(502, "Could not retrieve the resume from Cloudinary.");
  }

  if (!downloadResponse.ok || !downloadResponse.body) {
    throw new ApiError(502, "Could not retrieve the resume from Cloudinary.");
  }

  return new Response(downloadResponse.body, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": contentDispositionFilename(resume.resumeFileName),
      "Content-Type": resume.resumeContentType,
      "X-Content-Type-Options": "nosniff",
    },
  });
});
