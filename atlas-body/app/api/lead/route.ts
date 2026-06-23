import { NextResponse } from "next/server";
import { kvEnabled, kvGet, kvSet } from "@/lib/supabaseKv";

export const dynamic = "force-dynamic";

// Best-effort lead capture. Appends to the Supabase KV when configured; otherwise a silent no-op
// so the landing never blocks the user. Never returns an error to the client.
export async function POST(req: Request) {
  try {
    const { email, source } = (await req.json()) as { email?: string; source?: string };
    if (email && kvEnabled()) {
      const list = (await kvGet<Array<{ email: string; source?: string; at: string }>>("leads")) ?? [];
      list.push({ email, source, at: new Date().toISOString() });
      await kvSet("leads", list);
    }
  } catch {
    /* swallow — lead capture is non-critical */
  }
  return NextResponse.json({ ok: true });
}
