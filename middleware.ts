import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Real-data PAGES (Arya's actual accounts). The representative demo (/atlas, /atlas/start,
// /atlas/manual, /atlas/connect, /atlas/target) stays fully public.
const REAL_PAGES = ["/atlas/real", "/atlas/live", "/atlas/accounts", "/atlas/assumptions"];
// API routes that are safe to expose publicly (market data only, no personal info).
const PUBLIC_API = ["/api/atlas/search", "/api/atlas/price"];
const COOKIE = "atlas_auth";

function isGated(pathname: string): boolean {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return true; // owner-only dashboard
  if (REAL_PAGES.some((b) => pathname === b || pathname.startsWith(b + "/"))) return true;
  // Every /api/atlas/* that isn't explicitly public touches real data -> gate it.
  if (pathname.startsWith("/api/atlas/") && !PUBLIC_API.some((p) => pathname.startsWith(p))) return true;
  // Plaid link/exchange endpoints use Arya's live credentials -> gate (prevents quota abuse).
  if (pathname.startsWith("/api/plaid/")) return true;
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  if (!isGated(pathname)) return NextResponse.next();

  // Local dev (next dev): VERCEL_ENV undefined -> open for personal use on localhost.
  if (process.env.VERCEL_ENV !== "production") return NextResponse.next();

  const pw = process.env.ATLAS_PASSWORD;
  const isApi = pathname.startsWith("/api/");
  // Fail CLOSED: pages bounce to the public demo, APIs return 401. Never expose real data.
  const deny = () => {
    if (isApi) return new NextResponse(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "content-type": "application/json" } });
    const url = req.nextUrl.clone();
    url.pathname = "/atlas";
    url.search = "";
    return NextResponse.redirect(url);
  };
  if (!pw) return deny();

  // Already authed.
  if (req.cookies.get(COOKIE)?.value === pw) return NextResponse.next();

  // First visit with ?key=<password>: set a long-lived cookie, strip the key from the URL.
  if (searchParams.get("key") === pw) {
    const url = req.nextUrl.clone();
    url.searchParams.delete("key");
    const res = NextResponse.redirect(url);
    res.cookies.set(COOKIE, pw, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365, path: "/" });
    return res;
  }

  return deny();
}

export const config = { matcher: ["/atlas/:path*", "/api/atlas/:path*", "/api/plaid/:path*", "/admin", "/admin/:path*"] };
