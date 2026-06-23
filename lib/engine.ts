// Atlas engine — runway + time-to-target. Pure, deterministic. See ../ENGINE.md.
// Honest before precise: asset haircuts, debt-first allocation, compounding, "not on track".

export type Tier = "liquid" | "near" | "volatile" | "illiquid";
export interface Account { name: string; balance: number; tier: Tier; symbol?: string; quantity?: number; asset?: "crypto" | "stock"; }
export interface Liability { name: string; balance: number; apr: number; minPayment: number; }

export interface EngineInput {
  accounts: Account[];
  liabilities: Liability[];
  monthlyIncome: number; // expected ongoing net income
  monthlyBurn: number; // living burn, excluding debt service
  target: number; // net-worth target
  expectedAnnualReturn?: number; // real return on investable sleeve (default 0.06)
  baseYear?: number; // for deterministic date math (default 2026)
  baseMonth?: number; // 0-indexed (default 5 = June)
}

export interface EngineOutput {
  netWorth: number;
  spendableAssets: number;
  runwayMonths: number;
  runwayStressMonths: number; // volatile sleeve −30%
  runwayHealthy: boolean; // ≥6 months → sage, else amber
  monthlyContribution: number;
  reachable: boolean;
  targetMonth: string | null;
  targetYear: number | null;
  monthsOut: number | null;
}

const HAIRCUT: Record<Tier, number> = { liquid: 1.0, near: 0.75, volatile: 0.6, illiquid: 0 };
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function computeAtlas(input: EngineInput): EngineOutput {
  const r = input.expectedAnnualReturn ?? 0.06;
  const rm = r / 12;
  const baseYear = input.baseYear ?? 2026;
  const baseMonth = input.baseMonth ?? 5;

  const assetTotal = input.accounts.reduce((a, x) => a + x.balance, 0);
  const debtTotal = input.liabilities.reduce((a, x) => a + x.balance, 0);
  const netWorth = assetTotal - debtTotal;

  const spendable = input.accounts.reduce((a, x) => a + x.balance * HAIRCUT[x.tier], 0);
  const stressSpendable = input.accounts.reduce(
    (a, x) => a + x.balance * (x.tier === "volatile" ? HAIRCUT.volatile * 0.7 : HAIRCUT[x.tier]),
    0
  );
  const debtService = input.liabilities.reduce((a, x) => a + x.minPayment, 0);
  const effectiveBurn = input.monthlyBurn + debtService;

  const runwayMonths = effectiveBurn > 0 ? Math.max(0, Math.floor(spendable / effectiveBurn)) : 999;
  const runwayStressMonths = effectiveBurn > 0 ? Math.max(0, Math.floor(stressSpendable / effectiveBurn)) : 999;
  const monthlyContribution = input.monthlyIncome - effectiveBurn;

  // Time-to-target simulation: contribution → debt-first (if apr>return) → invest; compound monthly.
  let cash = input.accounts.filter((x) => x.tier === "liquid").reduce((a, x) => a + x.balance, 0);
  let investable = input.accounts.filter((x) => x.tier === "near" || x.tier === "volatile").reduce((a, x) => a + x.balance, 0);
  const other = input.accounts.filter((x) => x.tier === "illiquid").reduce((a, x) => a + x.balance, 0);
  const debts = input.liabilities.map((l) => ({ ...l })).sort((a, b) => b.apr - a.apr);

  let reached = -1;
  for (let m = 1; m <= 720; m++) {
    investable *= 1 + rm;
    for (const d of debts) d.balance *= 1 + d.apr / 12;

    let c = monthlyContribution;
    if (c > 0) {
      for (const d of debts) {
        if (d.balance > 0 && d.apr > r && c > 0) {
          const pay = Math.min(c, d.balance);
          d.balance -= pay;
          c -= pay;
        }
      }
      if (c > 0) investable += c;
    } else {
      let deficit = -c;
      const fromCash = Math.min(cash, deficit);
      cash -= fromCash;
      deficit -= fromCash;
      if (deficit > 0) investable -= deficit;
    }

    const debtNow = debts.reduce((a, d) => a + Math.max(0, d.balance), 0);
    const nw = cash + investable + other - debtNow;
    if (nw >= input.target) { reached = m; break; }
    if (m > 360 && monthlyContribution <= 0 && nw < input.target * 0.25) break; // diverging
  }

  let targetMonth: string | null = null;
  let targetYear: number | null = null;
  let monthsOut: number | null = null;
  if (reached > 0) {
    const idx = baseMonth + reached;
    targetYear = baseYear + Math.floor(idx / 12);
    targetMonth = MONTHS[((idx % 12) + 12) % 12];
    monthsOut = reached;
  }

  return {
    netWorth,
    spendableAssets: spendable,
    runwayMonths,
    runwayStressMonths,
    runwayHealthy: runwayMonths >= 6,
    monthlyContribution,
    reachable: reached > 0,
    targetMonth,
    targetYear,
    monthsOut,
  };
}
