// Atlas - Assumptions editor. Edit the engine's inputs (income · burn · expected return);
// the projected date + net contribution recompute live (debounced), then Save persists them.
"use client";
import { useState, useRef } from "react";

const GEIST = "'Geist', sans-serif";
const MONO = "'Geist Mono', monospace";
const SERIF = "'Instrument Serif', serif";

type Vals = { target: number; income: number; burn: number; returnPct: number };
type Proj = { month: string | null; year: number | null; reachable: boolean; contribution: number };

const fmt = (n: number) => n.toLocaleString("en-US");

function Field({
  label, value, prefix, suffix, onChange, onCommit,
}: {
  label: string; value: string; prefix?: string; suffix?: string;
  onChange: (v: string) => void; onCommit: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 0", borderBottom: "1px solid rgba(239,235,227,0.09)" }}>
      <span style={{ fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#908C83" }}>{label}</span>
      <label style={{ display: "flex", alignItems: "baseline", cursor: "text", fontFamily: MONO, fontWeight: 300, fontSize: 22, color: "#EFEBE3", fontVariantNumeric: "tabular-nums lining-nums" }}>
        {prefix && <span style={{ fontSize: "0.62em", color: "#908C83", marginRight: "0.05em" }}>{prefix}</span>}
        <input
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onCommit(); }}
          style={{
            fontFamily: MONO, fontWeight: 300, fontSize: 22, color: "#EFEBE3",
            fontVariantNumeric: "tabular-nums lining-nums", background: "transparent",
            border: "none", outline: "none", caretColor: "#A8C3A6", padding: 0, margin: 0,
            textAlign: "right", width: `${Math.max(value.length, 1)}ch`,
          }}
        />
        {suffix && <span style={{ fontSize: "0.62em", color: "#908C83", marginLeft: "0.08em" }}>{suffix}</span>}
      </label>
    </div>
  );
}

export function AtlasAssumptions({
  initial,
  projectedMonth = "",
  projectedYear = null,
  reproject,
  onSave,
  saving = false,
}: {
  initial: Vals;
  projectedMonth?: string;
  projectedYear?: number | null;
  reproject?: (v: Vals) => Promise<Proj>;
  onSave?: (v: Vals) => void;
  saving?: boolean;
}) {
  const [target, setTarget] = useState(String(Math.round(initial.target)));
  const [income, setIncome] = useState(String(Math.round(initial.income)));
  const [burn, setBurn] = useState(String(Math.round(initial.burn)));
  const [ret, setRet] = useState(String(initial.returnPct));
  const [proj, setProj] = useState<Proj>({ month: projectedMonth, year: projectedYear, reachable: !!projectedYear, contribution: Math.round(initial.income - initial.burn) });
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const vals = (): Vals => ({ target: Number(target) || 0, income: Number(income) || 0, burn: Number(burn) || 0, returnPct: Number(ret) || 0 });

  const recompute = () => {
    if (!reproject) return;
    if (timer.current) clearTimeout(timer.current);
    setBusy(true);
    timer.current = setTimeout(() => {
      reproject(vals()).then(setProj).catch(() => {}).finally(() => setBusy(false));
    }, 220);
  };
  const onNum = (set: (s: string) => void) => (raw: string) => { set(raw.replace(/[^\d.]/g, "")); recompute(); };

  return (
    <div style={{ width: 390, height: 844, borderRadius: 56, background: "#0a0a0b", padding: 11, boxShadow: "0 50px 90px -30px rgba(26,24,20,0.5),0 0 0 1px rgba(0,0,0,0.55)", position: "relative" }}>
      <div style={{ position: "absolute", inset: 11, borderRadius: 45, background: "#0C0C0D", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 13, left: "50%", transform: "translateX(-50%)", width: 118, height: 33, borderRadius: 18, background: "#000", zIndex: 6 }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", zIndex: 5 }}>
          <span style={{ fontFamily: GEIST, fontSize: 14, fontWeight: 500, color: "#EFEBE3", letterSpacing: "0.02em" }}>9:41</span>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 11 }}>{[5, 7, 9, 11].map((h) => <div key={h} style={{ width: 3, height: h, background: "#EFEBE3", borderRadius: 1 }} />)}</div>
            <div style={{ width: 24, height: 12, borderRadius: 3, border: "1px solid rgba(239,235,227,0.5)", padding: 1.5 }}><div style={{ width: "72%", height: "100%", background: "#EFEBE3", borderRadius: 1 }} /></div>
          </div>
        </div>
        <div style={{ position: "absolute", inset: 0, padding: "76px 30px 34px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: SERIF, fontSize: 22, color: "#EFEBE3", letterSpacing: "0.01em" }}>Atlas</span>
            <span style={{ fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "#908C83" }}>Assumptions</span>
          </div>
          <div style={{ marginTop: 30, fontFamily: GEIST, fontWeight: 300, fontSize: 25, lineHeight: 1.2, color: "#EFEBE3", letterSpacing: "-0.015em" }}>Tune your<br />trajectory.</div>
          <div style={{ marginTop: 8, fontFamily: GEIST, fontWeight: 300, fontSize: 13, lineHeight: 1.55, color: "#9A968D", maxWidth: 292 }}>Your target and the assumptions behind it. Edit anything. The date moves live.</div>

          <div style={{ marginTop: 20, borderTop: "1px solid rgba(239,235,227,0.09)" }}>
            <Field label="Net-worth target" prefix="$" value={target ? fmt(Number(target)) : ""} onChange={onNum(setTarget)} onCommit={() => onSave?.(vals())} />
            <Field label="Monthly income" prefix="$" value={income ? fmt(Number(income)) : ""} onChange={onNum(setIncome)} onCommit={() => onSave?.(vals())} />
            <Field label="Monthly spending" prefix="$" value={burn ? fmt(Number(burn)) : ""} onChange={onNum(setBurn)} onCommit={() => onSave?.(vals())} />
            <Field label="Expected return" suffix="%" value={ret} onChange={onNum(setRet)} onCommit={() => onSave?.(vals())} />
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", opacity: busy ? 0.45 : 1, transition: "opacity 180ms ease" }}>
            <div style={{ fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "#908C83" }}>Net contribution</div>
            <div style={{ marginTop: 8, fontFamily: MONO, fontWeight: 300, fontSize: 24, color: proj.contribution >= 0 ? "#A8C3A6" : "#D9B27C", fontVariantNumeric: "tabular-nums lining-nums" }}>
              {proj.contribution < 0 ? "−" : ""}${fmt(Math.abs(proj.contribution))}<span style={{ fontFamily: GEIST, fontSize: 12, color: "#7E7A72", marginLeft: 6 }}>/mo</span>
            </div>
            <div style={{ marginTop: 22, fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "#908C83" }}>Projected arrival</div>
            {proj.reachable && proj.year ? (
              <div style={{ fontFamily: SERIF, fontSize: 44, lineHeight: 1.05, color: "#EFEBE3", marginTop: 6, fontVariantNumeric: "tabular-nums lining-nums" }}>
                <span style={{ fontStyle: "italic", fontSize: "0.5em", color: "#9A968D", marginRight: "0.3em" }}>{proj.month}</span>{proj.year}
              </div>
            ) : (
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 34, color: "#D9B27C", marginTop: 8 }}>Beyond reach</div>
            )}
          </div>

          <div onClick={() => onSave?.(vals())} style={{ height: 54, borderRadius: 14, background: saving ? "#cfcabf" : "#EFEBE3", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: GEIST, fontSize: 15, fontWeight: 500, color: "#0C0C0D", letterSpacing: "0.01em", cursor: "pointer" }}>
            {saving ? "Saving" : "Save assumptions"}
          </div>
        </div>
      </div>
    </div>
  );
}
