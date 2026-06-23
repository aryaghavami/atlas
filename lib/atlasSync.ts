import { plaid } from "./plaidClient";
import { load as loadTokens } from "./plaidTokens";
import { mapToEngineInput } from "./plaidMap";
import { inferBurnIncome } from "./plaidInfer";
import { computeAtlas } from "./engine";
import { monteCarloBands, fiNumber } from "./engineBands";
import { loadProfile } from "./profile";
import { loadManual } from "./manual";
import { repriceAccounts } from "./prices";
import { saveSnapshot, type Snapshot } from "./snapshot";

const ymd = (d: Date) => d.toISOString().slice(0, 10);

// The one canonical pull: balances + liabilities + all transactions (paginated) from
// every linked item → infer burn/income → engine + Monte Carlo → save snapshot, return it.
// Called live (/api/plaid/atlas) and by the cron (/api/atlas/sync).
export async function syncAtlas(targetOverride?: number): Promise<Snapshot> {
  const { items } = await loadTokens();
  if (!items.length) throw new Error("no_accounts_connected");
  const stored = await loadProfile();
  const target = targetOverride ?? stored.target ?? 1000000;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allAccts: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const liab: any = { credit: [], mortgage: [], student: [] };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const txns: any[] = [];
  const end = new Date();
  const start = new Date(end.getTime() - 90 * 864e5);

  for (const it of items) {
    const bal = await plaid.accountsBalanceGet({ access_token: it.access_token });
    allAccts.push(...bal.data.accounts);
    try {
      const l = await plaid.liabilitiesGet({ access_token: it.access_token });
      liab.credit.push(...(l.data.liabilities.credit ?? []));
      liab.mortgage.push(...(l.data.liabilities.mortgage ?? []));
      liab.student.push(...(l.data.liabilities.student ?? []));
    } catch {
      /* item may lack liabilities */
    }
    try {
      let offset = 0, total = Infinity, guard = 0;
      while (offset < total && guard < 40) {
        const tx = await plaid.transactionsGet({ access_token: it.access_token, start_date: ymd(start), end_date: ymd(end), options: { count: 500, offset } });
        total = tx.data.total_transactions;
        txns.push(...tx.data.transactions);
        if (tx.data.transactions.length === 0) break;
        offset += tx.data.transactions.length;
        guard++;
      }
    } catch {
      /* transactions may not be ready yet */
    }
  }

  // Dedupe across items — a re-linked institution can return overlapping accounts /
  // transactions, which would otherwise double-count balances, burn, and income.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uniqBy = (arr: any[], key: string) => {
    const seen = new Set<unknown>();
    return arr.filter((x) => { const k = x?.[key]; if (k == null) return true; if (seen.has(k)) return false; seen.add(k); return true; });
  };
  const accounts = uniqBy(allAccts, "account_id");
  const transactions = uniqBy(txns, "transaction_id");
  liab.credit = uniqBy(liab.credit, "account_id");
  liab.mortgage = uniqBy(liab.mortgage, "account_id");
  liab.student = uniqBy(liab.student, "account_id");

  const inferred = inferBurnIncome(transactions);
  const monthlyIncome = stored.monthlyIncome ?? inferred.monthlyIncome;
  const monthlyBurn = stored.monthlyBurn ?? inferred.monthlyBurn;
  const input = mapToEngineInput(accounts, liab, { monthlyIncome, monthlyBurn, target, expectedAnnualReturn: stored.expectedAnnualReturn });

  // Fold in manual holdings Plaid can't see (crypto, business debt, off-bank assets).
  // Crypto entered as quantity + symbol is priced live; everything else uses its balance.
  const manual = await loadManual();
  for (const a of manual.accounts) {
    input.accounts.push({ name: a.name, tier: a.tier, balance: a.balance ?? 0, symbol: a.symbol, quantity: a.quantity, asset: a.asset });
  }
  input.liabilities.push(...manual.liabilities);
  input.accounts = await repriceAccounts(input.accounts); // crypto + stock, live

  const snapshot: Snapshot = {
    out: computeAtlas(input),
    bands: monteCarloBands(input),
    inferred,
    suggestedTarget: fiNumber(monthlyBurn),
    input,
    computedAt: end.toISOString(),
  };
  await saveSnapshot(snapshot);
  return snapshot;
}
