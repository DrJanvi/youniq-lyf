"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { CloudinaryImageUploader } from "@/components/admin/forms/ImageUploadField";
import { useAdminApi } from "@/components/admin/common/use-admin-api";
import { CAREER_PLACEHOLDER_IMAGE } from "@/lib/career-page";

export function CareerImageSettings({ imageUrl }: { imageUrl: string | null }) {
  const [selectedImageUrl, setSelectedImageUrl] = useState(imageUrl ?? "");
  const [savedImageUrl, setSavedImageUrl] = useState(imageUrl);
  const { request, pending } = useAdminApi();

  async function saveImage() {
    const result = await request("/api/admin/careers", {
      method: "PATCH",
      json: { imageUrl: selectedImageUrl || null },
      success: "Career page image saved",
    });
    if (result !== undefined) {
      setSavedImageUrl(selectedImageUrl || null);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_112px]">
        <div className="flex flex-col items-start gap-4">
          <div>
            <h2 className="font-heading text-lg font-semibold">Career page image</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              This image appears beside the application form. The placeholder is
              shown until you upload and save a replacement.
            </p>
          </div>
          <CloudinaryImageUploader
            value={selectedImageUrl}
            onChange={setSelectedImageUrl}
            label="Upload replacement image"
            description="PNG, JPEG, or WebP under 2 MB."
            showPreview={false}
          />
          <Button type="button" disabled={pending} onClick={() => void saveImage()}>
            {pending ? "Saving…" : "Save image"}
          </Button>
        </div>
        <div className="relative aspect-[2/3] w-24 justify-self-start overflow-hidden rounded-xl bg-muted sm:justify-self-end">
          <Image
            src={savedImageUrl ?? CAREER_PLACEHOLDER_IMAGE}
            alt={
              savedImageUrl
                ? "Saved career page image"
                : "Default career page placeholder"
            }
            fill
            sizes="96px"
            unoptimized
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
