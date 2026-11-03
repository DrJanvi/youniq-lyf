// Intl has no symbol for AED, so substitute the Arabic dirham sign.
const CURRENCY_SYMBOLS: Record<string, string> = { AED: "د.إ" };

// Digits right after Arabic letters are reordered by the bidi algorithm and
// push the symbol to the right. Isolating the symbol (RLI...PDI) prevents that.
const isolateRtl = (s: string) => `\u2067${s}\u2069`;

export function formatMoney(amount: number, currency = "AED") {
  return new Intl.NumberFormat("en", { style: "currency", currency })
    .formatToParts(amount)
    .map((part) => {
      if (part.type !== "currency") return part.value;
      const symbol = CURRENCY_SYMBOLS[currency];
      return symbol ? isolateRtl(symbol) : part.value;
    })
    .join("");
}

export function PriceTag({
  price,
  finalPrice,
  currency = "AED",
}: {
  price: number;
  finalPrice: number;
  currency?: string;
}) {
  const discounted = finalPrice < price;
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-base font-medium">
        {formatMoney(finalPrice, currency)}
      </span>
      {discounted ? (
        <>
          <del className="text-text-strike text-sm">
            {formatMoney(price, currency)}
          </del>
        </>
      ) : null}
    </span>
  );
}
