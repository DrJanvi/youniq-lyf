"use client";

import clsx from "clsx";
import Image from "next/image";
import { StorefrontLink as Link } from "@/components/layout/StorefrontLink";
import { isSnowfallSeasonActive } from "@/lib/snowfall-season";
import { useEffect, useState } from "react";
import Snowfall from "react-snowfall";

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
  const [flakeImage, setFlakeImage] = useState<HTMLImageElement | null>(null);
  const [snowfallInSeason, setSnowfallInSeason] = useState(false);
  const count = slides.length;

  useEffect(() => {
    const updateSeason = () =>
      setSnowfallInSeason(isSnowfallSeasonActive(new Date()));
    updateSeason();
    const intervalId = window.setInterval(updateSeason, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const image = new window.Image();
    image.onload = () => setFlakeImage(image);
    image.onerror = () =>
      console.error("Failed to load the snowfall snowflake image:", image.src);
    image.src = "/assets/snowflake.svg";

    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, []);

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
      <div className="relative aspect-402/512 w-full overflow-hidden md:aspect-1440/500 md:max-h-150">
        {slides.map((s, i) => (
          <div
            key={`${s.href}-${i}`}
            aria-hidden={i !== index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <Link
              href={s.href}
              tabIndex={i === index ? 0 : -1}
              className="absolute inset-0"
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
            {i === index ? (
              <Link
                href="/products"
                className="absolute bottom-6 left-6 z-20 rounded-full bg-neutral-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Shop now
              </Link>
            ) : null}
          </div>
        ))}
        {snowfallInSeason ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 motion-reduce:hidden"
          >
            <Snowfall
              images={flakeImage ? [flakeImage] : undefined}
              color="#ffffff"
              snowflakeCount={80}
              radius={[10, 16]}
              opacity={[0.55, 0.9]}
              speed={[0.6, 1.8]}
              wind={[-0.35, 0.35]}
            />
          </div>
        ) : null}
      </div>
      {count > 1 ? (
        <div
          className={clsx(
            "absolute right-6 bottom-6 z-20 flex justify-center gap-2",
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
