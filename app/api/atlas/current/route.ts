import { NextResponse } from "next/server";
import { repricedSnapshot } from "@/lib/reprice";
import { syncAtlas } from "@/lib/atlasSync";

// Cached read for the app. Crypto holdings entered by quantity are re-priced from the
// live market on each read (no Plaid re-pull); everything else is the cached snapshot.
export async function GET() {
  let snap = await repricedSnapshot();
  // Fresh store (no snapshot yet) -> build it live once, then it's cached in Supabase.
  if (!snap) snap = await syncAtlas().catch(() => null);
  return snap ? NextResponse.json(snap) : NextResponse.json({ error: "no_snapshot" }, { status: 404 });
}

export const dynamic = "force-dynamic";
