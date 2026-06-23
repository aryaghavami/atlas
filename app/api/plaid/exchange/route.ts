import { NextResponse } from "next/server";
import { plaid } from "@/lib/plaidClient";
import { save } from "@/lib/plaidTokens";
import { syncAtlas } from "@/lib/atlasSync";

export async function POST(req: Request) {
  try {
    const { public_token, institution } = await req.json();
    const r = await plaid.itemPublicTokenExchange({ public_token });
    await save({ item_id: r.data.item_id, access_token: r.data.access_token, institution });
    // Pull the new account into the snapshot right away.
    await syncAtlas().catch(() => null);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
