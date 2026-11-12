"use client";

import Image from "next/image";
import { useId, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { Input } from "@/components/admin/ui/input";
import {
  ACCEPTED_HIGHLIGHTED_POST_MEDIA_TYPES,
  getHighlightedPostMediaType,
  type HighlightedPostMediaType,
} from "@/lib/highlighted-post-media";

function isUploadResponse(value: unknown): value is { secureUrl: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "secureUrl" in value &&
    typeof value.secureUrl === "string" &&
    value.secureUrl.startsWith("https://")
  );
}

function isPreviewableMediaUrl(url: string) {
  try {
    return ["http:", "https:"].includes(new URL(url).protocol);
  } catch {
    return false;
  }
}

export function HighlightedPostMediaUploadField({
  value,
  mediaType,
  onChange,
}: {
  value: string;
  mediaType: HighlightedPostMediaType;
  onChange: (url: string, mediaType: HighlightedPostMediaType) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputId = useId();
  const previewUrl = isPreviewableMediaUrl(value) ? value : "";

  async function uploadFile(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    const mediaType = getHighlightedPostMediaType(file.type);
    if (!mediaType) {
      setError("Choose a PNG, JPEG, or WebP image, or an MP4, MOV, or WebM video.");
      input.value = "";
      return;
    }

    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("mediaType", mediaType);
      const response = await fetch("/api/admin/highlighted-post-media-upload", { method: "POST", body: formData });
      let result: unknown;
      try {
        result = await response.json();
      } catch {
        throw new Error("The upload service returned an invalid response.");
      }
      if (!response.ok) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Media upload failed.";
        throw new Error(message);
      }
      if (!isUploadResponse(result)) {
        throw new Error("The upload service did not return a valid media URL.");
      }

      onChange(result.secureUrl, mediaType);
      toast.success(mediaType === "image" ? "Image uploaded" : "Video uploaded");
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Media upload failed.";
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
      input.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-medium">Upload post image or video</label>
      <Input
        id={inputId}
        type="file"
        accept={ACCEPTED_HIGHLIGHTED_POST_MEDIA_TYPES}
        disabled={uploading}
        onChange={(event) => void uploadFile(event)}
      />
      <p className="text-sm text-muted-foreground">
        PNG, JPEG, or WebP images; MP4, MOV, or WebM videos. No application-level file-size limit; provider limits may still apply.
      </p>
      {uploading ? <p className="text-sm text-muted-foreground" role="status">Uploading media…</p> : null}
      {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
      {previewUrl ? (
        <div className="size-24 overflow-hidden rounded-lg border border-border">
          {mediaType === "video" ? (
            <video
              src={previewUrl}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              className="size-full object-cover"
            />
          ) : (
            <Image src={previewUrl} alt="" width={96} height={96} unoptimized className="size-full object-cover" />
          )}
        </div>
      ) : null}
    </div>
  );
}
