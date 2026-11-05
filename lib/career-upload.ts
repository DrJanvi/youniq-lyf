export const MAX_CAREER_RESUME_SIZE = 5 * 1024 * 1024;
export const CAREER_RESUME_ACCEPT =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const CAREER_RESUME_MIME_TYPES = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

export type CareerResumeExtension = keyof typeof CAREER_RESUME_MIME_TYPES;

export function getCareerResumeExtension(filename: string): CareerResumeExtension | null {
  const extension = filename.split(".").at(-1)?.toLowerCase();
  return extension === "pdf" || extension === "doc" || extension === "docx"
    ? extension
    : null;
}

export function getCareerResumeMetadataError(file: {
  name: string;
  type: string;
  size: number;
}) {
  if (!Number.isSafeInteger(file.size) || file.size <= 0) {
    return "Choose a non-empty resume file.";
  }
  if (file.size > MAX_CAREER_RESUME_SIZE) {
    return "Your resume must be 5 MB or smaller.";
  }

  const extension = getCareerResumeExtension(file.name);
  if (!extension) {
    return "Only PDF, DOC, or DOCX resumes are allowed.";
  }
  if (file.type !== CAREER_RESUME_MIME_TYPES[extension]) {
    return "The file extension and MIME type must match a PDF, DOC, or DOCX resume.";
  }
  return null;
}

export function hasCareerResumeSignature(
  bytes: Uint8Array,
  extension: CareerResumeExtension,
) {
  if (extension === "pdf") {
    return bytes.length >= 5 && new TextDecoder().decode(bytes.subarray(0, 5)) === "%PDF-";
  }

  if (extension === "doc") {
    const signature = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
    return signature.every((byte, index) => bytes[index] === byte);
  }

  const isZip =
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    bytes[2] === 0x03 &&
    bytes[3] === 0x04;
  if (!isZip) return false;

  const archiveEntries = new TextDecoder("latin1").decode(bytes);
  return (
    archiveEntries.includes("[Content_Types].xml") &&
    archiveEntries.includes("word/document.xml")
  );
}
