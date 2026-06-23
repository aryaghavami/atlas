// Representative demo — the public experience before you enter your own numbers. Tuned to land
// in the design's "on track" state: ~18% body fat, ~147 lb lean, an honest date in 2027.

import type { BodyState } from "./types";

export const DEMO_STATE: BodyState = {
  profile: {
    sex: "male",
    heightCm: 178, // 5'10"
    trainingAgeYears: 4, // seasoned lifter — muscle holds, gains are slow
    goalBodyFatPct: 10, // lean, visible — a real target, honestly far
    weeklyDeficitPct: 0.16, // gentle and sustainable; the date is the price of holding muscle
    proteinAdequate: true,
    resistanceTraining: true,
    units: "imperial",
  },
  weighIns: [
    { date: "2026-04-20", weightLb: 184.2, bodyFatPct: 20.1, source: "demo" },
    { date: "2026-05-18", weightLb: 182.0, bodyFatPct: 19.2, source: "demo" },
    { date: "2026-06-15", weightLb: 180.1, bodyFatPct: 18.4, source: "demo" }, // lean ≈ 147
  ],
};
