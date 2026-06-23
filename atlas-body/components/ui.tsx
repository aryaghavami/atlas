"use client";
import type { CSSProperties, ReactNode } from "react";
import { tapHaptic } from "@/lib/haptics";

// Small tactile controls shared by onboarding / log / target. On-brand: warm-dark, gold accents.
const GEIST = "'Geist', sans-serif";

const C = {
  bone: "#EFEBE3", ash: "#b8b3a8", muted: "#908C83", faint: "#6E6A63",
  gold: "#b9952f", goldSoft: "#D9B27C", sage: "#A8C3A6",
  sel: "rgba(212,175,55,0.10)", selBorder: "rgba(212,175,55,0.55)",
  border: "rgba(239,235,227,0.14)", raise: "rgba(239,235,227,0.05)",
};

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontFamily: GEIST, fontSize: 11, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: C.muted, marginBottom: 12 }}>
      {children}
    </div>
  );
}

export function Segmented<T extends string | number>({
  options, value, onChange,
}: {
  options: { label: string; value: T; hint?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            onClick={() => { tapHaptic(); onChange(o.value); }}
            className="press"
            style={{
              flex: "1 1 auto", minWidth: 64, cursor: "pointer",
              padding: "13px 12px", borderRadius: 12,
              background: active ? C.sel : C.raise,
              border: `1px solid ${active ? C.selBorder : C.border}`,
              color: active ? C.bone : C.muted,
              fontFamily: GEIST, fontSize: 14, fontWeight: active ? 500 : 400, textAlign: "center",
            }}
          >
            {o.label}
            {o.hint && <div style={{ fontSize: 10.5, fontWeight: 300, color: C.faint, marginTop: 3 }}>{o.hint}</div>}
          </button>
        );
      })}
    </div>
  );
}

export function Stepper({
  value, onChange, step = 1, min = 0, max = 999, suffix, decimals = 0,
}: {
  value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number; suffix?: string; decimals?: number;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step));
  const bump = (d: number) => { tapHaptic(); onChange(clamp(value + d * step)); };
  const btn: CSSProperties = {
    width: 52, height: 56, flex: "none", cursor: "pointer", borderRadius: 12, background: C.raise,
    border: `1px solid ${C.border}`, color: C.bone, fontFamily: GEIST, fontSize: 24, fontWeight: 300, lineHeight: 0,
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button type="button" className="press" style={btn} onClick={() => bump(-1)} aria-label="decrease">–</button>
      <div style={{ flex: 1, textAlign: "center", fontFamily: "'Geist Mono', monospace", fontWeight: 300, fontSize: 34, color: C.bone }} className="tnum">
        {value.toFixed(decimals)}
        {suffix && <span style={{ fontSize: "0.5em", color: C.muted, marginLeft: 5 }}>{suffix}</span>}
      </div>
      <button type="button" className="press" style={btn} onClick={() => bump(1)} aria-label="increase">+</button>
    </div>
  );
}

export function Slider({
  value, onChange, min, max, step = 0.1, suffix, decimals = 0, caption,
}: {
  value: number; onChange: (v: number) => void; min: number; max: number; step?: number; suffix?: string; decimals?: number; caption?: string;
}) {
  return (
    <div>
      <div style={{ textAlign: "center", fontFamily: "'Geist Mono', monospace", fontWeight: 300, fontSize: 46, color: C.bone, marginBottom: 6 }} className="tnum">
        {value.toFixed(decimals)}
        {suffix && <span style={{ fontSize: "0.45em", color: C.muted, marginLeft: 4 }}>{suffix}</span>}
      </div>
      {caption && <div style={{ textAlign: "center", fontFamily: GEIST, fontSize: 12.5, fontWeight: 300, color: C.gold, marginBottom: 16 }}>{caption}</div>}
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: "#b9952f", height: 26 }}
      />
    </div>
  );
}

export function Toggle({ label, value, onChange, hint }: { label: string; value: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <button
      type="button"
      onClick={() => { tapHaptic(); onChange(!value); }}
      className="press"
      style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
        padding: "14px 16px", borderRadius: 12, background: C.raise, border: `1px solid ${C.border}`, textAlign: "left",
      }}
    >
      <span>
        <span style={{ fontFamily: GEIST, fontSize: 14.5, color: C.bone }}>{label}</span>
        {hint && <span style={{ display: "block", fontFamily: GEIST, fontSize: 11.5, fontWeight: 300, color: C.faint, marginTop: 2 }}>{hint}</span>}
      </span>
      <span style={{ width: 46, height: 28, flex: "none", borderRadius: 999, background: value ? "rgba(168,195,166,0.9)" : "rgba(239,235,227,0.14)", position: "relative", transition: "background 180ms ease" }}>
        <span style={{ position: "absolute", top: 3, left: value ? 21 : 3, width: 22, height: 22, borderRadius: 999, background: "#08080a", transition: "left 180ms cubic-bezier(0.16,1,0.3,1)" }} />
      </span>
    </button>
  );
}

export function PrimaryButton({ children, onClick, disabled }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => { if (!disabled) { tapHaptic(); onClick?.(); } }}
      className="press"
      style={{
        width: "100%", height: 56, borderRadius: 14, border: "none", cursor: disabled ? "default" : "pointer",
        background: disabled ? "rgba(239,235,227,0.18)" : "#EFEBE3", color: "#08080a",
        fontFamily: GEIST, fontSize: 15, fontWeight: 500, letterSpacing: "0.01em",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

export const onbColors = C;
