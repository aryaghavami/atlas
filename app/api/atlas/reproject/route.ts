import { NextResponse } from "next/server";
import { loadSnapshot } from "@/lib/snapshot";
import { computeAtlas } from "@/lib/engine";

// Instant re-projection from the cached engine input — recomputes the date WITHOUT
// re-pulling Plaid. Powers the live-updating target date AND the assumptions editor.
// Optional overrides (all default to the snapshot's values):
//   target  — net-worth goal
//   income  — monthly income
//   burn    — monthly burn
//   return  — expected annual return, as a PERCENT (e.g. 6.5 → 0.065)
export async function GET(req: Request) {
  const u = new URL(req.url);
  const num = (k: string) => {
    const v = u.searchParams.get(k);
    return v == null || v === "" ? undefined : Number(v);
  };

  const snap = await loadSnapshot();
  if (!snap) return NextResponse.json({ error: "no_snapshot" }, { status: 404 });

  const target = num("target");
  const income = num("income");
  const burn = num("burn");
  const ret = num("return");

  const input = {
    ...snap.input,
    target: target && target > 0 ? target : snap.input.target,
    monthlyIncome: income ?? snap.input.monthlyIncome,
    monthlyBurn: burn ?? snap.input.monthlyBurn,
    expectedAnnualReturn: ret != null ? ret / 100 : snap.input.expectedAnnualReturn,
  };

  const out = computeAtlas(input);
  return NextResponse.json({
    reachable: out.reachable,
    targetMonth: out.targetMonth,
    targetYear: out.targetYear,
    monthsOut: out.monthsOut,
    monthlyContribution: out.monthlyContribution,
    runwayMonths: out.runwayMonths,
  });
}

export const dynamic = "force-dynamic";
