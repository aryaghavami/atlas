// Body-fat estimation from tape measurements (US Navy / Hodgdon-Beckett). Used in onboarding
// when there's no scale handy. Honest about its error band (±3–4%) in the UI copy, not here.

import type { Sex } from "./types";

const CM_PER_IN = 2.54;

export interface NavyInput {
  sex: Sex;
  heightCm: number;
  neckCm: number;
  waistCm: number; // at the navel
  hipCm?: number; // women only, at the widest
}

/** Returns estimated body-fat %, clamped to a sane [3, 60] range. */
export function navyBodyFat(i: NavyInput): number {
  const h = i.heightCm / CM_PER_IN;
  const neck = i.neckCm / CM_PER_IN;
  const waist = i.waistCm / CM_PER_IN;

  let pct: number;
  if (i.sex === "male") {
    pct = 86.01 * log10(waist - neck) - 70.041 * log10(h) + 36.76;
  } else {
    const hip = (i.hipCm ?? i.waistCm) / CM_PER_IN;
    pct = 163.205 * log10(waist + hip - neck) - 97.684 * log10(h) - 78.387;
  }
  return Math.min(60, Math.max(3, Math.round(pct * 10) / 10));
}

function log10(x: number): number {
  return Math.log(x) / Math.LN10;
}
