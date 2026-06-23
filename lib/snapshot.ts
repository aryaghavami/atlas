import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { EngineOutput, EngineInput } from "./engine";
import type { Bands } from "./engineBands";
import { kvEnabled, kvGet, kvSet } from "./supabaseKv";

// Cached computed figures, refreshed by sync. Supabase (atlas_state['snapshot']) when
// configured; otherwise the local gitignored file.
const PATH = ".plaid/snapshot.json";

export interface Snapshot {
  out: EngineOutput;
  bands: Bands;
  inferred: { monthlyBurn: number; monthlyIncome: number };
  suggestedTarget: number;
  input: EngineInput;
  computedAt: string;
}

export async function saveSnapshot(s: Snapshot) {
  if (kvEnabled()) {
    await kvSet("snapshot", s);
    return;
  }
  try {
    mkdirSync(dirname(PATH), { recursive: true });
    writeFileSync(PATH, JSON.stringify(s, null, 2));
  } catch {
    /* read-only fs — snapshot is recomputed on demand */
  }
}

export async function loadSnapshot(): Promise<Snapshot | null> {
  if (kvEnabled()) return await kvGet<Snapshot>("snapshot");
  return existsSync(PATH) ? JSON.parse(readFileSync(PATH, "utf8")) : null;
}
