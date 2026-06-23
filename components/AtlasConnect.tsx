import type { ReactNode } from "react";

// Atlas - Connect accounts (screen 01). Faithful build of design/atlas/Atlas.dc.html.
const GEIST = "'Geist', sans-serif";
const MONO = "'Geist Mono', monospace";
const SERIF = "'Instrument Serif', serif";

// Balances MUST sum to lib/atlasData.ts `representative` net worth ($1,000,000) so the
// connect list reconciles to the Home net-worth figure on camera.
const ACCOUNTS = [
  { name: "Chase", sub: "Checking ···· 4021", bal: "$14,200" },
  { name: "Charles Schwab", sub: "Brokerage ···· 8830", bal: "$223,400" },
  { name: "Vanguard", sub: "401(k) ···· 2245", bal: "$104,580" },
];

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A8C3A6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4 10-11" /></svg>
);

export function AtlasConnect({ onContinue, footer }: { onContinue?: () => void; footer?: ReactNode }) {
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
            <span style={{ fontFamily: SERIF, fontSize: 22, color: "#EFEBE3", letterSpacing: "0.01em" }}>Datum</span>
            <span style={{ fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "#908C83" }}>Step 1 / 2</span>
          </div>
          <div style={{ marginTop: 48 }}>
            <div style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 29, lineHeight: 1.2, color: "#EFEBE3", letterSpacing: "-0.015em" }}>Connect your<br />accounts.</div>
            <div style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 14, lineHeight: 1.6, color: "#9A968D", marginTop: 16, maxWidth: 290 }}>Datum reads your balances to compute your runway and trajectory. <span style={{ color: "#EFEBE3", fontWeight: 400 }}>Read-only. We can see, never move a dollar.</span></div>
          </div>
          <div style={{ marginTop: 22, display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 9, border: "1px solid rgba(239,235,227,0.13)", borderRadius: 999, padding: "9px 14px" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A8C3A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10.5" width="16" height="10.5" rx="2.2" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" /></svg>
            <span style={{ fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "#A8C3A6" }}>256-bit encryption · via Plaid</span>
          </div>
          {footer ? (
            // Live flow: no fake pre-connected accounts - prompt to link the first one.
            <div style={{ marginTop: 38 }}>
              <div style={{ fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.24em", textTransform: "uppercase", color: "#908C83" }}>Accounts</div>
              <div style={{ marginTop: 14, fontFamily: GEIST, fontWeight: 300, fontSize: 14, lineHeight: 1.6, color: "#7E7A72", maxWidth: 292 }}>
                None linked yet. Connect your first account below. Datum reads balances only, and never moves money.
              </div>
            </div>
          ) : (
            // Demo: representative pre-connected list (the designed cold-open look).
            <div style={{ marginTop: 38 }}>
              <div style={{ fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.24em", textTransform: "uppercase", color: "#908C83" }}>Connected</div>
              <div style={{ marginTop: 6 }}>
                {ACCOUNTS.map((a, i) => (
                  <div key={a.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "17px 0", borderTop: "1px solid rgba(239,235,227,0.09)", borderBottom: i === ACCOUNTS.length - 1 ? "1px solid rgba(239,235,227,0.09)" : "none" }}>
                    <div>
                      <div style={{ fontFamily: GEIST, fontSize: 15, fontWeight: 400, color: "#EFEBE3" }}>{a.name}</div>
                      <div style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 300, color: "#7E7A72", marginTop: 3, letterSpacing: "0.02em" }}>{a.sub}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 300, color: "#EFEBE3", fontVariantNumeric: "tabular-nums lining-nums" }}>{a.bal}</span>
                      <Check />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 11 }}>
            {footer ?? (
              <>
                <div style={{ height: 52, borderRadius: 14, border: "1px solid rgba(239,235,227,0.16)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: GEIST, fontSize: 14, fontWeight: 400, color: "#EFEBE3", letterSpacing: "0.01em" }}>+ Add another account</div>
                <div onClick={onContinue} style={{ height: 54, borderRadius: 14, background: "#EFEBE3", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: GEIST, fontSize: 15, fontWeight: 500, color: "#0C0C0D", letterSpacing: "0.01em", cursor: "pointer" }}>Continue</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
