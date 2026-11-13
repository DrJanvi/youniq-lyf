const CURRENCY_SYMBOLS: Record<string, string> = { INR: "₹" };

export function formatMoney(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en", { style: "currency", currency })
    .formatToParts(amount)
    .map((part) => {
      if (part.type !== "currency") return part.value;
      return CURRENCY_SYMBOLS[currency] ?? part.value;
    })
    .join("");
}

export function PriceTag({
  price,
  finalPrice,
  currency = "INR",
  compact = false,
}: {
  price: number;
  finalPrice: number;
  currency?: string;
  compact?: boolean;
}) {
  const discounted = finalPrice < price;
  return (
    <span
      className={`inline-flex items-center ${compact ? "flex-wrap gap-x-1 gap-y-0 md:gap-2" : "gap-2"}`}
    >
      <span
        className={`${compact ? "text-sm md:text-base" : "text-base"} font-medium`}
      >
        {formatMoney(finalPrice, currency)}
      </span>
      {discounted ? (
        <>
          <del
            className={`text-text-strike ${compact ? "text-xs md:text-sm" : "text-sm"}`}
          >
            {formatMoney(price, currency)}
          </del>
        </>
      ) : null}
    </span>
  );
}
