"use client";

import { useEffect, useState } from "react";
import {
  getDefaultPartnerCountry,
  getPartnerCountryForPhone,
  type PartnerCountry,
} from "@/lib/partner-countries";
import { limitPhoneDigits, MAX_PHONE_DIGITS } from "@/lib/validation";
import { CountryCodeSelector } from "@/components/shop/CountryCodeSelector";

function getNationalNumber(phone: string, country: PartnerCountry) {
  const countryCode = `+${country.dialCode}`;
  if (!phone.startsWith(countryCode)) return phone.trim();
  return phone.slice(countryCode.length).trim();
}

export function InternationalPhoneField({
  id,
  name,
  value,
  onChange,
  onBlur,
  inputRef,
  autoComplete = "tel-national",
  placeholder = "Enter your mobile number",
  invalid = false,
  describedBy,
  className = "rounded-lg",
}: {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  inputRef: React.Ref<HTMLInputElement>;
  autoComplete?: string;
  placeholder?: string;
  invalid?: boolean;
  describedBy?: string;
  className?: string;
}) {
  const [selectedCountry, setSelectedCountry] = useState(
    () => getPartnerCountryForPhone(value) ?? getDefaultPartnerCountry(),
  );
  const countryCode = `+${selectedCountry.dialCode}`;
  const nationalNumber = getNationalNumber(value, selectedCountry);
  const maxNationalDigits = MAX_PHONE_DIGITS - selectedCountry.dialCode.length;

  useEffect(() => {
    if (value && !value.startsWith("+")) {
      onChange(`${countryCode} ${value.trim()}`);
    }
  }, [countryCode, onChange, value]);

  function selectCountry(country: PartnerCountry) {
    const nextNationalNumber = getNationalNumber(value, selectedCountry);
    setSelectedCountry(country);
    onChange(
      nextNationalNumber
        ? `+${country.dialCode} ${nextNationalNumber}`
        : "",
    );
  }

  return (
    <div
      className={`flex h-12 w-full overflow-hidden border border-surface-border bg-white transition-colors focus-within:border-brand-taupe focus-within:ring-2 focus-within:ring-brand-taupe/40 aria-invalid:border-badge-sale-text aria-invalid:ring-badge-sale-text/20 ${className}`}
      aria-invalid={invalid}
    >
      <CountryCodeSelector
        selectedCountry={selectedCountry}
        onSelect={selectCountry}
        className="inline-flex h-full shrink-0 items-center gap-1 border-r border-surface-border px-3 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-brand-taupe focus-visible:ring-inset sm:px-4"
      />
      <input
        id={id}
        name={name}
        ref={inputRef}
        type="tel"
        inputMode="tel"
        autoComplete={autoComplete}
        value={nationalNumber}
        placeholder={placeholder}
        aria-label="Mobile number"
        aria-invalid={invalid}
        aria-describedby={describedBy}
        onBlur={onBlur}
        onChange={(event) => {
          const number = limitPhoneDigits(
            event.currentTarget.value,
            maxNationalDigits,
          );
          event.currentTarget.value = number;
          onChange(number ? `${countryCode} ${number}` : "");
        }}
        className="min-w-0 flex-1 bg-transparent px-3 text-sm text-text-primary outline-none placeholder:text-text-muted sm:px-4"
      />
    </div>
  );
}
