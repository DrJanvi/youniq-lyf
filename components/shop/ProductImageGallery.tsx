"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import type { ProductGalleryImage } from "@/lib/product-images";

export function ProductImageGallery({
  images,
  selectedImageId,
  onSelectImage,
  title,
  bestseller,
}: {
  images: ProductGalleryImage[];
  selectedImageId: string | null;
  onSelectImage: (image: ProductGalleryImage) => void;
  title: string;
  bestseller: boolean;
}) {
  const [zoomed, setZoomed] = useState(false);
  const thumbnailListRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef(new Map<string, HTMLButtonElement>());
  const requestedIndex = images.findIndex(
    (image) => image.id === selectedImageId,
  );
  const selectedIndex = requestedIndex;
  const selectedImage = images[selectedIndex];
  const showThumbnails =
    images.length > 1 || (images.length > 0 && !selectedImage);

  useEffect(() => {
    if (!selectedImageId) return;

    const list = thumbnailListRef.current;
    const thumbnail = thumbnailRefs.current.get(selectedImageId);
    if (!list || !thumbnail) return;

    const listBounds = list.getBoundingClientRect();
    const thumbnailBounds = thumbnail.getBoundingClientRect();
    const left =
      thumbnailBounds.left < listBounds.left
        ? thumbnailBounds.left - listBounds.left
        : thumbnailBounds.right > listBounds.right
          ? thumbnailBounds.right - listBounds.right
          : 0;
    const top =
      thumbnailBounds.top < listBounds.top
        ? thumbnailBounds.top - listBounds.top
        : thumbnailBounds.bottom > listBounds.bottom
          ? thumbnailBounds.bottom - listBounds.bottom
          : 0;

    if (left || top) list.scrollBy({ left, top, behavior: "smooth" });
  }, [selectedImageId]);

  return (
    <div
      className={`grid min-w-0 gap-3 ${
        showThumbnails ? "md:grid-cols-[6.5rem_minmax(0,1fr)]" : ""
      }`}
    >
      {showThumbnails ? (
        <div
          ref={thumbnailListRef}
          role="group"
          aria-label="Product images"
          className="order-2 flex w-full min-w-0 max-w-full gap-2 overflow-x-auto overflow-y-hidden md:order-1 md:max-h-[620px] md:flex-col md:overflow-x-hidden md:overflow-y-auto"
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              ref={(element) => {
                if (element) thumbnailRefs.current.set(image.id, element);
                else thumbnailRefs.current.delete(image.id);
              }}
              type="button"
              onClick={() => onSelectImage(image)}
              aria-label={`View image ${index + 1} of ${images.length}${image.variantName ? ` for ${image.variantName}` : ""}`}
              aria-pressed={selectedImage?.id === image.id}
              className={`relative size-[4.5rem] shrink-0 overflow-hidden rounded-xl border bg-surface-main p-2 transition-colors md:size-[5.5rem] ${
                selectedImage?.id === image.id
                  ? "border-brand-primary"
                  : "border-transparent hover:border-surface-border"
              }`}
            >
              <Image
                src={image.src}
                alt=""
                fill
                unoptimized
                sizes="88px"
                aria-hidden="true"
                className="object-contain"
              />
            </button>
          ))}
        </div>
      ) : null}

      <div className="relative order-1 flex aspect-square min-w-0 items-center justify-center overflow-hidden rounded-[1.25rem] bg-surface-card p-8 md:order-2 md:p-12">
        {bestseller ? (
          <span className="absolute top-5 left-5 z-10 rounded-full bg-white px-3 py-2 text-[10px] font-semibold tracking-[0.12em] text-status-error uppercase">
            Bestseller
          </span>
        ) : null}
        {selectedImage ? (
          <button
            type="button"
            onClick={() => setZoomed(true)}
            aria-label={`Enlarge image of ${title}`}
            className="relative size-full cursor-zoom-in"
          >
          <Image
            src={selectedImage.src}
            alt={
              selectedImage.variantName
                ? `${title} - ${selectedImage.variantName}`
                : title
            }
            fill
            unoptimized
            priority
            sizes="(max-width: 768px) 100vw, 55vw"
            className="object-contain"
          />
          </button>
        ) : (
          <div className="text-sm text-text-muted">Image coming soon</div>
        )}
        {selectedImage ? (
          <button
            type="button"
            onClick={() => setZoomed(true)}
            className="absolute top-5 right-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs text-text-primary shadow-sm transition hover:bg-surface-card"
          >
            <Search aria-hidden="true" className="size-4" />
            Zoom
          </button>
        ) : null}
        {selectedImage ? (
          <span className="pointer-events-none absolute bottom-5 left-0 w-full text-center text-[10px] tracking-[0.14em] text-text-muted uppercase">
            Image {selectedIndex + 1} of {images.length}
          </span>
        ) : null}
      </div>

      {zoomed && selectedImage ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Enlarged image of ${title}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-5"
          onClick={() => setZoomed(false)}
        >
          <button
            type="button"
            onClick={() => setZoomed(false)}
            aria-label="Close enlarged image"
            className="absolute top-5 right-5 rounded-full bg-white p-3 text-text-primary"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
          <div className="flex size-[min(90vw,90vh)] items-center justify-center rounded-[1.25rem] bg-surface-card p-8 md:p-12">
            <Image
              src={selectedImage.src}
              alt={
                selectedImage.variantName
                  ? `${title} - ${selectedImage.variantName}`
                  : title
              }
              width={1400}
              height={1400}
              unoptimized
              className="max-h-full max-w-full object-contain"
              onClick={(event) => event.stopPropagation()}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
