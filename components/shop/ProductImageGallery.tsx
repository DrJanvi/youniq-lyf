"use client";

import Image from "next/image";
import {
  type PointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
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
  const [hoverZoomed, setHoverZoomed] = useState(false);
  const [viewerScale, setViewerScale] = useState(1);
  const [viewerPan, setViewerPan] = useState({ x: 0, y: 0 });
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const thumbnailListRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef(new Map<string, HTMLButtonElement>());
  const touchPointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchStartRef = useRef<{
    distance: number;
    scale: number;
    origin: { x: number; y: number };
  } | null>(null);
  const panStartRef = useRef<{
    x: number;
    y: number;
    panX: number;
    panY: number;
  } | null>(null);
  const requestedIndex = images.findIndex(
    (image) => image.id === selectedImageId,
  );
  const selectedIndex = requestedIndex;
  const selectedImage = images[selectedIndex];
  const showThumbnails =
    images.length > 1 || (images.length > 0 && !selectedImage);

  const updateZoomOrigin = (
    clientX: number,
    clientY: number,
    element: HTMLElement,
  ) => {
    const bounds = element.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    setZoomOrigin({
      x: Math.max(
        0,
        Math.min(100, ((clientX - bounds.left) / bounds.width) * 100),
      ),
      y: Math.max(
        0,
        Math.min(100, ((clientY - bounds.top) / bounds.height) * 100),
      ),
    });
  };
  const openZoomViewer = () => {
    setZoomOrigin({ x: 50, y: 50 });
    setViewerScale(1);
    setViewerPan({ x: 0, y: 0 });
    setHoverZoomed(false);
    touchPointersRef.current.clear();
    pinchStartRef.current = null;
    panStartRef.current = null;
    setZoomed(true);
  };
  const closeZoomViewer = () => {
    setZoomed(false);
    setHoverZoomed(false);
    setViewerScale(1);
    setViewerPan({ x: 0, y: 0 });
    setZoomOrigin({ x: 50, y: 50 });
    touchPointersRef.current.clear();
    pinchStartRef.current = null;
    panStartRef.current = null;
  };
  const handleViewerPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch") return;

    event.currentTarget.setPointerCapture(event.pointerId);
    const pointers = touchPointersRef.current;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.size >= 2) {
      const [first, second] = Array.from(pointers.values());
      const bounds = event.currentTarget.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      const midpoint = {
        x: (first.x + second.x) / 2,
        y: (first.y + second.y) / 2,
      };
      pinchStartRef.current = {
        distance: Math.max(
          1,
          Math.hypot(second.x - first.x, second.y - first.y),
        ),
        scale: viewerScale,
        origin: {
          x: Math.max(
            0,
            Math.min(100, ((midpoint.x - bounds.left) / bounds.width) * 100),
          ),
          y: Math.max(
            0,
            Math.min(100, ((midpoint.y - bounds.top) / bounds.height) * 100),
          ),
        },
      };
      panStartRef.current = null;
      return;
    }

    panStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      panX: viewerPan.x,
      panY: viewerPan.y,
    };
  };
  const handleViewerPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" || event.pointerType === "pen") {
      setHoverZoomed(true);
      updateZoomOrigin(event.clientX, event.clientY, event.currentTarget);
      return;
    }

    if (event.pointerType !== "touch") return;

    const pointers = touchPointersRef.current;
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    const pinchStart = pinchStartRef.current;
    if (pointers.size >= 2 && pinchStart) {
      const [first, second] = Array.from(pointers.values());
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      const scale = Math.max(
        1,
        Math.min(4, pinchStart.scale * (distance / pinchStart.distance)),
      );
      setViewerScale(scale);
      setZoomOrigin(pinchStart.origin);
      if (scale === 1) setViewerPan({ x: 0, y: 0 });
      return;
    }

    const panStart = panStartRef.current;
    if (pointers.size === 1 && panStart && viewerScale > 1) {
      const bounds = event.currentTarget.getBoundingClientRect();
      const maxX = (bounds.width * (viewerScale - 1)) / 2;
      const maxY = (bounds.height * (viewerScale - 1)) / 2;
      setViewerPan({
        x: Math.max(
          -maxX,
          Math.min(maxX, panStart.panX + event.clientX - panStart.x),
        ),
        y: Math.max(
          -maxY,
          Math.min(maxY, panStart.panY + event.clientY - panStart.y),
        ),
      });
    }
  };
  const handleViewerPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch") return;

    const pointers = touchPointersRef.current;
    pointers.delete(event.pointerId);
    pinchStartRef.current = null;

    if (pointers.size === 1) {
      const [remaining] = Array.from(pointers.values());
      panStartRef.current = {
        x: remaining.x,
        y: remaining.y,
        panX: viewerPan.x,
        panY: viewerPan.y,
      };
    } else {
      panStartRef.current = null;
    }
  };

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
            onClick={openZoomViewer}
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
            onClick={openZoomViewer}
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
          onClick={closeZoomViewer}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              closeZoomViewer();
            }}
            aria-label="Close enlarged image"
            className="absolute top-5 right-5 rounded-full bg-white p-3 text-text-primary"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
          <div
            className={`relative flex size-[min(90vw,90vh)] items-center justify-center overflow-hidden rounded-[1.25rem] bg-surface-card p-8 md:p-12 ${
              hoverZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
            }`}
            onClick={(event) => event.stopPropagation()}
            onPointerDown={handleViewerPointerDown}
            onPointerMove={handleViewerPointerMove}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse" || event.pointerType === "pen") {
                setHoverZoomed(true);
                updateZoomOrigin(
                  event.clientX,
                  event.clientY,
                  event.currentTarget,
                );
              }
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === "mouse" || event.pointerType === "pen") {
                setHoverZoomed(false);
                setZoomOrigin({ x: 50, y: 50 });
              }
            }}
            onPointerUp={handleViewerPointerEnd}
            onPointerCancel={handleViewerPointerEnd}
            style={{ touchAction: "none" }}
          >
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
              style={{
                transform: `translate(${viewerPan.x}px, ${viewerPan.y}px) scale(${hoverZoomed ? 1.8 : viewerScale})`,
                transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
