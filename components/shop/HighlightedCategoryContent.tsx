"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { StorefrontLink as Link } from "@/components/layout/StorefrontLink";
import { Section } from "../ui/Section";

type Props = {
  image: string;
  title: string;
  description: string;
  buttonLink: string;
  timerEndAt: string;
  durationSeconds: number;
  autoRestart: boolean;
  initialRemainingSeconds: number;
};

export function HighlightedCategoryContent({
  image,
  title,
  description,
  buttonLink,
  timerEndAt,
  durationSeconds,
  autoRestart,
  initialRemainingSeconds,
}: Props) {
  const [remainingSeconds, setRemainingSeconds] = useState(initialRemainingSeconds);

  useEffect(() => {
    let deadline = new Date(timerEndAt).getTime();
    const interval = window.setInterval(() => {
      const now = Date.now();
      if (now >= deadline) {
        if (!autoRestart) {
          setRemainingSeconds(0);
          window.clearInterval(interval);
          return;
        }
        const cyclesElapsed = Math.floor((now - deadline) / (durationSeconds * 1000)) + 1;
        deadline += cyclesElapsed * durationSeconds * 1000;
      }
      setRemainingSeconds(Math.max(0, Math.ceil((deadline - now) / 1000)));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [autoRestart, durationSeconds, timerEndAt]);

  if (remainingSeconds === 0 && !autoRestart) return null;

  const time = [
    { label: "Days", value: Math.floor(remainingSeconds / 86400) },
    { label: "Hours", value: Math.floor((remainingSeconds % 86400) / 3600) },
    { label: "Minutes", value: Math.floor((remainingSeconds % 3600) / 60) },
    { label: "Seconds", value: remainingSeconds % 60 },
  ];

  return (
    <Section
      className="gap-8 overflow-hidden rounded-[2.5rem] bg-surface-main"
      contentClassName="py-16 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8"
    >
      <div className="flex flex-col items-center justify-center text-center">
        <h2 className="font-cormorant text-4xl font-medium uppercase">{title}</h2>
        <p className="text-text-muted mt-3 max-w-[40ch] text-sm">{description}</p>
        <div className="mt-6 grid grid-cols-4 gap-2" aria-label="Time remaining">
          {time.map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-2">
              <div className="flex aspect-4/3 items-center justify-center rounded-xl bg-surface-card text-3xl font-semibold">
                {String(value).padStart(2, "0")}
              </div>
              <div>{label}</div>
            </div>
          ))}
        </div>
        <Link
          href={buttonLink}
          className="bg-brand-primary-dark text-white mt-8 flex items-center justify-center gap-2 rounded-full px-6 py-3 hover:bg-black"
        >
          Explore More
          <Image src="/assets/arrow.svg" alt="" width={20} height={15} aria-hidden="true" />
        </Link>
      </div>
      <Image
        src={image}
        alt={title}
        width={423}
        height={228}
        unoptimized
        className="w-full rounded-3xl"
      />
    </Section>
  );
}
