"use client";

import { partnerCountries, type PartnerCountry } from "@/lib/partner-countries";
import { ChevronDown, Search } from "lucide-react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { useMemo, useState } from "react";

export function CountryCodeSelector({
  selectedCountry,
  onSelect,
  className,
}: {
  selectedCountry: PartnerCountry;
  onSelect: (country: PartnerCountry) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filteredCountries = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    if (!search) return partnerCountries;
    return partnerCountries.filter((country) =>
      `${country.name} +${country.dialCode}`
        .toLocaleLowerCase()
        .includes(search),
    );
  }, [query]);

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) setQuery("");
      }}
    >
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label={`Country calling code: ${selectedCountry.name} +${selectedCountry.dialCode}`}
          className={
            className ??
            "inline-flex h-full shrink-0 items-center gap-1 border-r border-[#eee8e5] px-4 text-sm text-[#4c4542] outline-none focus-visible:ring-2 focus-visible:ring-[#b99082] focus-visible:ring-inset"
          }
        >
          +{selectedCountry.dialCode}
          <ChevronDown className="size-4 text-[#8d817c]" aria-hidden="true" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          className="z-70 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#eee8e5] bg-white p-2 text-[#251f1d] shadow-xl outline-none"
        >
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#8d817c]"
              aria-hidden="true"
            />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder="Search country or code"
              aria-label="Search country calling codes"
              className="h-10 w-full rounded-xl border border-[#eee8e5] bg-white pr-3 pl-9 text-sm outline-none placeholder:text-[#aaa] focus:border-[#b99082] focus:ring-2 focus:ring-[#b99082]/20"
            />
          </div>
          <div
            role="listbox"
            aria-label="Country calling codes"
            className="mt-2 max-h-64 overflow-y-auto overscroll-contain"
          >
            {filteredCountries.map((country) => {
              const isSelected = country.iso2 === selectedCountry.iso2;
              return (
                <button
                  key={country.iso2}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelect(country);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-[#f8f2ef] focus-visible:bg-[#f8f2ef] focus-visible:outline-none"
                >
                  <span>{country.name}</span>
                  <span className="shrink-0 text-[#746963]">
                    +{country.dialCode}
                  </span>
                </button>
              );
            })}
            {!filteredCountries.length ? (
              <p className="px-3 py-5 text-center text-sm text-[#746963]">
                No matching country codes
              </p>
            ) : null}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
