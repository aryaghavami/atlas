import { NextResponse } from "next/server";
import { representative, sampleReal } from "@/lib/atlasData";
import { computeAtlas, type EngineInput } from "@/lib/engine";
import { monteCarloBands, fiNumber } from "@/lib/engineBands";

// Dev-only: numerically verify the engine + Monte Carlo bands on the fixtures.
function pack(input: EngineInput) {
  const out = computeAtlas(input);
  const b = monteCarloBands(input);
  const d = (x: { month: string; year: number } | null) => (x ? `${x.month} ${x.year}` : null);
  return {
    netWorth: out.netWorth,
    runwayMonths: out.runwayMonths,
    runwayHealthy: out.runwayHealthy,
    reachable: out.reachable,
    pointDate: out.targetMonth ? `${out.targetMonth} ${out.targetYear}` : null,
    bands: { p10: d(b.p10), p50: d(b.p50), p90: d(b.p90), probReach: `${Math.round(b.probReach * 100)}%` },
    fiNumber: fiNumber(input.monthlyBurn),
  };
}

export async function GET() {
  return NextResponse.json({ representative: pack(representative), sampleReal: pack(sampleReal) });
}

export const dynamic = "force-dynamic";
