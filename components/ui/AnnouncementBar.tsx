"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Section } from "./Section";

type Announcement = { id: string; message: string; link: string | null };

export function AnnouncementBar({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const [index, setIndex] = useState(0);
  const count = announcements.length;

  useEffect(() => {
    if (count < 2) return;
    const timeout = window.setTimeout(
      () => setIndex((current) => (current + 1) % count),
      5000,
    );
    return () => window.clearTimeout(timeout);
  }, [index, count]);

  if (!count) return null;
  const activeIndex = index % count;
  const current = announcements[activeIndex];

  return (
    <Section
      as="div"
      role="region"
      aria-label="Announcements"
      aria-roledescription="carousel"
      className="bg-announcement-bg text-announcement-text py-2 text-center text-xs font-medium tracking-wide lg:text-left"
    >
      <div className="flex items-center gap-3">
        <div
          aria-live="polite"
          aria-atomic="true"
          className="min-w-0 flex-1 text-center lg:text-left"
        >
          {current.link ? (
            <Link href={current.link} className="hover:underline">
              {current.message}
            </Link>
          ) : (
            <span>{current.message}</span>
          )}
        </div>
        {count > 1 ? (
          <div className="flex shrink-0 items-center gap-1">
            {announcements.map((announcement, slideIndex) => (
              <button
                key={announcement.id}
                type="button"
                aria-label={`Show announcement ${slideIndex + 1} of ${count}`}
                aria-current={slideIndex === activeIndex}
                onClick={() => setIndex(slideIndex)}
                className={`size-2 rounded-full border border-white transition-colors ${
                  slideIndex === activeIndex ? "bg-brand-primary" : "bg-transparent"
                } hover:cursor-pointer`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </Section>
  );
}
