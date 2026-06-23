"use client";
import { useState, useMemo, useEffect } from "react";
import { AtlasConnect } from "./AtlasConnect";
import { AtlasSetTarget } from "./AtlasSetTarget";
import { AtlasHome } from "./AtlasHome";
import { PlaidConnect } from "./PlaidConnect";
import { representative } from "@/lib/atlasData";
import { computeAtlas, type EngineInput, type EngineOutput } from "@/lib/engine";
import { monteCarloBands, type Bands } from "@/lib/engineBands";

type LiveData = { out: EngineOutput; bands?: Bands; suggestedTarget?: number };
type Proj = { month: string | null; year: number | null; reachable: boolean };

// connect → set target → home. live=false → representative demo (clean for filming);
// live=true → real Plaid Link, figures + bands computed from your accounts, target persisted.
// The projected date recomputes as you type - demo client-side, live from the cached snapshot.
export function AtlasOnboarding({ live = false }: { live?: boolean }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<LiveData | null>(null);
  const [chosenTarget, setChosenTarget] = useState<number>(representative.target);
  const [err, setErr] = useState<string | null>(null);
  const [booted, setBooted] = useState(!live);

  // Already-connected detection: after the OAuth redirect reload (Chase etc. reloads
  // the page, wiping React state) or on a repeat visit, skip the connect screen and
  // land on Set Target with the real cached figures.
  useEffect(() => {
    if (!live) return;
    fetch("/api/atlas/current")
      .then((r) => (r.ok ? r.json() : null))
      .then((snap) => {
        if (snap && snap.out) {
          setData({ out: snap.out, bands: snap.bands, suggestedTarget: snap.suggestedTarget });
          setStep(2); // already connected → straight to the figures; target edits via the adjust sheet
        }
      })
      .catch(() => {})
      .finally(() => setBooted(true));
  }, []);

  const fetchAtlas = (target?: number) =>
    fetch(`/api/plaid/atlas${target ? `?target=${target}` : ""}`)
      .then((r) => r.json())
      .then((d) => { if (d.out) setData({ out: d.out, bands: d.bands, suggestedTarget: d.suggestedTarget }); else setErr(String(d.error ?? "error")); })
      .catch((e) => setErr(String(e)));

  const onConnected = () => { fetchAtlas().finally(() => setStep(2)); };

  const onSetTarget = async (target: number) => {
    setChosenTarget(target);
    if (live && target > 0) {
      await fetch("/api/atlas/profile", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ target }) });
      await fetchAtlas(target);
    }
    setStep(2);
  };

  // Demo recompute (pure engine, client-side) - keeps the demo coherent when the target is edited.
  const demoOut = useMemo(() => computeAtlas({ ...representative, target: chosenTarget }), [chosenTarget]);
  const demoBands = useMemo(() => monteCarloBands({ ...representative, target: chosenTarget }), [chosenTarget]);

  // Live projection from cached snapshot (no Plaid re-pull); demo projection from the pure engine.
  const reproject = async (target: number): Promise<Proj> => {
    if (live) {
      const r = await fetch(`/api/atlas/reproject?target=${target}`).then((x) => x.json()).catch(() => null);
      if (r && !r.error) return { month: r.targetMonth, year: r.targetYear, reachable: r.reachable };
      return { month: null, year: null, reachable: false };
    }
    const o = computeAtlas({ ...representative, target });
    return { month: o.targetMonth, year: o.targetYear, reachable: o.reachable };
  };

  const o = live ? data?.out : demoOut;
  const bands = live ? data?.bands : demoBands;
  const initialTarget = live ? (data?.suggestedTarget ?? representative.target) : representative.target;

  if (live && !booted) {
    return (
      <div style={{ width: 390, height: 844, borderRadius: 56, background: "#0C0C0D", display: "flex", alignItems: "center", justifyContent: "center", color: "#9A968D", fontFamily: "'Geist', sans-serif", fontSize: 14 }}>
        Loading
      </div>
    );
  }

  return (
    <>
      <style>{`@keyframes atlasStep{from{opacity:0;transform:translateY(10px) scale(0.992)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
      <div key={step} style={{ animation: "atlasStep 520ms cubic-bezier(0.16,1,0.3,1) both" }}>
        {step === 0 && (
          <AtlasConnect onContinue={() => setStep(1)} footer={live ? <PlaidConnect onConnected={onConnected} /> : undefined} />
        )}
        {step === 1 && (
          <AtlasSetTarget
            initialTarget={initialTarget}
            projectedMonth={bands?.p50?.month ?? "March"}
            projectedYear={bands?.p50?.year ?? 2031}
            reachable={!!(bands?.p50 ?? true)}
            reproject={reproject}
            onSetTarget={onSetTarget}
          />
        )}
        {step === 2 && o && (
          <AtlasHome
            netWorth={o.netWorth}
            runwayMonths={o.runwayMonths}
            targetMonth={o.targetMonth ?? ""}
            targetYear={o.targetYear ?? 2026}
            reachable={o.reachable}
            onTrack={o.runwayHealthy}
            bandLow={bands?.p10?.year}
            bandHigh={bands?.p90?.year}
            prob={bands ? Math.round(bands.probReach * 100) : undefined}
            adjustHref={live ? "/atlas/assumptions" : undefined}
            accountsHref={live ? "/atlas/accounts" : undefined}
          />
        )}
        {step === 2 && live && !o && (
          <div style={{ width: 390, height: 844, borderRadius: 56, background: "#0C0C0D", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 40, color: "#9A968D", fontFamily: "'Geist', sans-serif", fontSize: 14 }}>
            {err ? "Connect a bank first, and add your Plaid keys to .env.local." : "Computing your trajectory"}
          </div>
        )}
      </div>
    </>
  );
}
