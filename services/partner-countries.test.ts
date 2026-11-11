import assert from "node:assert/strict";
import test from "node:test";
import { getDefaultPartnerCountry } from "../lib/partner-countries";

test("defaults partner and career phone fields to India", () => {
  const country = getDefaultPartnerCountry();

  assert.equal(country.iso2, "in");
  assert.equal(country.dialCode, "91");
});
