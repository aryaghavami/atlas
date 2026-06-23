import type { EngineInput } from "./engine";

// Monte Carlo bands for the target date. A single date is a lie when net worth is
// dominated by a volatile asset, so we sample return paths (high vol on the volatile
// sleeve) and report a distribution. See ../ENGINE.md §6.

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export interface DateOut { month: string; year: number; monthsOut: number; }
export interface Bands { p10: DateOut | null; p50: DateOut | null; p90: DateOut | null; probReach: number; }

function monthsToDate(m: number, baseYear: number, baseMonth: number): DateOut {
  const idx = baseMonth + m;
  return { month: MONTHS[((idx % 12) + 12) % 12], year: baseYear + Math.floor(idx / 12), monthsOut: m };
}

// Deterministic PRNG (mulberry32) so results are stable across runs/fixtures.
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(rng: () => number) {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// The FI number (4% rule): 25× annual burn.
export function fiNumber(monthlyBurn: number): number {
  return Math.round(monthlyBurn * 12 * 25);
}

export function monteCarloBands(input: EngineInput, runs = 500, seed = 12345): Bands {
  const rng = mulberry32(seed);
  const r = input.expectedAnnualReturn ?? 0.06;
  const baseYear = input.baseYear ?? 2026;
  const baseMonth = input.baseMonth ?? 5;
  const VOL_NEAR = 0.15; // annualized vol, equities sleeve
  const VOL_VOL = 0.6; // annualized vol, volatile/crypto sleeve
  const HORIZON = 600;

  const debtService = input.liabilities.reduce((a, x) => a + x.minPayment, 0);
  const contribution = input.monthlyIncome - (input.monthlyBurn + debtService);
  const initCash = input.accounts.filter((a) => a.tier === "liquid").reduce((a, x) => a + x.balance, 0);
  const initNear = input.accounts.filter((a) => a.tier === "near").reduce((a, x) => a + x.balance, 0);
  const initVol = input.accounts.filter((a) => a.tier === "volatile").reduce((a, x) => a + x.balance, 0);
  const other = input.accounts.filter((a) => a.tier === "illiquid").reduce((a, x) => a + x.balance, 0);

  const reached: number[] = [];
  for (let run = 0; run < runs; run++) {
    let cash = initCash, near = initNear, vol = initVol;
    const debts = input.liabilities.map((l) => ({ ...l })).sort((a, b) => b.apr - a.apr);
    for (let m = 1; m <= HORIZON; m++) {
      near *= 1 + (r / 12 + (VOL_NEAR / Math.sqrt(12)) * gauss(rng));
      vol *= Math.max(0, 1 + (r / 12 + (VOL_VOL / Math.sqrt(12)) * gauss(rng)));
      for (const d of debts) d.balance *= 1 + d.apr / 12;
      let c = contribution;
      if (c > 0) {
        for (const d of debts) {
          if (d.balance > 0 && d.apr > r && c > 0) {
            const p = Math.min(c, d.balance);
            d.balance -= p;
            c -= p;
          }
        }
        if (c > 0) near += c;
      } else {
        let def = -c;
        const fc = Math.min(cash, def);
        cash -= fc;
        def -= fc;
        if (def > 0) near -= def;
      }
      const debtNow = debts.reduce((a, d) => a + Math.max(0, d.balance), 0);
      if (cash + near + vol + other - debtNow >= input.target) { reached.push(m); break; }
    }
  }
  reached.sort((a, b) => a - b);
  const q = (p: number) => (reached.length ? monthsToDate(reached[Math.min(reached.length - 1, Math.floor(p * reached.length))], baseYear, baseMonth) : null);
  return { p10: q(0.1), p50: q(0.5), p90: q(0.9), probReach: reached.length / runs };
}
