import type { Tier, Account, Liability, EngineInput } from "./engine";

// Map Plaid responses → the engine's input. v1 = balances + liabilities (reliable).
// burn/income come from the profile (onboarding + transaction inference is a v2 refinement).
function tierFor(type: string, subtype?: string | null): Tier {
  const s = (subtype || "").toLowerCase();
  if (type === "depository") return "liquid";
  if (type === "investment") {
    if (/401|ira|retire|roth|pension|403|457|hsa|529/.test(s)) return "illiquid";
    if (/crypto/.test(s)) return "volatile";
    return "near";
  }
  return "liquid";
}

export interface Profile {
  monthlyIncome: number;
  monthlyBurn: number;
  target: number;
  expectedAnnualReturn?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapToEngineInput(balanceAccounts: any[], liabilities: any, profile: Profile): EngineInput {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const byId: Record<string, any> = {};
  balanceAccounts.forEach((a) => (byId[a.account_id] = a));

  const accounts: Account[] = balanceAccounts
    .filter((a) => a.type === "depository" || a.type === "investment")
    .map((a) => ({
      name: a.name || a.official_name || "Account",
      balance: Number(a.balances?.current ?? a.balances?.available ?? 0),
      tier: tierFor(a.type, a.subtype),
    }));

  const liabs: Liability[] = [];
  for (const c of liabilities?.credit ?? []) {
    const acct = byId[c.account_id];
    const apr = (c.aprs?.find((x: { apr_type: string }) => x.apr_type === "purchase_apr")?.apr_percentage ?? c.aprs?.[0]?.apr_percentage ?? 0) / 100;
    liabs.push({ name: acct?.name || "Credit card", balance: Number(acct?.balances?.current ?? c.last_statement_balance ?? 0), apr, minPayment: Number(c.minimum_payment_amount ?? 0) });
  }
  for (const m of liabilities?.mortgage ?? []) {
    const acct = byId[m.account_id];
    liabs.push({ name: acct?.name || "Mortgage", balance: Number(acct?.balances?.current ?? 0), apr: Number(m.interest_rate?.percentage ?? 0) / 100, minPayment: Number(m.next_monthly_payment ?? 0) });
  }
  for (const s of liabilities?.student ?? []) {
    const acct = byId[s.account_id];
    liabs.push({ name: acct?.name || "Student loan", balance: Number(acct?.balances?.current ?? 0), apr: Number(s.interest_rate_percentage ?? 0) / 100, minPayment: Number(s.minimum_payment_amount ?? 0) });
  }

  return {
    accounts,
    liabilities: liabs,
    monthlyIncome: profile.monthlyIncome,
    monthlyBurn: profile.monthlyBurn,
    target: profile.target,
    expectedAnnualReturn: profile.expectedAnnualReturn,
  };
}
