"use client";
import { useEffect, useState } from "react";
import { AtlasAssumptions } from "@/components/AtlasAssumptions";

export const dynamic = "force-dynamic";

type Snap = {
  input: { monthlyIncome: number; monthlyBurn: number; expectedAnnualReturn?: number; target: number };
  out: { targetMonth: string | null; targetYear: number | null };
};

// Live assumptions editor - reads the cached snapshot, edits income/burn/return,
// reprojects live, saves to the profile, then re-syncs so Home reflects the change.
export default function Page() {
  const [snap, setSnap] = useState<Snap | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "none">("loading");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/atlas/current")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((s: Snap) => { setSnap(s); setState("ready"); })
      .catch(() => setState("none"));
  }, []);

  const reproject = async (v: { target: number; income: number; burn: number; returnPct: number }) => {
    const q = new URLSearchParams({ target: String(v.target), income: String(v.income), burn: String(v.burn), return: String(v.returnPct) });
    const r = await fetch(`/api/atlas/reproject?${q}`).then((x) => x.json()).catch(() => null);
    if (r && !r.error) return { month: r.targetMonth, year: r.targetYear, reachable: r.reachable, contribution: Math.round(r.monthlyContribution) };
    return { month: null, year: null, reachable: false, contribution: Math.round(v.income - v.burn) };
  };

  const onSave = async (v: { target: number; income: number; burn: number; returnPct: number }) => {
    setSaving(true);
    await fetch("/api/atlas/profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ target: v.target, monthlyIncome: v.income, monthlyBurn: v.burn, expectedAnnualReturn: v.returnPct / 100 }),
    });
    await fetch("/api/atlas/sync", { method: "POST" }); // recompute the snapshot with the overrides
    setSaving(false);
    window.location.href = "/atlas/live";
  };

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0b", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      {state === "ready" && snap ? (
        <AtlasAssumptions
          initial={{
            target: snap.input.target,
            income: snap.input.monthlyIncome,
            burn: snap.input.monthlyBurn,
            returnPct: Math.round((snap.input.expectedAnnualReturn ?? 0.06) * 1000) / 10,
          }}
          projectedMonth={snap.out.targetMonth ?? ""}
          projectedYear={snap.out.targetYear}
          reproject={reproject}
          onSave={onSave}
          saving={saving}
        />
      ) : (
        <div style={{ width: 390, height: 844, borderRadius: 56, background: "#0C0C0D", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 40, color: "#9A968D", fontFamily: "'Geist', sans-serif", fontSize: 14, lineHeight: 1.6 }}>
          {state === "loading" ? "Loading your assumptions" : "Connect your accounts first. Assumptions are read from your real data. Go to /atlas/live."}
        </div>
      )}
    </main>
  );
}
