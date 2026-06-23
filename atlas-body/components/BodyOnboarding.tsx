"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PageShell, PhoneFrame } from "./PhoneFrame";
import { FieldLabel, PrimaryButton, Segmented, Slider, Stepper, Toggle, onbColors as C } from "./ui";
import { computeBody } from "@/lib/engine";
import { monteCarloBands } from "@/lib/engineBands";
import { navyBodyFat } from "@/lib/bodyfat";
import { cmToFtIn, ftInToCm, kgToLb, lbToKg } from "@/lib/format";
import { saveState } from "@/lib/store";
import { todayIso } from "@/lib/format";
import { tapHaptic } from "@/lib/haptics";
import type { Sex } from "@/lib/types";

const GEIST = "'Geist', sans-serif";
const SERIF = "'Instrument Serif', serif";

interface Draft {
  sex: Sex;
  units: "imperial" | "metric";
  heightCm: number;
  weightLb: number;
  bodyFatPct: number;
  trainingAgeYears: number;
  goalBodyFatPct: number;
  weeklyDeficitPct: number;
  proteinAdequate: boolean;
  resistanceTraining: boolean;
}

const STEPS = ["you", "body", "fat", "training", "goal"] as const;

function bfCaption(sex: Sex, pct: number): string {
  const p = sex === "female" ? pct - 7 : pct;
  if (p < 8) return "Stage-lean — striated, hard to hold";
  if (p < 11) return "Visible abs — beach-lean";
  if (p < 14) return "Lean and defined";
  if (p < 18) return "Athletic";
  if (p < 23) return "Fit";
  return "Average and up";
}

export function BodyOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showTape, setShowTape] = useState(false);
  const [tape, setTape] = useState({ neckCm: 38, waistCm: 86, hipCm: 100 });
  const [d, setD] = useState<Draft>({
    sex: "male", units: "imperial", heightCm: 178, weightLb: 180, bodyFatPct: 20,
    trainingAgeYears: 1.5, goalBodyFatPct: 12, weeklyDeficitPct: 0.5,
    proteinAdequate: true, resistanceTraining: true,
  });
  const set = (patch: Partial<Draft>) => setD((x) => ({ ...x, ...patch }));

  const onReveal = step >= STEPS.length;
  const now = new Date();

  const preview = useMemo(() => {
    const input = {
      sex: d.sex, heightCm: d.heightCm, weightLb: d.weightLb, bodyFatPct: d.bodyFatPct,
      trainingAgeYears: d.trainingAgeYears, goalBodyFatPct: d.goalBodyFatPct,
      weeklyDeficitPct: d.weeklyDeficitPct, proteinAdequate: d.proteinAdequate,
      resistanceTraining: d.resistanceTraining, baseYear: now.getFullYear(), baseMonth: now.getMonth(),
    };
    return { out: computeBody(input), band: monteCarloBands(input) };
  }, [d, now]);

  const finish = () => {
    saveState({
      profile: {
        sex: d.sex, heightCm: d.heightCm, trainingAgeYears: d.trainingAgeYears,
        goalBodyFatPct: d.goalBodyFatPct, weeklyDeficitPct: d.weeklyDeficitPct,
        proteinAdequate: d.proteinAdequate, resistanceTraining: d.resistanceTraining, units: d.units,
      },
      weighIns: [{ date: todayIso(), weightLb: d.weightLb, bodyFatPct: d.bodyFatPct, source: "manual" }],
    });
    router.push("/body");
  };

  const ft = cmToFtIn(d.heightCm);
  const kg = Math.round(lbToKg(d.weightLb));

  return (
    <PageShell>
      <PhoneFrame contentStyle={{ padding: "60px 30px 34px" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <button
            type="button"
            onClick={() => { tapHaptic(); step === 0 ? router.push("/body") : setStep((s) => s - 1); }}
            className="press"
            style={{ background: "none", border: "none", cursor: "pointer", fontFamily: GEIST, fontSize: 13, color: C.muted }}
          >
            ‹ Back
          </button>
          <div style={{ fontFamily: GEIST, fontSize: 11, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: C.faint }}>
            {onReveal ? "Your date" : `Step ${step + 1} / ${STEPS.length}`}
          </div>
        </div>

        {/* progress */}
        <div style={{ display: "flex", gap: 5, marginBottom: 30 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= (onReveal ? STEPS.length : step) ? "#b9952f" : "rgba(239,235,227,0.12)", transition: "background 240ms ease" }} />
          ))}
        </div>

        {/* body */}
        <div key={step} className="rise" style={{ flex: 1, overflowY: "auto" }}>
          {!onReveal && STEPS[step] === "you" && (
            <Section title="The basics" sub="Two taps. We never ask for an account.">
              <FieldLabel>You are</FieldLabel>
              <Segmented options={[{ label: "Male", value: "male" }, { label: "Female", value: "female" }]} value={d.sex} onChange={(v) => set({ sex: v })} />
              <div style={{ height: 22 }} />
              <FieldLabel>Units</FieldLabel>
              <Segmented options={[{ label: "Imperial (lb)", value: "imperial" }, { label: "Metric (kg)", value: "metric" }]} value={d.units} onChange={(v) => set({ units: v })} />
            </Section>
          )}

          {!onReveal && STEPS[step] === "body" && (
            <Section title="Height and weight" sub="From your last weigh-in. You can change it anytime.">
              <FieldLabel>Height</FieldLabel>
              {d.units === "imperial" ? (
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}><Stepper value={ft.ft} min={4} max={7} suffix="ft" onChange={(v) => set({ heightCm: ftInToCm(v, ft.inch) })} /></div>
                  <div style={{ flex: 1 }}><Stepper value={ft.inch} min={0} max={11} suffix="in" onChange={(v) => set({ heightCm: ftInToCm(ft.ft, v) })} /></div>
                </div>
              ) : (
                <Stepper value={d.heightCm} min={130} max={220} suffix="cm" onChange={(v) => set({ heightCm: v })} />
              )}
              <div style={{ height: 22 }} />
              <FieldLabel>Weight</FieldLabel>
              {d.units === "imperial" ? (
                <Stepper value={Math.round(d.weightLb)} min={80} max={500} suffix="lb" onChange={(v) => set({ weightLb: v })} />
              ) : (
                <Stepper value={kg} min={40} max={230} suffix="kg" onChange={(v) => set({ weightLb: Math.round(kgToLb(v)) })} />
              )}
            </Section>
          )}

          {!onReveal && STEPS[step] === "fat" && (
            <Section title="Body fat" sub="From a scale, calipers, or a DEXA. Not sure? Estimate it from a tape.">
              <Slider value={d.bodyFatPct} min={5} max={45} step={0.1} suffix="%" decimals={1} caption={bfCaption(d.sex, d.bodyFatPct)} onChange={(v) => set({ bodyFatPct: v })} />
              <button
                type="button"
                onClick={() => { tapHaptic(); setShowTape((s) => !s); }}
                className="press"
                style={{ background: "none", border: "none", cursor: "pointer", marginTop: 18, fontFamily: GEIST, fontSize: 13, color: C.gold }}
              >
                {showTape ? "Hide tape estimate" : "Estimate from a tape measure →"}
              </button>
              {showTape && (
                <div className="rise" style={{ marginTop: 16, padding: 16, borderRadius: 14, border: `1px solid ${C.border}` }}>
                  <TapeRow label="Neck (cm)" value={tape.neckCm} onChange={(v) => setTape((t) => ({ ...t, neckCm: v }))} />
                  <TapeRow label="Waist at navel (cm)" value={tape.waistCm} onChange={(v) => setTape((t) => ({ ...t, waistCm: v }))} />
                  {d.sex === "female" && <TapeRow label="Hip, widest (cm)" value={tape.hipCm} onChange={(v) => setTape((t) => ({ ...t, hipCm: v }))} />}
                  {(() => {
                    const est = navyBodyFat({ sex: d.sex, heightCm: d.heightCm, neckCm: tape.neckCm, waistCm: tape.waistCm, hipCm: tape.hipCm });
                    return (
                      <button
                        type="button"
                        onClick={() => { tapHaptic(); set({ bodyFatPct: est }); setShowTape(false); }}
                        className="press"
                        style={{ width: "100%", marginTop: 6, padding: "12px", borderRadius: 11, background: "rgba(212,175,55,0.10)", border: `1px solid rgba(212,175,55,0.45)`, color: C.bone, cursor: "pointer", fontFamily: GEIST, fontSize: 13.5 }}
                      >
                        Use estimate · {est}% <span style={{ color: C.faint }}>(±3–4%)</span>
                      </button>
                    );
                  })()}
                </div>
              )}
            </Section>
          )}

          {!onReveal && STEPS[step] === "training" && (
            <Section title="Training age" sub="How long you've trained seriously. It sets how fast muscle can move — and the honest ceiling.">
              <Segmented
                options={[
                  { label: "New", value: 0.5, hint: "< 1 yr" },
                  { label: "1–2 yr", value: 1.5 },
                  { label: "3–5 yr", value: 4 },
                  { label: "5+ yr", value: 7 },
                ]}
                value={d.trainingAgeYears}
                onChange={(v) => set({ trainingAgeYears: v })}
              />
            </Section>
          )}

          {!onReveal && STEPS[step] === "goal" && (
            <Section title="Your target" sub="Where you want to land, and how hard you'll push to get there.">
              <FieldLabel>Target body fat</FieldLabel>
              <Slider value={d.goalBodyFatPct} min={5} max={Math.max(6, Math.round(d.bodyFatPct))} step={0.5} suffix="%" decimals={1} caption={bfCaption(d.sex, d.goalBodyFatPct)} onChange={(v) => set({ goalBodyFatPct: v })} />
              <div style={{ height: 22 }} />
              <FieldLabel>Approach</FieldLabel>
              <Segmented
                options={[
                  { label: "Gentle", value: 0.3, hint: "holds muscle" },
                  { label: "Standard", value: 0.5 },
                  { label: "Aggressive", value: 0.8, hint: "risks muscle" },
                ]}
                value={d.weeklyDeficitPct}
                onChange={(v) => set({ weeklyDeficitPct: v })}
              />
              <div style={{ height: 16 }} />
              <Toggle label="Enough protein" hint="≈ 0.7–1 g per lb of bodyweight" value={d.proteinAdequate} onChange={(v) => set({ proteinAdequate: v })} />
              <div style={{ height: 8 }} />
              <Toggle label="Lifting weights" hint="Resistance training keeps muscle in a deficit" value={d.resistanceTraining} onChange={(v) => set({ resistanceTraining: v })} />

              {/* live whisper of the forming date */}
              <div style={{ textAlign: "center", marginTop: 22, fontFamily: GEIST, fontSize: 12, fontWeight: 300, color: C.faint }}>
                {preview.out.reachable ? (
                  <span>Projected · <span style={{ color: C.gold }}>{preview.out.targetMonth} {preview.out.targetYear}</span></span>
                ) : (
                  <span style={{ color: C.gold }}>Not reachable at this rate</span>
                )}
              </div>
            </Section>
          )}

          {onReveal && (
            <div style={{ textAlign: "center", paddingTop: 30 }}>
              <div style={{ fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.28em", textTransform: "uppercase", color: C.muted }}>
                The honest date
              </div>
              {preview.out.reachable ? (
                <>
                  <div className="focus-in tnum" style={{ fontFamily: SERIF, fontSize: 100, lineHeight: 0.9, color: C.bone, letterSpacing: "-0.02em", marginTop: 18 }}>
                    {preview.out.targetYear}
                  </div>
                  <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 28, color: C.ash, marginTop: 4 }}>{preview.out.targetMonth}</div>
                  <div className="shimmer" style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, fontWeight: 300, color: C.gold, marginTop: 18 }}>{preview.band.label}</div>
                </>
              ) : (
                <div className="focus-in" style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 38, lineHeight: 1.1, color: C.goldSoft, marginTop: 24, maxWidth: 260, marginLeft: "auto", marginRight: "auto" }}>
                  Not reachable at this rate.
                </div>
              )}
              <p style={{ fontFamily: GEIST, fontSize: 13, fontWeight: 300, lineHeight: 1.55, color: C.muted, marginTop: 24, maxWidth: 250, marginLeft: "auto", marginRight: "auto" }}>
                {preview.out.reachable
                  ? "This is the truth at your current pace. Log a weigh-in whenever you step on a scale and watch it move."
                  : "Steepen the deficit, add protein, or pick a less extreme target — then watch the date appear."}
              </p>
            </div>
          )}
        </div>

        {/* footer */}
        <div style={{ marginTop: 16 }}>
          {onReveal ? (
            <PrimaryButton onClick={finish}>Open Atlas · Body →</PrimaryButton>
          ) : (
            <PrimaryButton onClick={() => setStep((s) => s + 1)}>{step === STEPS.length - 1 ? "See my date →" : "Continue"}</PrimaryButton>
          )}
        </div>
      </PhoneFrame>
    </PageShell>
  );
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{ fontFamily: SERIF, fontSize: 30, lineHeight: 1.05, color: C.bone, margin: 0 }}>{title}</h2>
      {sub && <p style={{ fontFamily: GEIST, fontSize: 13.5, fontWeight: 300, lineHeight: 1.5, color: C.muted, margin: "10px 0 26px" }}>{sub}</p>}
      {children}
    </div>
  );
}

function TapeRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontFamily: GEIST, fontSize: 11.5, fontWeight: 300, color: C.muted, marginBottom: 8 }}>{label}</div>
      <Stepper value={value} min={20} max={200} onChange={onChange} />
    </div>
  );
}
