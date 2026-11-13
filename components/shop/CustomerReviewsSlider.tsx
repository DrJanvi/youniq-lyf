"use client";

import { formatMoney } from "@/components/ui/PriceTag";
import type { LatestReviewDTO } from "@/services/review";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { StorefrontLink as Link } from "@/components/layout/StorefrontLink";
import { useCallback, useEffect, useRef, useState } from "react";

export function CustomerReviewsSlider({
  reviews,
}: {
  reviews: LatestReviewDTO[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(true);

  const updateControls = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setCanScrollBack(track.scrollLeft > 1);
    setCanScrollForward(
      track.scrollLeft + track.clientWidth < track.scrollWidth - 1,
    );
  }, []);

  useEffect(() => {
    updateControls();
    window.addEventListener("resize", updateControls);
    return () => window.removeEventListener("resize", updateControls);
  }, [reviews.length, updateControls]);

  function scroll(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth, behavior: "smooth" });
  }

  if (!reviews.length)
    return <p className="text-text-muted text-center">No reviews yet.</p>;

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={updateControls}
        role="region"
        aria-label="Customer reviews"
        aria-roledescription="carousel"
        className="flex snap-x snap-mandatory scrollbar-none gap-5 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden"
      >
        {reviews.map((review) => (
          <article
            key={review.id}
            aria-label={`Review by ${review.authorName}`}
            className="border-surface-border bg-surface-card w-full shrink-0 snap-start rounded-3xl border p-6 md:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
          >
            <Link
              href={`/products/${review.product.slug}`}
              className="flex items-center gap-5"
            >
              <span className="border-surface-border relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl border bg-white">
                {review.product.image ? (
                  <Image
                    src={review.product.image}
                    alt={review.product.name}
                    fill
                    sizes="80px"
                    unoptimized
                    className="object-contain"
                  />
                ) : (
                  <span aria-hidden="true" className="text-text-muted">
                    No image
                  </span>
                )}
              </span>
              <span className="min-w-0">
                <span className="line-clamp-2 text-sm font-bold tracking-wide uppercase">
                  {review.product.name}
                </span>
                <span className="mt-2 block text-lg font-medium">
                  {formatMoney(review.product.price, review.product.currency)}
                </span>
              </span>
            </Link>

            <div className="border-surface-border my-5 border-t" />

            {(review.title ?? review.body) ? (
              <p className="mb-1 text-lg leading-relaxed font-medium">
                {review.title ?? review.body}
              </p>
            ) : null}

            <footer className="mt-6 flex items-center justify-between gap-3">
              <span className="font-cormorant min-w-0 truncate text-xl">
                {review.authorName}
              </span>
              <span
                aria-label={`Rated ${review.rating} out of 5`}
                className="border-surface-border shrink-0 rounded-full border bg-white px-3 py-1 text-sm"
              >
                {review.rating.toFixed(1)}{" "}
                <span aria-hidden="true" className="text-rating-gold">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </span>
              </span>
            </footer>
          </article>
        ))}
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          aria-label="Previous reviews"
          disabled={!canScrollBack}
          onClick={() => scroll(-1)}
          className="bg-surface-card grid size-14 place-items-center rounded-full text-2xl transition-opacity disabled:opacity-40"
        >
          <ArrowLeft aria-hidden="true" size={22} color="var(--color-text-muted)" />
        </button>
        <button
          type="button"
          aria-label="Next reviews"
          disabled={!canScrollForward}
          onClick={() => scroll(1)}
          className="bg-surface-card grid size-14 place-items-center rounded-full text-2xl transition-opacity disabled:opacity-40"
        >
          <ArrowRight aria-hidden="true" size={22} color="var(--color-text-muted)" />
        </button>
      </div>
    </div>
  );
}
