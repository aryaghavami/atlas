import { NextResponse } from "next/server";
import { syncAtlas } from "@/lib/atlasSync";

// Live pull (also refreshes the cached snapshot). ?target= overrides the stored target.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const t = url.searchParams.get("target");
  try {
    return NextResponse.json(await syncAtlas(t ? Number(t) : undefined));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: msg === "no_accounts_connected" ? 400 : 500 });
  }
}

export const dynamic = "force-dynamic";
