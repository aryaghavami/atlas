import { NextResponse } from "next/server";
import { fetchLatestWeighIn, refreshTokens, withingsEnabled } from "@/lib/withings";
import { getWithingsTokens, setWithingsTokens } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

// Pull the latest scale reading on demand. Refreshes the access token when stale. Returns the
// weigh-in so the (local-first) client can fold it in; never throws to the client.
export async function GET() {
  if (!withingsEnabled()) return NextResponse.json({ connected: false });
  let tokens = await getWithingsTokens();
  if (!tokens) return NextResponse.json({ connected: false });

  try {
    if (Date.now() > tokens.expiresAt - 60_000) {
      tokens = await refreshTokens(tokens.refreshToken);
      await setWithingsTokens(tokens);
    }
    const weighIn = await fetchLatestWeighIn(tokens.accessToken);
    return NextResponse.json({ connected: true, weighIn });
  } catch {
    return NextResponse.json({ connected: true, weighIn: null, error: "sync_failed" });
  }
}
