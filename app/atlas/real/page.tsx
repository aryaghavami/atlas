import { AtlasHome } from "@/components/AtlasHome";
import { sampleOut, sampleBands } from "@/lib/atlasData";

export const dynamic = "force-dynamic";

// The honest reveal - Atlas run on Arya's masked-magnitude numbers, with Monte Carlo bands.
export default function Page() {
  const o = sampleOut;
  const b = sampleBands;
  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0b", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <AtlasHome
        netWorth={0}
        runwayMonths={o.runwayMonths}
        targetMonth={o.targetMonth ?? ""}
        targetYear={o.targetYear ?? 2026}
        reachable={o.reachable}
        onTrack={o.runwayHealthy}
        bandLow={b.p10?.year}
        bandHigh={b.p90?.year}
        prob={Math.round(b.probReach * 100)}
        maskNetWorth
      />
    </main>
  );
}
