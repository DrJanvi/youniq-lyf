"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export type HeroSlide = {
  image: string;
  mobileImage?: string | null;
  href: string;
  alt?: string;
};

export function HeroSlider({
  slides,
  intervalMs = 5000,
}: {
  slides: HeroSlide[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (count < 2) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => clearTimeout(id);
  }, [index, count, intervalMs]);

  if (!count) return null;

  return (
    <div
      aria-roledescription="carousel"
      aria-label="Featured"
      className="relative"
    >
      <div className="relative aspect-402/512 w-full overflow-hidden md:aspect-1440/834 md:max-h-208.5">
        {slides.map((s, i) => (
          <Link
            key={`${s.href}-${i}`}
            href={s.href}
            aria-hidden={i !== index}
            tabIndex={i === index ? 0 : -1}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {/* Mobile falls back to the desktop image when no mobile image is set. */}
            <Image
              src={s.image}
              alt={s.alt ?? `Banner ${i + 1}`}
              fill
              sizes="100vw"
              className={`object-cover ${s.mobileImage ? "hidden md:block" : ""}`}
              priority={i === 0}
              unoptimized
            />
            {s.mobileImage ? (
              <Image
                src={s.mobileImage}
                alt={s.alt ?? `Banner ${i + 1}`}
                fill
                sizes="100vw"
                className="object-cover md:hidden"
                priority={i === 0}
                unoptimized
              />
            ) : null}
          </Link>
        ))}
      </div>
      {count > 1 ? (
        <div
          className={clsx(
            "absolute right-6 bottom-6 flex justify-center gap-2",
            "md:inset-x-0 md:bottom-8",
          )}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={clsx(
                "h-2 w-2 rounded-full border border-white bg-transparent transition-all hover:cursor-pointer",
                i === index && "w-6 bg-white",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
