// Unified holding search: crypto (CoinGecko, returned market-cap ranked) + stocks/ETFs
// (Yahoo Finance), no API keys. Exact-symbol matches first, then top results by market
// cap / relevance. Powers the add-a-holding autocomplete.

export interface Hit {
  symbol: string;
  name: string;
  asset: "crypto" | "stock";
  rank: number | null; // crypto market-cap rank when known
}

async function searchCrypto(q: string): Promise<Hit[]> {
  try {
    const r = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(q)}`, { cache: "no-store" });
    const d = await r.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (d.coins ?? [])
      .filter((c: any) => c.symbol && c.name)
      .map((c: any) => ({ symbol: String(c.symbol).toUpperCase(), name: c.name, asset: "crypto" as const, rank: c.market_cap_rank ?? null }))
      .sort((a: Hit, b: Hit) => (a.rank ?? 1e9) - (b.rank ?? 1e9))
      .slice(0, 6);
  } catch {
    return [];
  }
}

// Stock hit with its quote type + Yahoo relevance index, used for scoring.
type StockHit = Hit & { quoteType: string; idx: number };
const LEVERAGED = /\b(2X|3X|1\.5X|2\.5X|LONG|SHORT|INVERSE|LEVERAGE[D]?|DAILY TARGET|BULL|BEAR|ETN)\b/i;
// Major broad-market ETFs people actually hold, ranked alongside equities.
const MAJOR_ETF = new Set(["SPY", "QQQ", "QQQM", "VOO", "VTI", "IVV", "SPLG", "VEA", "VWO", "VXUS", "VUG", "VTV", "VIG", "SCHD", "BND", "AGG", "GLD", "SLV", "IWM", "DIA"]);

async function searchStocks(q: string): Promise<StockHit[]> {
  try {
    const r = await fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=10&newsCount=0`, {
      cache: "no-store",
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const d = await r.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (d.quotes ?? [])
      .filter((x: any) => ["EQUITY", "ETF"].includes(x.quoteType) && x.symbol)
      .map((x: any, idx: number) => ({ symbol: String(x.symbol).toUpperCase(), name: x.shortname || x.longname || x.symbol, asset: "stock" as const, rank: null, quoteType: x.quoteType, idx }));
  } catch {
    return [];
  }
}

// Lower score = higher in the list. Crypto uses real market-cap rank. Stocks can't be
// ranked by market cap without a key, so prefer clean US equities, then clean ETFs, and
// push foreign listings + leveraged/inverse products to the bottom. The 50 offset means
// top-~50 crypto outrank generic stocks, while plain equities outrank smaller coins.
function stockScore(h: StockHit): number {
  const cleanTicker = /^[A-Z]{1,5}$/.test(h.symbol); // no "." => primary US listing
  const junky = LEVERAGED.test(h.name);
  if (!cleanTicker || junky) return 260 + h.idx;
  if (MAJOR_ETF.has(h.symbol)) return 30 + h.idx; // SPY, QQQ, VOO...
  if (h.quoteType === "EQUITY") return 50 + h.idx;
  return 75 + h.idx; // other clean ETF
}

export async function searchHoldings(q: string): Promise<Hit[]> {
  const query = q.trim();
  if (query.length < 1) return [];
  const [crypto, stocks] = await Promise.all([searchCrypto(query), searchStocks(query)]);

  const scored = [
    ...crypto.map((h) => ({ h: h as Hit, s: h.rank ?? 9999 })),
    ...stocks.map((h) => ({ h: { symbol: h.symbol, name: h.name, asset: h.asset, rank: h.rank } as Hit, s: stockScore(h) })),
  ];
  return scored.sort((a, b) => a.s - b.s).map((x) => x.h).slice(0, 8);
}
