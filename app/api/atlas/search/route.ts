import { NextResponse } from "next/server";
import { searchHoldings } from "@/lib/search";

// Autocomplete for the holdings editor: crypto + stocks, exact match first then by
// market cap / relevance. GET ?q=bitc
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json([]);
  return NextResponse.json(await searchHoldings(q));
}

export const dynamic = "force-dynamic";
