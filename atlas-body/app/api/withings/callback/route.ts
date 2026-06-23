import { NextResponse } from "next/server";
import { exchangeCode, fetchLatestWeighIn } from "@/lib/withings";
import { getServerState, setServerState, setWithingsTokens } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

// OAuth redirect target. Exchanges the code, stores tokens, pulls the latest weigh-in, and folds it
// into server state. The client picks it up on next load (or via /api/withings/sync).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.headers.get("cookie")?.match(/withings_state=([^;]+)/)?.[1];

  if (!code || !state || state !== cookieState) {
    return NextResponse.redirect(new URL("/body/connect?withings=denied", req.url));
  }

  try {
    const tokens = await exchangeCode(code);
    await setWithingsTokens(tokens);
    const weighIn = await fetchLatestWeighIn(tokens.accessToken);
    if (weighIn) {
      const state0 = (await getServerState()) ?? null;
      if (state0) {
        const weighIns = [...state0.weighIns.filter((w) => w.date !== weighIn.date), weighIn].sort((a, b) => (a.date < b.date ? -1 : 1));
        await setServerState({ ...state0, weighIns });
      }
    }
    return NextResponse.redirect(new URL("/body?synced=1", req.url));
  } catch {
    return NextResponse.redirect(new URL("/body/connect?withings=error", req.url));
  }
}
