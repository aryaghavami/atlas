// Atlas · Body engine — the honest projected date you reach your body-composition target.
// Pure, deterministic, unit-tested. Honest before encouraging: real fat-loss rates, a muscle
// loss penalty when the deficit is too steep, and the natural FFMI ceiling. See SPEC.md §3.

import type { Profile, Sex, WeighIn } from "./types";

export interface EngineInput {
  sex: Sex;
  heightCm: number;
  weightLb: number;
  bodyFatPct: number; // current, measured
  trainingAgeYears: number;
  goalBodyFatPct: number;
  weeklyDeficitPct?: number; // % bodyweight/week (default 0.7 — sustainable)
  proteinAdequate?: boolean; // default true
  resistanceTraining?: boolean; // default true
  adherence?: number; // 0–1, share of weeks you actually hit the deficit (default 0.85)
  baseYear?: number;
  baseMonth?: number; // 0-indexed
}

export type LeanStatus = "holding" | "at-risk";

export interface EngineOutput {
  // The snapshot ("today")
  bodyFatPct: number;
  fatMassLb: number;
  leanMassLb: number;
  ffmi: number;
  ffmiCeiling: number;
  ffmiHeadroom: number;

  // The protected number — lean mass trajectory
  leanStatus: LeanStatus;
  leanCaption: string | null; // e.g. "deficit too steep · protein low"
  projectedLeanMassLb: number; // lean mass when the goal is reached (or at horizon)
  projectedLeanLossLb: number; // start − projected (positive = muscle lost)

  // The date
  reachable: boolean;
  monthsOut: number | null;
  targetMonth: string | null;
  targetYear: number | null;

  // Honesty
  notOnTrack: boolean;
  notOnTrackReason: string | null;
}

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKS_PER_MONTH = 4.345;
const HORIZON_MONTHS = 120; // 10 years — reachable within this is "on track"
const EXTENDED_MONTHS = 600; // 50 years — used only to date an honest "not before" message
export const FFMI_CEILING = 25; // natural fat-free mass index ceiling

const LB_PER_KG = 2.2046226218;

/** Fat-free mass index, height-normalized (Kouri). lean in lb, height in cm. */
export function computeFfmi(leanMassLb: number, heightCm: number): number {
  const leanKg = leanMassLb / LB_PER_KG;
  const hM = heightCm / 100;
  return leanKg / (hM * hM) + 6.1 * (1.8 - hM);
}

/**
 * Muscle a natural lifter can add per month, as a fraction of bodyweight, by training age.
 * Decays hard — the honest curve. (Year 1 ≈ 1%/mo, year 2 ≈ 0.5%, year 3 ≈ 0.25%, then ~0.)
 */
function monthlyGainFraction(trainingAgeYears: number): number {
  if (trainingAgeYears < 1) return 0.0100;
  if (trainingAgeYears < 2) return 0.0050;
  if (trainingAgeYears < 3) return 0.0025;
  if (trainingAgeYears < 5) return 0.0010;
  return 0.0004;
}

/** What share of weight lost comes from muscle, given how the cut is run. 0 = all fat. */
function leanLossFraction(p: {
  weeklyDeficitPct: number;
  proteinAdequate: boolean;
  resistanceTraining: boolean;
}): number {
  let frac = 0;
  if (!p.proteinAdequate) frac += 0.25;
  if (!p.resistanceTraining) frac += 0.3;
  if (p.weeklyDeficitPct > 1.0) frac += (p.weeklyDeficitPct - 1.0) * 0.3;
  return Math.min(0.6, Math.max(0, frac));
}

function monthsToDate(m: number, baseYear: number, baseMonth: number) {
  const idx = baseMonth + m;
  return {
    targetMonth: MONTHS[((idx % 12) + 12) % 12],
    targetYear: baseYear + Math.floor(idx / 12),
  };
}

export function computeBody(input: EngineInput): EngineOutput {
  const weeklyDeficitPct = input.weeklyDeficitPct ?? 0.7;
  const proteinAdequate = input.proteinAdequate ?? true;
  const resistanceTraining = input.resistanceTraining ?? true;
  const adherence = clamp(input.adherence ?? 0.85, 0, 1);
  const baseYear = input.baseYear ?? 2026;
  const baseMonth = input.baseMonth ?? 5;

  // Snapshot decomposition.
  const startFat = input.weightLb * (input.bodyFatPct / 100);
  const startLean = input.weightLb - startFat;
  const ffmi = computeFfmi(startLean, input.heightCm);

  const leanFrac = leanLossFraction({ weeklyDeficitPct, proteinAdequate, resistanceTraining });

  // Lean-mass status + caption. Independent of whether the date is reachable: you can be on
  // track to lose fat while quietly bleeding muscle.
  const reasons: string[] = [];
  if (weeklyDeficitPct > 1.0) reasons.push("deficit too steep");
  if (!proteinAdequate) reasons.push("protein low");
  if (!resistanceTraining) reasons.push("no lifting");
  const leanStatus: LeanStatus = leanFrac >= 0.1 ? "at-risk" : "holding";
  const leanCaption = leanStatus === "at-risk" && reasons.length ? reasons.join(" · ") : null;

  // Already at or below the target? Reached now.
  if (input.goalBodyFatPct >= input.bodyFatPct) {
    return {
      bodyFatPct: round1(input.bodyFatPct),
      fatMassLb: round1(startFat),
      leanMassLb: Math.round(startLean),
      ffmi: round1(ffmi),
      ffmiCeiling: FFMI_CEILING,
      ffmiHeadroom: round1(FFMI_CEILING - ffmi),
      leanStatus,
      leanCaption,
      projectedLeanMassLb: Math.round(startLean),
      projectedLeanLossLb: 0,
      reachable: true,
      monthsOut: 0,
      targetMonth: MONTHS[baseMonth],
      targetYear: baseYear,
      notOnTrack: false,
      notOnTrackReason: null,
    };
  }

  // Month-by-month projection of the cut. We run past the 10-year horizon (up to 50 years) only so
  // an off-track date can name the real crossing year instead of a flat ceiling.
  let fat = startFat;
  let lean = startLean;
  let reached = -1;
  let leanAtHorizon = lean; // lean mass captured at the on-track horizon, for the off-track readout
  for (let m = 1; m <= EXTENDED_MONTHS; m++) {
    const weight = fat + lean;
    const monthlyLoss = weight * (weeklyDeficitPct / 100) * WEEKS_PER_MONTH * adherence;
    const leanLoss = monthlyLoss * leanFrac;
    const fatLoss = monthlyLoss - leanLoss;

    // Novice/early lifters can still add a little muscle in a modest deficit (recomp).
    const gain =
      resistanceTraining && proteinAdequate && weeklyDeficitPct <= 0.7
        ? weight * monthlyGainFraction(input.trainingAgeYears + m / 12)
        : 0;

    fat = Math.max(weight * 0.04, fat - fatLoss); // never below ~4% essential fat
    lean = lean - leanLoss + gain;
    if (m === HORIZON_MONTHS) leanAtHorizon = lean;

    const bf = (fat / (fat + lean)) * 100;
    if (bf <= input.goalBodyFatPct) {
      reached = m;
      break;
    }
  }

  const onTrack = reached > 0 && reached <= HORIZON_MONTHS;

  if (!onTrack) {
    // Either it crosses beyond the 10-year horizon, or never at this pace.
    const crossingYear = reached > 0 ? monthsToDate(reached, baseYear, baseMonth).targetYear : null;
    const projectedLean = Math.round(reached > 0 ? lean : leanAtHorizon);
    const reason =
      reached > 0
        ? "More than ten years out at this pace. Honest, not encouraging."
        : "The deficit is too small to move the date. It is honest, not encouraging.";
    return {
      bodyFatPct: round1(input.bodyFatPct),
      fatMassLb: round1(startFat),
      leanMassLb: Math.round(startLean),
      ffmi: round1(ffmi),
      ffmiCeiling: FFMI_CEILING,
      ffmiHeadroom: round1(FFMI_CEILING - ffmi),
      leanStatus,
      leanCaption,
      projectedLeanMassLb: projectedLean,
      projectedLeanLossLb: round1(startLean - (reached > 0 ? lean : leanAtHorizon)),
      reachable: false,
      monthsOut: null,
      targetMonth: null,
      targetYear: crossingYear, // null → "not in reach at this rate"
      notOnTrack: true,
      notOnTrackReason: reason,
    };
  }

  const projectedLean = Math.round(lean);
  const projectedLeanLoss = round1(startLean - lean);

  const { targetMonth, targetYear } = monthsToDate(reached, baseYear, baseMonth);
  return {
    bodyFatPct: round1(input.bodyFatPct),
    fatMassLb: round1(startFat),
    leanMassLb: Math.round(startLean),
    ffmi: round1(ffmi),
    ffmiCeiling: FFMI_CEILING,
    ffmiHeadroom: round1(FFMI_CEILING - ffmi),
    leanStatus,
    leanCaption,
    projectedLeanMassLb: projectedLean,
    projectedLeanLossLb: projectedLeanLoss,
    reachable: true,
    monthsOut: reached,
    targetMonth,
    targetYear,
    notOnTrack: false,
    notOnTrackReason: null,
  };
}

/** Convenience: build engine input from stored profile + the latest weigh-in. */
export function inputFromState(
  profile: Profile,
  latest: WeighIn,
  opts?: { adherence?: number; baseYear?: number; baseMonth?: number },
): EngineInput {
  return {
    sex: profile.sex,
    heightCm: profile.heightCm,
    weightLb: latest.weightLb,
    bodyFatPct: latest.bodyFatPct,
    trainingAgeYears: profile.trainingAgeYears,
    goalBodyFatPct: profile.goalBodyFatPct,
    weeklyDeficitPct: profile.weeklyDeficitPct,
    proteinAdequate: profile.proteinAdequate,
    resistanceTraining: profile.resistanceTraining,
    adherence: opts?.adherence,
    baseYear: opts?.baseYear,
    baseMonth: opts?.baseMonth,
  };
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}
function round1(x: number): number {
  return Math.round(x * 10) / 10;
}
