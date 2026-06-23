import { NextResponse } from "next/server";
import { getServerState, setServerState } from "@/lib/serverStore";
import type { BodyState } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET → the persisted state (or null). POST → persist the full state. Used for optional server
// sync; the client is local-first, so these are progressive enhancement for self-hosters.

export async function GET() {
  const state = await getServerState();
  return NextResponse.json({ state });
}

export async function POST(req: Request) {
  let body: BodyState;
  try {
    body = (await req.json()) as BodyState;
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body?.profile || !Array.isArray(body.weighIns)) {
    return NextResponse.json({ error: "invalid state" }, { status: 422 });
  }
  await setServerState(body);
  return NextResponse.json({ ok: true });
}
