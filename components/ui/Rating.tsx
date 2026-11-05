import { StarIcon as SolidStarIcon } from "@heroicons/react/24/solid";

export function Rating({ value, count }: { value: number; count?: number }) {
  const roundedValue = Math.round(value);

  return (
    <span
      aria-label={`Rated ${value.toFixed(1)} out of 5`}
      className="flex items-center gap-1 text-xs"
    >
      <span aria-hidden="true" className="inline-flex">
        {Array.from({ length: roundedValue }, (_, index) => (
          <SolidStarIcon
            key={`filled-${index}`}
            className="text-rating-gold size-4"
          />
        ))}
        {Array.from({ length: 5 - roundedValue }, (_, index) => (
          <SolidStarIcon
            key={`empty-${index}`}
            className="size-4 text-black/10"
          />
        ))}
      </span>
      <span className="text-text-muted font-semibold">
        {value ? value.toFixed(1) : null} {count ? ` (${count})` : null}
      </span>
    </span>
  );
}
