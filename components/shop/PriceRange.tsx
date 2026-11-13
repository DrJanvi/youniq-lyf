"use client";

import { useState } from "react";
import { formatMoney } from "@/components/ui/PriceTag";

export function PriceRange({
  min,
  max,
  selectedMin,
  selectedMax,
}: {
  min: number;
  max: number;
  selectedMin?: string;
  selectedMax?: string;
}) {
  const upperBound = Math.max(max, min + 1);
  const parsedMin = selectedMin === undefined ? min : Number(selectedMin);
  const parsedMax =
    selectedMax === undefined ? upperBound : Number(selectedMax);
  const initialMin = Math.min(
    upperBound,
    Math.max(min, Number.isFinite(parsedMin) ? parsedMin : min),
  );
  const initialMax = Math.max(
    initialMin,
    Math.min(upperBound, Number.isFinite(parsedMax) ? parsedMax : upperBound),
  );
  const [range, setRange] = useState({ min: initialMin, max: initialMax });
  const minPercent = ((range.min - min) / (upperBound - min)) * 100;
  const maxPercent = ((range.max - min) / (upperBound - min)) * 100;

  return (
    <div>
      <div className="relative h-6">
        <div className="relative mx-[11px] h-full">
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-surface-card" />
          <div
            className="bg-brand-primary absolute top-1/2 h-1 -translate-y-1/2 rounded-full"
            style={{
              left: `${minPercent}%`,
              right: `${100 - maxPercent}%`,
            }}
          />
          <input
            aria-label="Minimum price"
            className="price-range-thumb"
            type="range"
            name="minPrice"
            min={min}
            max={upperBound}
            step={1}
            value={range.min}
            onChange={(event) => {
              const value = Math.min(
                Number(event.currentTarget.value),
                range.max,
              );
              setRange((current) => ({ ...current, min: value }));
            }}
          />
          <input
            aria-label="Maximum - price"
            className="price-range-thumb"
            type="range"
            name="maxPrice"
            min={min}
            max={upperBound}
            step={1}
            value={range.max}
            onChange={(event) => {
              const value = Math.max(
                Number(event.currentTarget.value),
                range.min,
              );
              setRange((current) => ({ ...current, max: value }));
            }}
          />
        </div>
      </div>
      <div className="mt-2 flex justify-between text-base font-medium">
        <output>{formatMoney(range.min, "INR")}</output>
        <output>{formatMoney(range.max, "INR")}</output>
      </div>
    </div>
  );
}
