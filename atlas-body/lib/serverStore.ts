// Server-side state store. Prefers Supabase (lib/supabaseKv); falls back to a local JSON file
// for plain local dev. Server-only — never import from a client component.

import { promises as fs } from "fs";
import path from "path";
import type { BodyState } from "./types";
import { kvEnabled, kvGet, kvSet } from "./supabaseKv";

const KEY = "state";
const FILE = path.join(process.cwd(), ".data", "body.json");

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
