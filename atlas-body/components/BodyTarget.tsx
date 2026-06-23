"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PageShell, PhoneFrame } from "./PhoneFrame";
import { FieldLabel, PrimaryButton, Segmented, Slider, Toggle, onbColors as C } from "./ui";
import { computeBody, inputFromState } from "@/lib/engine";
import { monteCarloBands } from "@/lib/engineBands";
import { effectiveState, latestWeighIn, saveState } from "@/lib/store";
import { baseFromIso } from "@/lib/format";
import { tapHaptic } from "@/lib/haptics";

const GEIST = "'Geist', sans-serif";
const SERIF = "'Instrument Serif', serif";

// Adjust the target + approach, with the date re-projecting live underneath.
export function BodyTarget() {
  const router = useRouter();
  const state = useMemo(() => effectiveState(), []);
  const latest = latestWeighIn(state);

  const [goalBodyFatPct, setGoal] = useState(state.profile.goalBodyFatPct);
  const [weeklyDeficitPct, setDeficit] = useState(state.profile.weeklyDeficitPct);
  const [proteinAdequate, setProtein] = useState(state.profile.proteinAdequate);
  const [resistanceTraining, setLifting] = useState(state.profile.resistanceTraining);

  const profile = { ...state.profile, goalBodyFatPct, weeklyDeficitPct, proteinAdequate, resistanceTraining };
  const preview = useMemo(() => {
    if (!latest) return null;
    const input = inputFromState(profile, latest, baseFromIso(latest.date));
    return { out: computeBody(input), band: monteCarloBands(input) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalBodyFatPct, weeklyDeficitPct, proteinAdequate, resistanceTraining]);

  const save = () => {
    saveState({ ...state, profile });
    tapHaptic(14);
    router.push("/body");
  };

  const maxGoal = Math.max(6, Math.round(latest?.bodyFatPct ?? 30));

  return (
    <PageShell>
      <PhoneFrame contentStyle={{ padding: "60px 30px 34px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 26 }}>
          <button type="button" onClick={() => { tapHaptic(); router.push("/body"); }} className="press" style={{ background: "none", border: "none", cursor: "pointer", fontFamily: GEIST, fontSize: 13, color: C.muted }}>
            ‹ Back
          </button>
          <div style={{ fontFamily: GEIST, fontSize: 11, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: C.faint }}>Target</div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 30, lineHeight: 1.05, color: C.bone, margin: "0 0 26px" }}>Your target</h2>

          <FieldLabel>Target body fat</FieldLabel>
          <Slider value={goalBodyFatPct} min={5} max={maxGoal} step={0.5} suffix="%" decimals={1} onChange={setGoal} />

          <div style={{ height: 22 }} />
          <FieldLabel>Approach</FieldLabel>
          <Segmented
            options={[
              { label: "Gentle", value: 0.3, hint: "holds muscle" },
              { label: "Standard", value: 0.5 },
              { label: "Aggressive", value: 0.8, hint: "risks muscle" },
            ]}
            value={weeklyDeficitPct}
            onChange={setDeficit}
          />
          <div style={{ height: 16 }} />
          <Toggle label="Enough protein" hint="≈ 0.7–1 g per lb of bodyweight" value={proteinAdequate} onChange={setProtein} />
          <div style={{ height: 8 }} />
          <Toggle label="Lifting weights" hint="Keeps muscle in a deficit" value={resistanceTraining} onChange={setLifting} />

          {preview && (
            <div style={{ marginTop: 26, textAlign: "center" }}>
              <div style={{ fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.26em", textTransform: "uppercase", color: C.muted }}>Projected date</div>
              {preview.out.reachable ? (
                <>
                  <div key={`${preview.out.targetYear}-${preview.out.targetMonth}`} className="settle" style={{ fontFamily: SERIF, fontSize: 44, lineHeight: 1, color: C.bone, marginTop: 10 }}>
                    {preview.out.targetMonth} <span className="tnum">{preview.out.targetYear}</span>
                  </div>
                  <div className="shimmer" style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11.5, color: C.gold, marginTop: 10 }}>{preview.band.label}</div>
                </>
              ) : (
                <div className="settle" style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 26, color: C.goldSoft, marginTop: 10 }}>Not reachable at this rate</div>
              )}
            </div>
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          <PrimaryButton onClick={save}>Save target →</PrimaryButton>
        </div>
      </PhoneFrame>
    </PageShell>
  );
}
