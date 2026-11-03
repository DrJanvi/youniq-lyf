import { defaultCountries, parseCountry } from "react-international-phone";

export const partnerCountries = defaultCountries
  .map(parseCountry)
  .sort((a, b) => a.name.localeCompare(b.name));

export const partnerCountryCallingCodes = new Set(
  partnerCountries.map((country) => `+${country.dialCode}`),
);
