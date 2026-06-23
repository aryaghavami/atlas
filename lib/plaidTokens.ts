import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { kvEnabled, kvGet, kvSet } from "./supabaseKv";

// Plaid access-token store. Supabase (atlas_state['tokens']) when configured; otherwise the
// local gitignored file. Access tokens are secrets — never committed, never sent to the client.
const TOKENS_PATH = ".plaid/dashboard-tokens.json";
type Item = { item_id: string; access_token: string; institution?: string };
type Store = { items: Item[] };

// Local / env source, used as the bootstrap seed for Supabase the first time.
function seedLoad(): Store {
  if (process.env.PLAID_TOKENS_JSON) {
    try {
      return JSON.parse(process.env.PLAID_TOKENS_JSON) as Store;
    } catch {
      /* malformed env -> try file */
    }
  }
  if (!existsSync(TOKENS_PATH)) return { items: [] };
  return JSON.parse(readFileSync(TOKENS_PATH, "utf8"));
}

export async function load(): Promise<Store> {
  if (kvEnabled()) {
    const kv = await kvGet<Store>("tokens");
    if (kv && kv.items?.length) return kv;
    // One-time bootstrap: migrate the existing env/file token into Supabase.
    const seed = seedLoad();
    if (seed.items?.length) {
      await kvSet("tokens", seed);
      return seed;
    }
    return { items: [] };
  }
  return seedLoad();
}

export async function save(item: Item) {
  const store = await load();
  // Reconnecting an institution creates a NEW item_id; replace any existing token for the
  // same institution so balances aren't double-counted.
  store.items = store.items.filter(
    (i) => i.item_id !== item.item_id && (!item.institution || i.institution !== item.institution)
  );
  store.items.push(item);
  if (kvEnabled()) {
    await kvSet("tokens", store);
    return;
  }
  try {
    mkdirSync(dirname(TOKENS_PATH), { recursive: true });
    writeFileSync(TOKENS_PATH, JSON.stringify(store, null, 2));
  } catch {
    /* read-only fs — nothing to persist */
  }
}
