import { NextResponse } from "next/server";
import { authorizeUrl, withingsEnabled } from "@/lib/withings";

export const dynamic = "force-dynamic";

// Kick off Withings OAuth. If the app isn't configured, send the user back to manual logging.
export async function GET(req: Request) {
  if (!withingsEnabled()) {
    return NextResponse.redirect(new URL("/body/connect?withings=unconfigured", req.url));
  }
  const state = Math.random().toString(36).slice(2);
  const res = NextResponse.redirect(authorizeUrl(state));
  res.cookies.set("withings_state", state, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600 });
  return res;
}
