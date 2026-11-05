import { defaultCountries, parseCountry } from "react-international-phone";

export const partnerCountries = defaultCountries
  .map(parseCountry)
  .sort((a, b) => a.name.localeCompare(b.name));

export type PartnerCountry = (typeof partnerCountries)[number];

export function getDefaultPartnerCountry(): PartnerCountry {
  const country = partnerCountries.find((option) => option.iso2 === "ae");
  if (!country)
    throw new Error("The country list must include the United Arab Emirates.");
  return country;
}

export function getPartnerCountryForPhone(phone: string): PartnerCountry | undefined {
  const normalizedPhone = phone.trim();
  return partnerCountries
    .filter((country) => normalizedPhone.startsWith(`+${country.dialCode}`))
    .sort((a, b) => b.dialCode.length - a.dialCode.length)[0];
}

export const partnerCountryCallingCodes = new Set(
  partnerCountries.map((country) => `+${country.dialCode}`),
);
