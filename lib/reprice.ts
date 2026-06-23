import { loadSnapshot, saveSnapshot, type Snapshot } from "./snapshot";
import { repriceAccounts } from "./prices";
import { computeAtlas } from "./engine";
import { monteCarloBands } from "./engineBands";

// Re-price symbol-based holdings (crypto + stock) from the live market and recompute,
// without re-pulling Plaid. Keeps net worth current on every page load. No market
// holdings means the cached snapshot is returned untouched (no network call).
export async function repricedSnapshot(): Promise<Snapshot | null> {
  const snap = await loadSnapshot();
  if (!snap) return null;

  const hasMarket = snap.input.accounts.some((a) => a.symbol && a.quantity != null);
  if (!hasMarket) return snap;

  const accounts = await repriceAccounts(snap.input.accounts);
  const before = JSON.stringify(snap.input.accounts.map((a) => a.balance));
  if (JSON.stringify(accounts.map((a) => a.balance)) === before) return snap;

  const input = { ...snap.input, accounts };
  const next: Snapshot = { ...snap, input, out: computeAtlas(input), bands: monteCarloBands(input) };
  await saveSnapshot(next);
  return next;
}
