import { describe, expect, it } from "vitest";
import { calculateRoute } from "./calc";
import { diffRankings, rankRoutes } from "./rank";
import { SAMPLE_EVIDENCE, SAMPLE_FX, SAMPLE_PROFILE_FAMILY, SAMPLE_PROFILE_SOLO, SAMPLE_ROUTES } from "./sample";

const solo = rankRoutes(SAMPLE_ROUTES, SAMPLE_PROFILE_SOLO, SAMPLE_FX, SAMPLE_EVIDENCE);
const family = rankRoutes(SAMPLE_ROUTES, SAMPLE_PROFILE_FAMILY, SAMPLE_FX, SAMPLE_EVIDENCE);
const canada = SAMPLE_ROUTES.find((r) => r.key === "ca-express");
if (!canada) throw new Error('Canada sample route is missing');

describe("acceptance: same degree and career, different households", () => {
  it("excludes a route that bars dependants when the family must move together", () => {
    expect(family.excluded.map((r) => r.key)).toContain("uk-msc");
    expect(solo.excluded.map((r) => r.key)).not.toContain("uk-msc");
  });

  it("charges per-person fees and proof of funds for every family member", () => {
    const a = calculateRoute(canada, SAMPLE_PROFILE_SOLO, SAMPLE_FX);
    const b = calculateRoute(canada, SAMPLE_PROFILE_FAMILY, SAMPLE_FX);
    expect(b.upfrontTotal).toBeGreaterThan(a.upfrontTotal);
    if (!b.proofOfFunds || !a.proofOfFunds) throw new Error('Missing proof-of-funds amounts');
    expect(b.proofOfFunds.required).toBeGreaterThan(a.proofOfFunds.required);
  });

  it("does not count proof of funds twice when it overlaps settlement money", () => {
    const a = calculateRoute(canada, SAMPLE_PROFILE_SOLO, SAMPLE_FX);
    const settlement = a.lines.filter((l) => l.category === "settlement").reduce((s, l) => s + (l.amountUser ?? 0), 0);
    const others = a.lines.filter((l) => l.category !== "settlement" && l.category !== "proof_of_funds").reduce((s, l) => s + (l.amountUser ?? 0), 0);
    if (!a.proofOfFunds) throw new Error('Missing proof-of-funds amount');
    expect(Math.round(a.upfrontTotal)).toBe(Math.round(others + Math.max(settlement, a.proofOfFunds.required)));
  });

  it("produces a different ordering for the two households", () => {
    expect(solo.shown.map((r) => r.key)).not.toEqual(family.shown.map((r) => r.key));
  });

  it("flags a spouse-work route as needing verification when the spouse must work", () => {
    const us = [...family.shown, ...family.overflow].find((r) => r.key === "us-h1b");
    expect(us?.status).toBe("needs_verification");
  });

  it("shows at most five routes and gives the family a third-ranked route", () => {
    expect(solo.shown.length).toBeLessThanOrEqual(5);
    expect(family.shown[2]).toBeDefined();
  });

  it("limited savings makes the family's timeline or gap larger", () => {
    const a = calculateRoute(canada, SAMPLE_PROFILE_SOLO, SAMPLE_FX);
    const b = calculateRoute(canada, SAMPLE_PROFILE_FAMILY, SAMPLE_FX);
    expect(b.feasibleInMonths).toBeGreaterThanOrEqual(a.feasibleInMonths);
    expect(b.fundingGapAtDeparture).toBeGreaterThan(a.fundingGapAtDeparture);
  });

  it("explains which routes change when savings change", () => {
    const richer = rankRoutes(SAMPLE_ROUTES, { ...SAMPLE_PROFILE_FAMILY, finances: { ...SAMPLE_PROFILE_FAMILY.finances, savings: 6000000 } }, SAMPLE_FX, SAMPLE_EVIDENCE);
    const changes = diffRankings(family, richer, "INR");
    expect(changes.length).toBeGreaterThan(0);
  });
});
