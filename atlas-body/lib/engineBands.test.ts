import { describe, expect, it } from "vitest";
import { monteCarloBands } from "./engineBands";
import type { EngineInput } from "./engine";

const BASE: EngineInput = {
  sex: "male", heightCm: 178, weightLb: 180, bodyFatPct: 20, trainingAgeYears: 4,
  goalBodyFatPct: 12, weeklyDeficitPct: 0.5, proteinAdequate: true, resistanceTraining: true,
  adherence: 0.85, baseYear: 2026, baseMonth: 5,
};

describe("monteCarloBands", () => {
  it("returns a monotonic p10 ≤ p50 ≤ p90 band", () => {
    const b = monteCarloBands(BASE);
    expect(b.p10).not.toBeNull();
    expect(b.p10!.monthsOut).toBeLessThanOrEqual(b.p50!.monthsOut);
    expect(b.p50!.monthsOut).toBeLessThanOrEqual(b.p90!.monthsOut);
  });

  it("reports odds in [0,1] and a human label", () => {
    const b = monteCarloBands(BASE);
    expect(b.probReach).toBeGreaterThan(0);
    expect(b.probReach).toBeLessThanOrEqual(1);
    expect(b.label).toMatch(/odds/);
  });

  it("is deterministic across runs (seeded PRNG)", () => {
    expect(monteCarloBands(BASE)).toEqual(monteCarloBands(BASE));
  });

  it("says 'not reachable' when the goal can't be hit", () => {
    const b = monteCarloBands({ ...BASE, weeklyDeficitPct: 0.01, adherence: 0.3 });
    expect(b.label).toMatch(/not reachable/i);
  });
});
