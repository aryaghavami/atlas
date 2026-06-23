import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Password gate for your real data in production. The public demo (/, /body without saved state)
// stays open; the onboarding/log/target screens and the sync API are gated when ATLAS_BODY_PASSWORD
// is set. No password set → no gate (plain local dev). Mirrors the money module.

const COOKIE = "atlas_body_auth";

const GATED_PREFIXES = ["/body/start", "/body/log", "/body/target", "/body/assumptions", "/api/body"];

export function middleware(req: NextRequest) {
  const password = process.env.ATLAS_BODY_PASSWORD;
  if (!password) return NextResponse.next();

  const { pathname, searchParams } = req.nextUrl;
  const gated = GATED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!gated) return NextResponse.next();

  // Unlock via ?key=... once; thereafter the cookie carries it.
  const key = searchParams.get("key");
  if (key && key === password) {
    const res = NextResponse.next();
    res.cookies.set(COOKIE, password, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
    return res;
  }
  if (req.cookies.get(COOKIE)?.value === password) return NextResponse.next();

  return NextResponse.json({ error: "locked" }, { status: 401 });
}

export const config = {
  matcher: ["/body/:path*", "/api/body/:path*"],
};
