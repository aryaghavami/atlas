import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { Account, Liability } from "./engine";
import { kvEnabled, kvGet, kvSet } from "./supabaseKv";

// Manually-entered holdings Plaid can't reach (crypto, private/business debt, off-bank
// assets). Merged into the engine input at sync time so net worth is the full picture.
// Supabase (atlas_state['manual']) when configured; otherwise the local gitignored file.
const PATH = ".plaid/manual.json";

export interface Manual {
  accounts: Account[];
  liabilities: Liability[];
}

const norm = (m: Partial<Manual> | null): Manual => ({
  accounts: m?.accounts ?? [],
  liabilities: m?.liabilities ?? [],
});

export async function loadManual(): Promise<Manual> {
  if (kvEnabled()) return norm(await kvGet<Manual>("manual"));
  if (!existsSync(PATH)) return { accounts: [], liabilities: [] };
  try {
    return norm(JSON.parse(readFileSync(PATH, "utf8")));
  } catch {
    return { accounts: [], liabilities: [] };
  }
}

export async function saveManual(m: Manual): Promise<Manual> {
  const clean = norm(m);
  if (kvEnabled()) {
    await kvSet("manual", clean);
    return clean;
  }
  mkdirSync(dirname(PATH), { recursive: true });
  writeFileSync(PATH, JSON.stringify(clean, null, 2));
  return clean;
}
