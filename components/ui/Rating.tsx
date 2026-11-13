import { StarIcon as SolidStarIcon } from "@heroicons/react/24/solid";

export function Rating({
  value,
  count,
  compact = false,
}: {
  value: number;
  count?: number;
  compact?: boolean;
}) {
  const roundedValue = Math.round(value);

  return (
    <span
      aria-label={`Rated ${value.toFixed(1)} out of 5`}
      className={`flex items-center ${compact ? "gap-0.5 text-[10px] md:gap-1 md:text-xs" : "gap-1 text-xs"}`}
    >
      <span aria-hidden="true" className="inline-flex">
        {Array.from({ length: roundedValue }, (_, index) => (
          <SolidStarIcon
            key={`filled-${index}`}
            className={`text-rating-gold ${compact ? "size-3 md:size-4" : "size-4"}`}
          />
        ))}
        {Array.from({ length: 5 - roundedValue }, (_, index) => (
          <SolidStarIcon
            key={`empty-${index}`}
            className={`text-black/10 ${compact ? "size-3 md:size-4" : "size-4"}`}
          />
        ))}
      </span>
      <span className="text-text-muted font-semibold">
        {value ? value.toFixed(1) : null} {count ? ` (${count})` : null}
      </span>
    </span>
  );
}
