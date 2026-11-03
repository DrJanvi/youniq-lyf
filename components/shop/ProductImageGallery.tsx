"use client";

import Image from "next/image";
import { useState } from "react";
import { Search, X } from "lucide-react";

export function ProductImageGallery({
  images,
  title,
  bestseller,
}: {
  images: string[];
  title: string;
  bestseller: boolean;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const selectedImage = images[selectedIndex];

  return (
    <div
      className={`grid gap-3 ${
        images.length > 1 ? "md:grid-cols-[5.5rem_minmax(0,1fr)]" : ""
      }`}
    >
      {images.length > 1 ? (
        <div
          role="group"
          aria-label="Product images"
          className="order-2 flex gap-2 overflow-x-auto md:order-1 md:max-h-[620px] md:flex-col md:overflow-y-auto"
        >
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`View image ${index + 1} of ${images.length}`}
              aria-pressed={selectedIndex === index}
              className={`relative size-[4.5rem] shrink-0 overflow-hidden rounded-xl border bg-[#fafafa] p-2 transition-colors md:size-[5.5rem] ${
                selectedIndex === index
                  ? "border-[#b48d7d]"
                  : "border-transparent hover:border-[#d8c8c0]"
              }`}
            >
              <Image
                src={image}
                alt=""
                fill
                unoptimized
                sizes="88px"
                className="object-contain"
              />
            </button>
          ))}
        </div>
      ) : null}

      <div className="relative order-1 flex aspect-square items-center justify-center overflow-hidden rounded-[1.25rem] bg-[#f8f8f8] p-8 md:order-2 md:p-12">
        {bestseller ? (
          <span className="absolute top-5 left-5 z-10 rounded-full bg-white px-3 py-2 text-[10px] font-semibold tracking-[0.12em] text-[#8e5148] uppercase">
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
              src={selectedImage}
              alt={title}
              fill
              unoptimized
              priority
              sizes="(max-width: 768px) 100vw, 55vw"
              className="object-contain"
            />
          </button>
        ) : (
          <div className="text-sm text-[#8c817b]">Image coming soon</div>
        )}
        {selectedImage ? (
          <button
            type="button"
            onClick={() => setZoomed(true)}
            className="absolute top-5 right-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs text-[#514944] shadow-sm transition hover:bg-[#f4eeeb]"
          >
            <Search aria-hidden="true" className="size-4" />
            Zoom
          </button>
        ) : null}
        {selectedImage ? (
          <span className="pointer-events-none absolute bottom-5 left-0 w-full text-center text-[10px] tracking-[0.14em] text-[#8c817b] uppercase">
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
            className="absolute top-5 right-5 rounded-full bg-white p-3 text-[#211b19]"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
          <div className="flex size-[min(90vw,90vh)] items-center justify-center rounded-[1.25rem] bg-[#f8f8f8] p-8 md:p-12">
            <Image
              src={selectedImage}
              alt={title}
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
