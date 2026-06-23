// Server-side state store. Prefers Supabase (lib/supabaseKv); falls back to a local JSON file
// for plain local dev. Server-only — never import from a client component.

import { promises as fs } from "fs";
import path from "path";
import type { BodyState } from "./types";
import type { WithingsTokens } from "./withings";
import { kvEnabled, kvGet, kvSet } from "./supabaseKv";

const KEY = "state";
const TOKENS_KEY = "withings_tokens";
const FILE = path.join(process.cwd(), ".data", "body.json");
const TOKENS_FILE = path.join(process.cwd(), ".data", "withings.json");

export async function getServerState(): Promise<BodyState | null> {
  if (kvEnabled()) return (await kvGet<BodyState>(KEY)) ?? null;
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return JSON.parse(raw) as BodyState;
  } catch {
    return null;
  }
}

export async function setServerState(state: BodyState): Promise<void> {
  if (kvEnabled()) {
    await kvSet(KEY, state);
    return;
  }
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(state, null, 2), "utf8");
}

export async function getWithingsTokens(): Promise<WithingsTokens | null> {
  if (kvEnabled()) return (await kvGet<WithingsTokens>(TOKENS_KEY)) ?? null;
  try {
    return JSON.parse(await fs.readFile(TOKENS_FILE, "utf8")) as WithingsTokens;
  } catch {
    return null;
  }
}

export async function setWithingsTokens(tokens: WithingsTokens): Promise<void> {
  if (kvEnabled()) {
    await kvSet(TOKENS_KEY, tokens);
    return;
  }
  await fs.mkdir(path.dirname(TOKENS_FILE), { recursive: true });
  await fs.writeFile(TOKENS_FILE, JSON.stringify(tokens), "utf8");
}
