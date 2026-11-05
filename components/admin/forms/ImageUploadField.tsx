"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/admin/ui/form";
import { Input } from "@/components/admin/ui/input";
import { ACCEPTED_IMAGE_TYPES, isAllowedImageType, isValidImageSize } from "@/lib/image-upload";

function getImageUrls(value: unknown) {
  if (Array.isArray(value)) return value.filter((url): url is string => typeof url === "string" && Boolean(url));
  if (typeof value === "string") return value.split(/\r?\n/).map((url) => url.trim()).filter(Boolean);
  return [];
}

function isUploadResponse(value: unknown): value is { secureUrl: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "secureUrl" in value &&
    typeof value.secureUrl === "string" &&
    value.secureUrl.startsWith("https://")
  );
}

function isPreviewableImageUrl(url: string) {
  try {
    return ["http:", "https:"].includes(new URL(url).protocol);
  } catch {
    return false;
  }
}

export function CloudinaryImageUploader({
  value,
  onChange,
  label,
  description,
  multiple = false,
  maxFiles = 1,
  showPreview = true,
}: {
  value: unknown;
  onChange: (value: string) => void;
  label: string;
  description?: string;
  multiple?: boolean;
  maxFiles?: number;
  showPreview?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const inputId = useId();
  const valueRef = useRef(getImageUrls(value).join("\n"));
  const urls = getImageUrls(value);
  const remaining = multiple ? Math.max(0, maxFiles - urls.length) : 1;

  useEffect(() => {
    valueRef.current = getImageUrls(value).join("\n");
  }, [value]);

  async function uploadFiles(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;

    const existingUrls = getImageUrls(valueRef.current);
    if (files.some((file) => !isAllowedImageType(file.type))) {
      setError("Only PNG, JPEG, and WebP images are allowed.");
      input.value = "";
      return;
    }
    if (files.some((file) => !isValidImageSize(file.size))) {
      setError("Each image must be non-empty and less than 2 MB.");
      input.value = "";
      return;
    }
    if (multiple && existingUrls.length + files.length > maxFiles) {
      setError(`You can add up to ${maxFiles} images.`);
      input.value = "";
      return;
    }

    setError("");
    setUploading(true);
    try {
      for (const [index, file] of files.entries()) {
        setProgress(`Uploading ${index + 1} of ${files.length}…`);
        const formData = new FormData();
        formData.set("file", file);
        const response = await fetch("/api/admin/image-upload", { method: "POST", body: formData });
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
              : "Image upload failed.";
          throw new Error(message);
        }
        if (!isUploadResponse(result)) {
          throw new Error("The upload service did not return a valid image URL.");
        }
        const currentUrls = getImageUrls(valueRef.current);
        const nextUrls = multiple ? [...currentUrls, result.secureUrl] : [result.secureUrl];
        const nextValue = nextUrls.join("\n");
        valueRef.current = nextValue;
        onChange(nextValue);
      }
      toast.success(files.length === 1 ? "Image uploaded" : "Images uploaded");
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Image upload failed.";
      setError(message);
      toast.error(message);
    } finally {
      setProgress("");
      setUploading(false);
      input.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-medium">{label}</label>
      <Input
        id={inputId}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        multiple={multiple}
        disabled={uploading || (multiple && remaining === 0)}
        onChange={(event) => void uploadFiles(event)}
      />
      <p className="text-sm text-muted-foreground">
        {description ?? "PNG, JPEG, or WebP; each file must be less than 2 MB."}
        {multiple ? ` ${remaining} of ${maxFiles} image slots available.` : ""}
      </p>
      {progress ? <p className="text-sm text-muted-foreground" role="status">{progress}</p> : null}
      {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
      {showPreview && urls.some(isPreviewableImageUrl) ? (
        <div className="flex flex-wrap gap-3">
          {urls.filter(isPreviewableImageUrl).map((url, index) => (
            <div key={`${url}-${index}`} className="size-24 overflow-hidden rounded-lg border border-border">
              <Image
                src={url}
                alt=""
                width={96}
                height={96}
                unoptimized
                className="size-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ImageUploadField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  multiple,
  maxFiles,
}: {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description?: string;
  multiple?: boolean;
  maxFiles?: number;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <CloudinaryImageUploader
          value={field.value}
          onChange={field.onChange}
          label={label}
          description={description}
          multiple={multiple}
          maxFiles={maxFiles}
        />
      )}
    />
  );
}
