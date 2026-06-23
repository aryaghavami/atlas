import type { Account } from "./engine";

// Live prices for crypto (CoinGecko) and stocks (Yahoo), no API keys. Holdings are stored
// as quantity + symbol, so balance = quantity x current price, refreshed on every read.

// Common symbol to CoinGecko id. Unknown symbols fall back to CoinGecko search.
const ID: Record<string, string> = {
  HYPE: "hyperliquid", BTC: "bitcoin", ETH: "ethereum", SOL: "solana",
  USDC: "usd-coin", USDT: "tether", DOGE: "dogecoin", XRP: "ripple",
  ADA: "cardano", AVAX: "avalanche-2", LINK: "chainlink", BNB: "binancecoin",
  MATIC: "matic-network", DOT: "polkadot", LTC: "litecoin", SUI: "sui",
  ARB: "arbitrum", OP: "optimism", APT: "aptos", TIA: "celestia",
};

async function idFor(symbol: string): Promise<string | null> {
  const up = symbol.toUpperCase();
  if (ID[up]) return ID[up];
  try {
    const r = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(symbol)}`, { cache: "no-store" });
    const d = await r.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coin = d.coins?.find((c: any) => c.symbol?.toUpperCase() === up) ?? d.coins?.[0];
    return coin?.id ?? null;
  } catch {
    return null;
  }
}

// symbol (uppercased) -> USD price. Missing symbols are simply absent.
export async function getCryptoPrices(symbols: string[]): Promise<Record<string, number>> {
  const uniq = [...new Set(symbols.map((s) => s.toUpperCase()).filter(Boolean))];
  if (!uniq.length) return {};
  const ids: Record<string, string> = {};
  for (const s of uniq) {
    const id = await idFor(s);
    if (id) ids[s] = id;
  }
  const idList = [...new Set(Object.values(ids))];
  if (!idList.length) return {};
  try {
    const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${idList.join(",")}&vs_currencies=usd`, { cache: "no-store" });
    const d = await r.json();
    const out: Record<string, number> = {};
    for (const s of uniq) {
      const id = ids[s];
      if (id && d[id]?.usd != null) out[s] = d[id].usd;
    }
    return out;
  } catch {
    return {};
  }
}

// Live stock/ETF prices via Yahoo Finance (no key). symbol (uppercased) -> USD price.
export async function getStockPrices(symbols: string[]): Promise<Record<string, number>> {
  const uniq = [...new Set(symbols.map((s) => s.toUpperCase()).filter(Boolean))];
  const out: Record<string, number> = {};
  await Promise.all(
    uniq.map(async (s) => {
      try {
        const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s)}?interval=1d&range=1d`, {
          cache: "no-store",
          headers: { "User-Agent": "Mozilla/5.0" },
        });
        const d = await r.json();
        const px = d?.chart?.result?.[0]?.meta?.regularMarketPrice;
        if (typeof px === "number") out[s] = px;
      } catch {
        /* skip */
      }
    })
  );
  return out;
}

// Fill balance = quantity x live price for every symbol-based holding (crypto or stock).
export async function repriceAccounts(accounts: Account[]): Promise<Account[]> {
  const crypto = accounts.filter((a) => a.symbol && a.quantity != null && (a.asset ?? "crypto") === "crypto").map((a) => a.symbol as string);
  const stocks = accounts.filter((a) => a.symbol && a.quantity != null && a.asset === "stock").map((a) => a.symbol as string);
  if (!crypto.length && !stocks.length) return accounts;
  const empty: Record<string, number> = {};
  const [cp, sp] = await Promise.all([crypto.length ? getCryptoPrices(crypto) : empty, stocks.length ? getStockPrices(stocks) : empty]);
  return accounts.map((a) => {
    if (a.symbol && a.quantity != null) {
      const px = (a.asset ?? "crypto") === "stock" ? sp[a.symbol.toUpperCase()] : cp[a.symbol.toUpperCase()];
      if (px != null) return { ...a, balance: a.quantity * px };
    }
    return a;
  });
}
