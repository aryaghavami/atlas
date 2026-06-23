import { AtlasHome } from "@/components/AtlasHome";
import { representativeOut, representativeBands } from "@/lib/atlasData";

export const dynamic = "force-dynamic";

export default function Page() {
  const o = representativeOut;
  const b = representativeBands;
  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0b", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <AtlasHome
        netWorth={o.netWorth}
        runwayMonths={o.runwayMonths}
        targetMonth={o.targetMonth ?? ""}
        targetYear={o.targetYear ?? 2026}
        reachable={o.reachable}
        onTrack={o.runwayHealthy}
        bandLow={b.p10?.year}
        bandHigh={b.p90?.year}
        prob={Math.round(b.probReach * 100)}
      />
    </main>
  );
}
