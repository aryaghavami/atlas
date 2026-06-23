"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PageShell, PhoneFrame } from "./PhoneFrame";
import { FieldLabel, PrimaryButton, Slider, Stepper, onbColors as C } from "./ui";
import { computeBody, inputFromState } from "@/lib/engine";
import { effectiveState, addWeighIn, latestWeighIn } from "@/lib/store";
import { kgToLb, lbToKg, todayIso } from "@/lib/format";
import { tapHaptic } from "@/lib/haptics";

const GEIST = "'Geist', sans-serif";
const SERIF = "'Instrument Serif', serif";

// Log a weigh-in and watch the date move *as you type*. The before→after delta is the payoff.
export function BodyLog() {
  const router = useRouter();
  const state = useMemo(() => effectiveState(), []);
  const prev = latestWeighIn(state);
  const units = state.profile.units ?? "imperial";
  const now = new Date();

  const [weightLb, setWeightLb] = useState(prev?.weightLb ?? 180);
  const [bodyFatPct, setBodyFatPct] = useState(prev?.bodyFatPct ?? 20);
  const [saved, setSaved] = useState(false);

  const base = { baseYear: now.getFullYear(), baseMonth: now.getMonth() };
  const before = prev ? computeBody(inputFromState(state.profile, prev, base)) : null;
  const after = computeBody(
    inputFromState(state.profile, { date: todayIso(), weightLb, bodyFatPct }, base),
  );

  const delta = useMemo(() => {
    if (!before?.monthsOut || !after?.monthsOut) return null;
    const diff = before.monthsOut - after.monthsOut; // positive = earlier
    return diff;
  }, [before, after]);

  const save = () => {
    addWeighIn({ date: todayIso(), weightLb, bodyFatPct, source: "manual" });
    setSaved(true);
    tapHaptic(14);
    setTimeout(() => router.push("/body"), 850);
  };

  const kg = Math.round(lbToKg(weightLb));

  return (
    <PageShell>
      <PhoneFrame contentStyle={{ padding: "60px 30px 34px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 26 }}>
          <button type="button" onClick={() => { tapHaptic(); router.push("/body"); }} className="press" style={{ background: "none", border: "none", cursor: "pointer", fontFamily: GEIST, fontSize: 13, color: C.muted }}>
            ‹ Back
          </button>
          <Link href="/body/connect" onClick={() => tapHaptic()} style={{ fontFamily: GEIST, fontSize: 12, color: C.gold, textDecoration: "none" }}>
            Connect a scale →
          </Link>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 30, lineHeight: 1.05, color: C.bone, margin: "0 0 26px" }}>Today&rsquo;s weigh-in</h2>

          <FieldLabel>Weight</FieldLabel>
          {units === "imperial" ? (
            <Stepper value={Math.round(weightLb)} min={80} max={500} suffix="lb" onChange={setWeightLb} />
          ) : (
            <Stepper value={kg} min={40} max={230} suffix="kg" onChange={(v) => setWeightLb(Math.round(kgToLb(v)))} />
          )}

          <div style={{ height: 24 }} />
          <FieldLabel>Body fat</FieldLabel>
          <Slider value={bodyFatPct} min={5} max={45} step={0.1} suffix="%" decimals={1} onChange={setBodyFatPct} />

          {/* the payoff: the date, moving */}
          <div style={{ marginTop: 28, padding: "20px 18px", borderRadius: 16, border: `1px solid ${C.border}`, textAlign: "center" }}>
            <div style={{ fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.26em", textTransform: "uppercase", color: C.muted }}>
              Projected date
            </div>
            {after.reachable ? (
              <div key={`${after.targetYear}-${after.targetMonth}`} className="settle" style={{ fontFamily: SERIF, fontSize: 46, lineHeight: 1, color: C.bone, marginTop: 10 }}>
                {after.targetMonth} <span className="tnum">{after.targetYear}</span>
              </div>
            ) : (
              <div className="settle" style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 26, color: C.goldSoft, marginTop: 10 }}>Not reachable at this rate</div>
            )}
            {delta != null && delta !== 0 && (
              <div style={{ fontFamily: GEIST, fontSize: 12.5, fontWeight: 400, color: delta > 0 ? C.sage : C.goldSoft, marginTop: 10 }}>
                {delta > 0 ? `${delta} month${delta === 1 ? "" : "s"} earlier than last time` : `${-delta} month${-delta === 1 ? "" : "s"} later than last time`}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <PrimaryButton onClick={save} disabled={saved}>{saved ? "Saved ✓" : "Save weigh-in →"}</PrimaryButton>
        </div>
      </PhoneFrame>
    </PageShell>
  );
}
