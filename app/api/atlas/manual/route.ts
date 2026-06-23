import { NextResponse } from "next/server";
import { loadManual, saveManual } from "@/lib/manual";
import { syncAtlas } from "@/lib/atlasSync";
import type { Account, Liability, Tier } from "@/lib/engine";

const TIERS: Tier[] = ["liquid", "near", "volatile", "illiquid"];

// GET → current manual holdings. POST → replace the whole set (the editor sends the full list).
export async function GET() {
  return NextResponse.json(await loadManual());
}

export async function POST(req: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body = await req.json().catch(() => ({} as any));
  const accounts: Account[] = (Array.isArray(body.accounts) ? body.accounts : [])
    .filter((a: Account) => a && a.name)
    .map((a: Account) => {
      const tier: Tier = TIERS.includes(a.tier) ? a.tier : "near";
      // Live-priced crypto: keep symbol + quantity, balance is recomputed on sync/read.
      if (a.symbol && a.quantity != null && Number.isFinite(Number(a.quantity))) {
        const asset: "crypto" | "stock" = a.asset === "stock" ? "stock" : "crypto";
        return { name: String(a.name).slice(0, 60), tier, symbol: String(a.symbol).toUpperCase().slice(0, 12), quantity: Number(a.quantity), balance: Number(a.balance) || 0, asset };
      }
      return { name: String(a.name).slice(0, 60), tier, balance: Number(a.balance) || 0 };
    });
  const liabilities: Liability[] = (Array.isArray(body.liabilities) ? body.liabilities : [])
    .filter((l: Liability) => l && l.name && Number.isFinite(Number(l.balance)))
    .map((l: Liability) => ({ name: String(l.name).slice(0, 60), balance: Number(l.balance), apr: Number(l.apr) || 0, minPayment: Number(l.minPayment) || 0 }));
  const saved = await saveManual({ accounts, liabilities });
  // Recompute net worth/date with the new holdings folded in (e.g. the $96k debt, crypto).
  await syncAtlas().catch(() => null);
  return NextResponse.json(saved);
}

export const dynamic = "force-dynamic";
