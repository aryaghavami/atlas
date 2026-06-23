import { NextResponse } from "next/server";
import { getCryptoPrices, getStockPrices } from "@/lib/prices";

// Live prices for the editor's value display. GET ?crypto=BTC,ETH&stocks=AAPL,NVDA
// Returns { crypto: { BTC: 70000 }, stocks: { AAPL: 298 } }.
export async function GET(req: Request) {
  const u = new URL(req.url);
  const list = (k: string) => (u.searchParams.get(k) ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const crypto = list("crypto");
  const stocks = list("stocks");
  const [c, s] = await Promise.all([crypto.length ? getCryptoPrices(crypto) : {}, stocks.length ? getStockPrices(stocks) : {}]);
  return NextResponse.json({ crypto: c, stocks: s });
}

export const dynamic = "force-dynamic";
