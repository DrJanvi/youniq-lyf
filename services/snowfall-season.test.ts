import assert from "node:assert/strict";
import test from "node:test";
import { isSnowfallSeasonActive } from "../lib/snowfall-season";

test("snowfall starts at midnight IST on November 1", () => {
  assert.equal(
    isSnowfallSeasonActive(new Date("2026-10-31T18:29:59.999Z")),
    false,
  );
  assert.equal(
    isSnowfallSeasonActive(new Date("2026-10-31T18:30:00.000Z")),
    true,
  );
});

test("snowfall remains active through February 11 and stops at February 12 IST", () => {
  assert.equal(
    isSnowfallSeasonActive(new Date("2027-02-11T18:29:59.999Z")),
    true,
  );
  assert.equal(
    isSnowfallSeasonActive(new Date("2027-02-11T18:30:00.000Z")),
    false,
  );
});

test("snowfall is active each winter and disabled outside the season", () => {
  assert.equal(isSnowfallSeasonActive(new Date("2027-01-15T12:00:00.000Z")), true);
  assert.equal(isSnowfallSeasonActive(new Date("2027-06-15T12:00:00.000Z")), false);
  assert.equal(isSnowfallSeasonActive(new Date("2027-11-15T12:00:00.000Z")), true);
});
