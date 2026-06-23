import { describe, expect, it } from "vitest";
import { computeBody, computeFfmi, inputFromState, type EngineInput } from "./engine";
import { DEMO_STATE } from "./demo";

const BASE: EngineInput = {
  sex: "male",
  heightCm: 178,
  weightLb: 180,
  bodyFatPct: 20,
  trainingAgeYears: 4,
  goalBodyFatPct: 12,
  weeklyDeficitPct: 0.5,
  proteinAdequate: true,
  resistanceTraining: true,
  adherence: 0.85,
  baseYear: 2026,
  baseMonth: 5,
};

describe("computeBody — decomposition", () => {
  it("splits weight into fat + lean", () => {
    const out = computeBody(BASE);
    expect(out.fatMassLb).toBeCloseTo(36, 0); // 20% of 180
    expect(out.leanMassLb).toBe(144);
  });

  it("is deterministic", () => {
    expect(computeBody(BASE)).toEqual(computeBody(BASE));
  });
});

describe("computeBody — the date", () => {
  it("reaches a sensible target within the horizon", () => {
    const out = computeBody(BASE);
    expect(out.reachable).toBe(true);
    expect(out.monthsOut).toBeGreaterThan(0);
    expect(out.monthsOut!).toBeLessThan(60);
    expect(out.targetYear).toBeGreaterThanOrEqual(2026);
    expect(out.notOnTrack).toBe(false);
  });

  it("is already reached when goal ≥ current body fat", () => {
    const out = computeBody({ ...BASE, goalBodyFatPct: 22 });
    expect(out.reachable).toBe(true);
    expect(out.monthsOut).toBe(0);
  });

  it("a steeper deficit reaches the goal sooner", () => {
    const gentle = computeBody({ ...BASE, weeklyDeficitPct: 0.3 });
    const aggressive = computeBody({ ...BASE, weeklyDeficitPct: 0.8 });
    expect(aggressive.monthsOut!).toBeLessThan(gentle.monthsOut!);
  });

  it("flags 'not on track' when the deficit is negligible", () => {
    const out = computeBody({ ...BASE, weeklyDeficitPct: 0.02, adherence: 0.3 });
    expect(out.reachable).toBe(false);
    expect(out.notOnTrack).toBe(true);
    expect(out.notOnTrackReason).toBeTruthy();
  });
});

describe("computeBody — lean mass (the protected number)", () => {
  it("holds muscle with protein + lifting at a sane deficit", () => {
    const out = computeBody(BASE);
    expect(out.leanStatus).toBe("holding");
    expect(out.leanCaption).toBeNull();
  });

  it("flags at-risk with a steep deficit, no protein, no lifting", () => {
    const out = computeBody({ ...BASE, weeklyDeficitPct: 1.5, proteinAdequate: false, resistanceTraining: false });
    expect(out.leanStatus).toBe("at-risk");
    expect(out.leanCaption).toContain("deficit too steep");
    expect(out.leanCaption).toContain("protein low");
    expect(out.projectedLeanLossLb).toBeGreaterThan(0);
  });

  it("loses real muscle when the cut is run badly", () => {
    const good = computeBody(BASE);
    const bad = computeBody({ ...BASE, weeklyDeficitPct: 1.5, proteinAdequate: false, resistanceTraining: false });
    expect(bad.projectedLeanMassLb).toBeLessThan(good.projectedLeanMassLb);
  });
});

describe("computeFfmi", () => {
  it("puts a lean, tall lifter near the natural ceiling", () => {
    const ffmi = computeFfmi(170, 180); // ~170 lb lean at 180 cm
    expect(ffmi).toBeGreaterThan(20);
    expect(ffmi).toBeLessThan(27);
  });
});

describe("inputFromState + demo", () => {
  it("the public demo is on track and lands in a believable window", () => {
    const latest = DEMO_STATE.weighIns[DEMO_STATE.weighIns.length - 1];
    const out = computeBody(inputFromState(DEMO_STATE.profile, latest, { baseYear: 2026, baseMonth: 5 }));
    expect(out.reachable).toBe(true);
    expect(out.leanStatus).toBe("holding");
    // honest, sustainable pace → a date that's a year or two out, not a fantasy 12 weeks
    expect(out.targetYear).toBeGreaterThanOrEqual(2027);
    expect(out.targetYear).toBeLessThanOrEqual(2028);
    expect(Math.round(out.leanMassLb)).toBeGreaterThanOrEqual(145);
    expect(Math.round(out.leanMassLb)).toBeLessThanOrEqual(149);
  });
});
