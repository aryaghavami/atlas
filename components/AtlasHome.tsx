"use client";
import { useEffect, useState } from "react";

// Atlas - Home (the three figures). Faithful build of design/atlas/Atlas.dc.html.
// Net worth (mono) · target date (Instrument Serif hero) · runway (mono), count-up on load.
const GEIST = "'Geist', sans-serif";
const MONO = "'Geist Mono', monospace";
const SERIF = "'Instrument Serif', serif";

export function AtlasHome({
  netWorth = 1284000,
  runwayMonths = 27,
  targetMonth = "March",
  targetYear = 2031,
  onTrack = true,
  reachable = true,
  countUp = true,
  bandLow,
  bandHigh,
  prob,
  adjustHref,
  accountsHref,
  maskNetWorth = false,
}: {
  netWorth?: number;
  runwayMonths?: number;
  targetMonth?: string;
  targetYear?: number;
  onTrack?: boolean;
  reachable?: boolean;
  countUp?: boolean;
  bandLow?: number;
  bandHigh?: number;
  prob?: number;
  adjustHref?: string;
  accountsHref?: string;
  maskNetWorth?: boolean;
}) {
  const [t, setT] = useState(countUp ? 0 : 3000);
  useEffect(() => {
    if (!countUp) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const e = now - start;
      setT(e);
      if (e < 2700) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [countUp]);

  const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
  const val = (delay: number, dur: number, from: number, to: number) =>
    countUp ? from + (to - from) * ease(Math.min(Math.max((t - delay) / dur, 0), 1)) : to;

  const netRaw = Math.round(val(140, 1500, 0, netWorth));
  const netAbs = Math.abs(netRaw).toLocaleString("en-US");
  const runway = Math.round(val(440, 1400, 0, runwayMonths));
  const year = Math.round(val(740, 1500, 2026, targetYear));
  const accent = onTrack ? "#A8C3A6" : "#D9B27C";
  const rise = (delay: number) => ({
    animation: "atlasRise 1000ms cubic-bezier(0.16,1,0.3,1) both",
    animationDelay: `${delay}ms`,
  });

  return (
    <>
      <style>{`@keyframes atlasRise{from{opacity:0;transform:translateY(13px)}to{opacity:1;transform:translateY(0)}}.atlas-adjust{color:#6E6A63;transition:color 160ms ease;display:flex;align-items:center;text-decoration:none}.atlas-adjust:hover{color:#A8C3A6}`}</style>
      <div style={{ width: 390, height: 844, borderRadius: 56, background: "#0a0a0b", padding: 11, boxShadow: "0 60px 110px -34px rgba(26,24,20,0.6),0 0 0 1px rgba(0,0,0,0.55)", position: "relative" }}>
        <div style={{ position: "absolute", inset: 11, borderRadius: 45, background: "#0C0C0D", overflow: "hidden" }}>
          {/* notch */}
          <div style={{ position: "absolute", top: 13, left: "50%", transform: "translateX(-50%)", width: 118, height: 33, borderRadius: 18, background: "#000", zIndex: 6 }} />
          {/* status bar */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", zIndex: 5 }}>
            <span style={{ fontFamily: GEIST, fontSize: 14, fontWeight: 500, color: "#EFEBE3", letterSpacing: "0.02em" }}>9:41</span>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 11 }}>
                {[5, 7, 9, 11].map((h) => <div key={h} style={{ width: 3, height: h, background: "#EFEBE3", borderRadius: 1 }} />)}
              </div>
              <div style={{ width: 24, height: 12, borderRadius: 3, border: "1px solid rgba(239,235,227,0.5)", padding: 1.5, position: "relative" }}>
                <div style={{ width: "72%", height: "100%", background: "#EFEBE3", borderRadius: 1 }} />
              </div>
            </div>
          </div>
          {/* content */}
          <div style={{ position: "absolute", inset: 0, padding: "78px 32px 40px", display: "flex", flexDirection: "column" }}>
            {/* chrome */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", ...rise(0) }}>
              <span style={{ fontFamily: SERIF, fontSize: 22, color: "#EFEBE3", letterSpacing: "0.01em" }}>Datum</span>
              <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                {adjustHref && (
                  <a href={adjustHref} aria-label="Adjust assumptions" className="atlas-adjust">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                      <line x1="4" y1="9" x2="20" y2="9" /><circle cx="10" cy="9" r="2.4" fill="#0C0C0D" />
                      <line x1="4" y1="15" x2="20" y2="15" /><circle cx="15" cy="15" r="2.4" fill="#0C0C0D" />
                    </svg>
                  </a>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent, boxShadow: `0 0 11px ${accent}b3` }} />
                  <span style={{ fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: accent, whiteSpace: "nowrap" }}>{onTrack ? "On track" : "Watch"}</span>
                </div>
              </div>
            </div>
            {/* net worth - tappable into the per-account breakdown when wired (live) */}
            <a href={accountsHref || undefined} style={{ display: "block", textDecoration: "none", color: "inherit", cursor: accountsHref ? "pointer" : "default", marginTop: 62, ...rise(120) }}>
              <div style={{ fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.24em", textTransform: "uppercase", color: "#908C83" }}>Net worth{accountsHref && <span style={{ color: "#6E6A63", marginLeft: 7 }}>›</span>}</div>
              {maskNetWorth ? (
                // Redacted: the real figure is never rendered (not in the DOM), so it is truly hidden.
                <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 13 }}>
                  <span style={{ fontFamily: MONO, fontWeight: 300, fontSize: 45, lineHeight: 1, color: "#5A574F" }}>$</span>
                  <div aria-label="Hidden" style={{ width: 224, height: 40, borderRadius: 9, border: "1px solid rgba(239,235,227,0.10)", background: "repeating-linear-gradient(135deg, rgba(239,235,227,0.09) 0 9px, rgba(239,235,227,0.03) 9px 18px)" }} />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6E6A63" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10.5" width="16" height="10.5" rx="2.2" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" /></svg>
                </div>
              ) : (
                <div style={{ marginTop: 15, fontFamily: MONO, fontWeight: 300, fontSize: 45, lineHeight: 1, color: "#EFEBE3", letterSpacing: "-0.012em", fontVariantNumeric: "tabular-nums lining-nums" }}>
                  {netRaw < 0 && <span style={{ marginRight: "0.03em" }}>−</span>}<span style={{ fontSize: "0.48em", color: "#908C83", verticalAlign: "0.62em", marginRight: "0.05em" }}>$</span>{netAbs}
                </div>
              )}
            </a>
            {/* hero: target date */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
              <div style={{ fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.26em", textTransform: "uppercase", color: "#908C83", ...rise(380) }}>Target date</div>
              {reachable ? (
                <>
                  <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 31, color: "#9A968D", marginTop: 18, ...rise(480) }}>{targetMonth}</div>
                  <div style={{ fontFamily: SERIF, fontSize: 122, lineHeight: 0.9, color: "#EFEBE3", letterSpacing: "-0.025em", marginTop: 2, fontVariantNumeric: "tabular-nums lining-nums", ...rise(560) }}>{year}</div>
                  {bandLow && bandHigh && (
                    <div style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 11, letterSpacing: "0.04em", color: "#6E6A63", marginTop: 14, ...rise(660) }}>
                      {bandLow === bandHigh ? `most likely ${bandLow}` : `80% odds · ${bandLow} to ${bandHigh}`}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 56, lineHeight: 1, color: "#EFEBE3", marginTop: 16, ...rise(480) }}>Not&nbsp;yet</div>
                  <div style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 13, lineHeight: 1.5, color: "#D9B27C", marginTop: 16, maxWidth: 232, ...rise(560) }}>Not on track at this trajectory. Raise income, cut burn, or kill the debt.</div>
                </>
              )}
            </div>
            {/* runway */}
            <div style={rise(740)}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", borderTop: "1px solid rgba(239,235,227,0.1)", paddingTop: 22 }}>
                <span style={{ fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.24em", textTransform: "uppercase", color: "#908C83" }}>Runway</span>
                <span style={{ fontFamily: MONO, fontWeight: 300, fontSize: 31, lineHeight: 1, color: "#EFEBE3", fontVariantNumeric: "tabular-nums lining-nums" }}>
                  {runway}<span style={{ fontFamily: GEIST, fontSize: 13, fontWeight: 300, color: "#908C83", letterSpacing: "0.03em", marginLeft: 7 }}>months</span>
                </span>
              </div>
              <div style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 12, color: "#6E6A63", marginTop: 11, letterSpacing: "0.01em" }}>If income stopped today.</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
