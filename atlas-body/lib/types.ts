// Shared types for Atlas · Body. Pure data — safe to import on client and server.

export type Sex = "male" | "female";

/** A single weigh-in. Body-fat % may come from a scale, a caliper, DEXA, or estimate. */
export interface WeighIn {
  date: string; // ISO yyyy-mm-dd
  weightLb: number;
  bodyFatPct: number;
  source?: "manual" | "withings" | "demo";
}

/** The user's fixed profile + their target. */
export interface Profile {
  sex: Sex;
  heightCm: number;
  trainingAgeYears: number; // 0 = brand-new lifter; decays muscle-gain potential
  goalBodyFatPct: number; // the target physique
  weeklyDeficitPct: number; // % bodyweight/week, the chosen aggressiveness (default 0.7)
  proteinAdequate: boolean; // ≥0.7 g/lb → muscle retention
  resistanceTraining: boolean; // lifting → muscle retention
  units?: "imperial" | "metric"; // display only; storage is always lb/cm
}

/** Everything the app persists for one person. */
export interface BodyState {
  profile: Profile;
  weighIns: WeighIn[]; // chronological; last entry is "today"
}
