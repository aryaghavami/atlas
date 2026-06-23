import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Single-user key-value store backed by Supabase (table public.atlas_state, RLS-locked to
// the service role). Used server-side only, behind the password gate. When SUPABASE_* env is
// absent (e.g. plain local dev), callers fall back to the local file store.
let _client: SupabaseClient | null | undefined;

function client(): SupabaseClient | null {
  if (_client !== undefined) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  _client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return _client;
}

export function kvEnabled(): boolean {
  return client() !== null;
}

export async function kvGet<T>(key: string): Promise<T | null> {
  const c = client();
  if (!c) return null;
  const { data, error } = await c.from("atlas_state").select("value").eq("key", key).maybeSingle();
  if (error) throw error;
  return (data?.value ?? null) as T | null;
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  const c = client();
  if (!c) return;
  const { error } = await c.from("atlas_state").upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}
