import { NextResponse } from "next/server";
import { syncAtlas } from "@/lib/atlasSync";

// Cron target. POST → re-pull Plaid, recompute, write the snapshot.
export async function POST() {
  try {
    const snap = await syncAtlas();
    return NextResponse.json({ ok: true, computedAt: snap.computedAt, netWorth: snap.out.netWorth });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: msg === "no_accounts_connected" ? 400 : 500 });
  }
}

export const dynamic = "force-dynamic";
