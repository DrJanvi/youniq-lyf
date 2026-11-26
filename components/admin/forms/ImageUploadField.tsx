"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { toast } from "sonner";
import { reorderImageUrls } from "@/lib/product-images";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/admin/ui/form";
import { Input } from "@/components/admin/ui/input";
import {
  ACCEPTED_IMAGE_TYPES,
  getImageSizeLimitText,
  isAllowedImageType,
  isValidImageSize,
  type ImageUploadPurpose,
} from "@/lib/image-upload";

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

async function copyImageUrl(url: string) {
  if (!navigator.clipboard?.writeText) {
    toast.error("Clipboard access is unavailable in this browser.");
    return;
  }

  try {
    await navigator.clipboard.writeText(url.trim());
    toast.success("Image URL copied to clipboard");
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Clipboard access was denied.";
    toast.error(`Could not copy image URL: ${detail}`);
  }
}

export function CloudinaryImageUploader({
  value,
  onChange,
  label,
  description,
  uploadPurpose = "general",
  multiple = false,
  maxFiles = 1,
  showPreview = true,
  showImageNumbers = false,
}: {
  value: unknown;
  onChange: (value: string) => void;
  label: string;
  description?: string;
  uploadPurpose?: ImageUploadPurpose;
  multiple?: boolean;
  maxFiles?: number;
  showPreview?: boolean;
  showImageNumbers?: boolean;
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
    if (files.some((file) => !isValidImageSize(file.size, uploadPurpose))) {
      setError(`Each image must be non-empty and ${getImageSizeLimitText(uploadPurpose)}.`);
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
        if (uploadPurpose === "product") {
          formData.set("purpose", uploadPurpose);
        }
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
        {description ?? `PNG, JPEG, or WebP; each file must be ${getImageSizeLimitText(uploadPurpose)}.`}
        {multiple ? ` ${remaining} of ${maxFiles} image slots available.` : ""}
      </p>
      {progress ? <p className="text-sm text-muted-foreground" role="status">{progress}</p> : null}
      {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
      {showPreview && urls.some(isPreviewableImageUrl) ? (
        <div className="flex flex-wrap gap-3">
          {urls.map((url, index) =>
            isPreviewableImageUrl(url) ? (
              <div key={`${url}-${index}`} className="relative size-24 overflow-hidden rounded-lg border border-border">
                <Image
                  src={url}
                  alt=""
                  width={96}
                  height={96}
                  unoptimized
                  className="size-full object-cover"
                />
                {showImageNumbers ? (
                  <button
                    type="button"
                    onClick={() => void copyImageUrl(url)}
                    aria-label={`Copy image URL ${index + 1}`}
                    title="Copy image URL"
                    className="absolute left-1 top-1 flex size-6 cursor-copy items-center justify-center rounded-full bg-background text-xs font-semibold text-foreground shadow-sm"
                  >
                    <span className="sr-only">Image </span>
                    {index + 1}
                  </button>
                ) : null}
              </div>
            ) : null,
          )}
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
  uploadPurpose,
  multiple,
  maxFiles,
  showImageNumbers,
}: {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description?: string;
  uploadPurpose?: ImageUploadPurpose;
  multiple?: boolean;
  maxFiles?: number;
  showImageNumbers?: boolean;
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
          uploadPurpose={uploadPurpose}
          multiple={multiple}
          maxFiles={maxFiles}
          showImageNumbers={showImageNumbers}
        />
      )}
    />
  );
}

export function NumberedImageUrlsField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  maxFiles = 20,
}: {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description?: string;
  maxFiles?: number;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const urls: string[] = typeof field.value === "string" ? field.value.split(/\r?\n/) : [""];
        const rows: string[] = urls.length ? urls : [""];
        const urlCount = rows.filter((url) => url.trim()).length;
        const canAddUrl = urlCount < maxFiles && Boolean(rows[rows.length - 1]?.trim());

        return (
          <FormItem>
            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium">{label}</legend>
              <FormControl>
                <div className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-2">
                  {rows.map((url, index) => {
                    const imageNumber = url.trim()
                      ? rows
                          .slice(0, index + 1)
                          .filter((entry) => entry.trim()).length
                      : 0;

                    return (
                      <div
                        key={index}
                        className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2"
                        onDragOver={(event) => {
                          if (url.trim()) {
                            event.preventDefault();
                            event.dataTransfer.dropEffect = "move";
                          }
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          if (!url.trim()) return;
                          const sourceValue = event.dataTransfer.getData("text/plain");
                          if (!/^\d+$/.test(sourceValue)) return;

                          const imageUrls = rows.filter((entry) => entry.trim());
                          const sourceIndex = Number(sourceValue);
                          const targetIndex = imageNumber - 1;
                          if (
                            !Number.isInteger(sourceIndex) ||
                            sourceIndex < 0 ||
                            sourceIndex >= imageUrls.length ||
                            sourceIndex === targetIndex
                          ) {
                            return;
                          }

                          const emptyRows = rows.filter((entry) => !entry.trim());
                          field.onChange([
                            ...reorderImageUrls(imageUrls, sourceIndex, targetIndex),
                            ...emptyRows,
                          ].join("\n"));
                        }}
                      >
                        <button
                          type="button"
                          draggable={Boolean(url.trim())}
                          disabled={!url.trim()}
                          onDragStart={(event) => {
                            if (!imageNumber) return;
                            event.dataTransfer.effectAllowed = "move";
                            event.dataTransfer.setData("text/plain", String(imageNumber - 1));
                          }}
                          onClick={() => void copyImageUrl(url)}
                          aria-label={
                            imageNumber
                              ? `Image URL ${imageNumber}: drag to reorder or click to copy`
                              : "No image URL to copy"
                          }
                          title={imageNumber ? "Drag to reorder or click to copy image URL" : undefined}
                          className="flex size-8 cursor-grab items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground hover:bg-muted/80 active:cursor-grabbing disabled:cursor-not-allowed"
                        >
                          {imageNumber || "+"}
                        </button>
                        <Input
                          ref={index === 0 ? field.ref : undefined}
                          type="url"
                          value={url}
                          placeholder="Paste an image URL"
                          aria-label={imageNumber ? `Image URL ${imageNumber}` : "New image URL"}
                          onBlur={field.onBlur}
                          onChange={(event) => {
                            const nextUrls = [...rows];
                            nextUrls[index] = event.currentTarget.value;
                            field.onChange(nextUrls.join("\n"));
                          }}
                        />
                        <button
                          type="button"
                          disabled={rows.length === 1 && !url.trim()}
                          aria-label={imageNumber ? `Remove image ${imageNumber} URL` : "Remove empty image URL"}
                          onClick={() => {
                            field.onChange(rows.filter((_, rowIndex) => rowIndex !== index).join("\n"));
                          }}
                          className="text-sm font-medium text-destructive underline underline-offset-4 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </FormControl>
              <button
                type="button"
                disabled={!canAddUrl}
                onClick={() => field.onChange([...rows, ""].join("\n"))}
                className="self-start rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
              >
                Add URL
              </button>
            </fieldset>
            <FormDescription>
              Drag a URL number to reorder its image. {description}
            </FormDescription>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
