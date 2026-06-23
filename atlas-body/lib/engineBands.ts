// Monte Carlo bands for the target date. One date is a lie — the real variable is adherence
// (the weeks you actually hit the deficit), so we sample it and report a p10–p90 range plus the
// odds you reach the goal at all. Mirrors the money module's "500 futures". See SPEC.md §4.

import { computeBody, MONTHS, type EngineInput } from "./engine";

export interface DateOut {
  month: string;
  year: number;
  monthsOut: number;
}
export interface Bands {
  p10: DateOut | null; // optimistic edge (earliest)
  p50: DateOut | null; // median
  p90: DateOut | null; // pessimistic edge (latest)
  probReach: number; // share of futures that reach the goal inside the horizon
  label: string; // ready-to-render, e.g. "80% odds · 2027 to 2028"
}

// Deterministic PRNG (mulberry32) so the band is stable across renders and fixtures.
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(rng: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function monthsToDate(m: number, baseYear: number, baseMonth: number): DateOut {
  const idx = baseMonth + m;
  return { month: MONTHS[((idx % 12) + 12) % 12], year: baseYear + Math.floor(idx / 12), monthsOut: m };
}

export function monteCarloBands(input: EngineInput, runs = 500, seed = 12345): Bands {
  const baseYear = input.baseYear ?? 2026;
  const baseMonth = input.baseMonth ?? 5;
  const meanAdherence = input.adherence ?? 0.85;
  const rng = mulberry32(seed);

  const reached: number[] = [];
  for (let i = 0; i < runs; i++) {
    // Sample this future's adherence around the user's honest estimate (σ = 0.12), clamped.
    const adherence = Math.min(1, Math.max(0.3, meanAdherence + 0.12 * gauss(rng)));
    const out = computeBody({ ...input, adherence });
    if (out.reachable && out.monthsOut != null) reached.push(out.monthsOut);
  }

  reached.sort((a, b) => a - b);
  const probReach = reached.length / runs;
  const q = (p: number): DateOut | null =>
    reached.length
      ? monthsToDate(reached[Math.min(reached.length - 1, Math.floor(p * reached.length))], baseYear, baseMonth)
      : null;

  const p10 = q(0.1);
  const p50 = q(0.5);
  const p90 = q(0.9);

  // p10–p90 is, by construction, the central 80% of futures — so the honest headline is an
  // "80% odds" window. If most futures never reach the goal in the horizon, say so plainly.
  let label: string;
  if (!p10 || !p90 || probReach < 0.6) {
    label = "not reachable at this rate";
  } else if (p10.year === p90.year) {
    label = `80% odds · ${p10.year}`;
  } else {
    label = `80% odds · ${p10.year} to ${p90.year}`;
  }

  return { p10, p50, p90, probReach, label };
}
