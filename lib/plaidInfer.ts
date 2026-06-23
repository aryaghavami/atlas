// Infer monthly burn + income from Plaid transactions (~90d window).
// Plaid sign convention: amount > 0 = money OUT (spend), amount < 0 = money IN.
// Skip transfers & loan payments so we don't double-count (debt service is added
// separately in the engine via liabilities) or mistake moving money for spend/income.

type PFC = { primary?: string } | null;
interface Txn {
  amount: number;
  personal_finance_category?: PFC;
}

const SKIP = new Set(["TRANSFER_IN", "TRANSFER_OUT", "LOAN_PAYMENTS"]);

export function inferBurnIncome(transactions: Txn[], months = 3): { monthlyBurn: number; monthlyIncome: number } {
  let burn = 0;
  let income = 0;
  for (const t of transactions) {
    const cat = t.personal_finance_category?.primary ?? "";
    if (SKIP.has(cat)) continue;
    if (t.amount > 0) {
      burn += t.amount; // money out, real spend
    } else if (cat === "INCOME") {
      income += -t.amount; // categorized income credit (refunds etc. are NOT counted)
    }
  }
  return { monthlyBurn: Math.round(burn / months), monthlyIncome: Math.round(income / months) };
}
