import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { kvEnabled, kvGet, kvSet } from "./supabaseKv";

// Persisted user profile (target + optional overrides). Supabase (atlas_state['profile'])
// when configured; otherwise the local gitignored file.
const PATH = ".plaid/profile.json";

export interface StoredProfile {
  target: number;
  monthlyIncome?: number;
  monthlyBurn?: number;
  expectedAnnualReturn?: number;
}

const DEFAULT: StoredProfile = { target: 1000000 };

export async function loadProfile(): Promise<StoredProfile> {
  if (kvEnabled()) return (await kvGet<StoredProfile>("profile")) ?? DEFAULT;
  if (!existsSync(PATH)) return DEFAULT;
  try {
    return JSON.parse(readFileSync(PATH, "utf8"));
  } catch {
    return DEFAULT;
  }
}

export async function saveProfile(p: Partial<StoredProfile>): Promise<StoredProfile> {
  const next = { ...(await loadProfile()), ...p };
  if (kvEnabled()) {
    await kvSet("profile", next);
    return next;
  }
  mkdirSync(dirname(PATH), { recursive: true });
  writeFileSync(PATH, JSON.stringify(next, null, 2));
  return next;
}
