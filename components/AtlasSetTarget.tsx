// Atlas - Set target (screen 02). Faithful build of design/atlas/Atlas.dc.html.
// The big number is a real editable input: tap it, type your target. The green caret
// is the live cursor. The projected arrival date recomputes as you type (debounced).
"use client";
import { useState, useRef, useEffect } from "react";

const GEIST = "'Geist', sans-serif";
const MONO = "'Geist Mono', monospace";
const SERIF = "'Instrument Serif', serif";

type Proj = { month: string | null; year: number | null; reachable: boolean };

export function AtlasSetTarget({
  initialTarget = 2500000,
  projectedMonth = "March",
  projectedYear = 2031,
  reachable = true,
  reproject,
  onSetTarget,
}: {
  initialTarget?: number;
  projectedMonth?: string;
  projectedYear?: number;
  reachable?: boolean;
  reproject?: (target: number) => Promise<Proj>;
  onSetTarget?: (target: number) => void;
}) {
  const [raw, setRaw] = useState(String(Math.round(initialTarget || 0)));
  const [proj, setProj] = useState<Proj>({ month: projectedMonth, year: projectedYear, reachable });
  const [computing, setComputing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const display = raw ? Number(raw).toLocaleString("en-US") : "";

  // Sync the projection to the prefilled target on mount (the date must match the number shown).
  useEffect(() => {
    if (!reproject) return;
    let alive = true;
    reproject(Math.round(initialTarget || 0)).then((p) => { if (alive) setProj(p); }).catch(() => {});
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (next: string) => {
    const digits = next.replace(/[^\d]/g, "").slice(0, 13);
    setRaw(digits);
    if (!reproject) return;
    if (timer.current) clearTimeout(timer.current);
    const t = digits ? Number(digits) : 0;
    if (t <= 0) { setProj({ month: null, year: null, reachable: false }); return; }
    setComputing(true);
    timer.current = setTimeout(() => {
      reproject(t).then((p) => setProj(p)).catch(() => {}).finally(() => setComputing(false));
    }, 220);
  };

  const commit = () => onSetTarget?.(raw ? Number(raw) : Math.round(initialTarget || 0));

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
            <span style={{ fontFamily: GEIST, fontSize: 13, fontWeight: 400, color: "#908C83" }}>Back</span>
            <span style={{ fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "#908C83" }}>Step 2 / 2</span>
          </div>
          <div style={{ marginTop: 50, textAlign: "center" }}>
            <div style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 27, lineHeight: 1.22, color: "#EFEBE3", letterSpacing: "-0.015em" }}>Where are you<br />headed?</div>
            <div style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 14, lineHeight: 1.6, color: "#9A968D", marginTop: 13, maxWidth: 264, marginLeft: "auto", marginRight: "auto" }}>Your net-worth target. Change it any time.</div>
          </div>
          <div style={{ marginTop: 54, textAlign: "center" }}>
            <div style={{ fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.24em", textTransform: "uppercase", color: "#908C83" }}>Target</div>
            <label style={{ marginTop: 18, fontFamily: MONO, fontWeight: 300, fontSize: 46, lineHeight: 1, color: "#EFEBE3", letterSpacing: "-0.012em", fontVariantNumeric: "tabular-nums lining-nums", display: "flex", alignItems: "flex-start", justifyContent: "center", cursor: "text" }}>
              <span style={{ fontSize: "0.5em", color: "#908C83", marginTop: "0.34em", marginRight: "0.05em" }}>$</span>
              <input
                autoFocus
                inputMode="numeric"
                value={display}
                placeholder="0"
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") commit(); }}
                style={{
                  fontFamily: MONO, fontWeight: 300, fontSize: 46, lineHeight: 1,
                  color: "#EFEBE3", letterSpacing: "-0.012em",
                  fontVariantNumeric: "tabular-nums lining-nums",
                  background: "transparent", border: "none", outline: "none",
                  caretColor: "#A8C3A6", padding: 0, margin: 0, textAlign: "left",
                  width: `${(display.length || 1)}ch`, minWidth: "1ch",
                }}
              />
            </label>
            <div style={{ marginTop: 24, height: 1, background: "rgba(239,235,227,0.14)" }} />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
            <div style={{ fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.24em", textTransform: "uppercase", color: "#908C83" }}>Projected arrival</div>
            <div style={{ opacity: computing ? 0.45 : 1, transition: "opacity 180ms ease" }}>
              {proj.reachable && proj.year ? (
                <>
                  <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 25, color: "#9A968D", marginTop: 15 }}>{proj.month}</div>
                  <div style={{ fontFamily: SERIF, fontSize: 78, lineHeight: 0.94, color: "#EFEBE3", letterSpacing: "-0.02em", marginTop: 1, fontVariantNumeric: "tabular-nums lining-nums" }}>{proj.year}</div>
                  <div style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 13, color: "#7E7A72", marginTop: 16, letterSpacing: "0.01em" }}>At your current trajectory.</div>
                </>
              ) : (
                <>
                  <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 46, lineHeight: 1.05, color: "#EFEBE3", marginTop: 18 }}>Beyond reach</div>
                  <div style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 13, color: "#D9B27C", marginTop: 16, maxWidth: 230, lineHeight: 1.5 }}>Not on this trajectory. Lower the target, or raise income.</div>
                </>
              )}
            </div>
          </div>
          <div onClick={commit} style={{ height: 54, borderRadius: 14, background: "#EFEBE3", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: GEIST, fontSize: 15, fontWeight: 500, color: "#0C0C0D", letterSpacing: "0.01em", cursor: "pointer" }}>Set target</div>
        </div>
      </div>
    </div>
  );
}
