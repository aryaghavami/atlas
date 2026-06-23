// Atlas - Accounts. The breakdown behind net worth: every connected asset + debt.
"use client";
import { PlaidConnect } from "./PlaidConnect";

const GEIST = "'Geist', sans-serif";
const MONO = "'Geist Mono', monospace";
const SERIF = "'Instrument Serif', serif";

type Account = { name: string; balance: number; tier: string };
type Liability = { name: string; balance: number; apr: number; minPayment: number };

const TIER_LABEL: Record<string, string> = { liquid: "Cash", near: "Investments", volatile: "Volatile", illiquid: "Retirement" };
const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

function Row({ name, sub, amount, negative }: { name: string; sub: string; amount: number; negative?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 0", borderBottom: "1px solid rgba(239,235,227,0.07)" }}>
      <div>
        <div style={{ fontFamily: GEIST, fontSize: 14.5, fontWeight: 400, color: "#EFEBE3" }}>{name}</div>
        <div style={{ fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7E7A72", marginTop: 4 }}>{sub}</div>
      </div>
      <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 300, color: negative ? "#D9B27C" : "#EFEBE3", fontVariantNumeric: "tabular-nums lining-nums" }}>
        {negative ? "−" : ""}{money(Math.abs(amount))}
      </span>
    </div>
  );
}

export function AtlasAccounts({ accounts = [], liabilities = [], netWorth = 0 }: { accounts?: Account[]; liabilities?: Liability[]; netWorth?: number }) {
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
        <div style={{ position: "absolute", inset: 0, padding: "76px 30px 30px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <a href="/atlas/live" style={{ fontFamily: GEIST, fontSize: 13, fontWeight: 400, color: "#908C83", textDecoration: "none" }}>‹ Back</a>
            <span style={{ fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "#908C83" }}>Accounts</span>
          </div>
          <div style={{ marginTop: 24, fontFamily: SERIF, fontSize: 30, color: "#EFEBE3", letterSpacing: "0.01em" }}>What&rsquo;s connected.</div>

          <div style={{ marginTop: 22, flex: 1, overflowY: "auto" }}>
            <div style={{ fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.24em", textTransform: "uppercase", color: "#A8C3A6" }}>Assets</div>
            {accounts.length ? accounts.map((a, i) => (
              <Row key={`a${i}`} name={a.name} sub={TIER_LABEL[a.tier] ?? a.tier} amount={a.balance} />
            )) : <div style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 13, color: "#7E7A72", marginTop: 12 }}>No accounts connected.</div>}

            {liabilities.length > 0 && (
              <>
                <div style={{ marginTop: 26, fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.24em", textTransform: "uppercase", color: "#D9B27C" }}>Debts</div>
                {liabilities.map((l, i) => (
                  <Row key={`l${i}`} name={l.name} sub={`${(l.apr * 100).toFixed(1)}% apr · min ${money(l.minPayment)}`} amount={l.balance} negative />
                ))}
              </>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", borderTop: "1px solid rgba(239,235,227,0.14)", paddingTop: 18, marginTop: 8 }}>
            <span style={{ fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.24em", textTransform: "uppercase", color: "#908C83" }}>Net worth</span>
            <span style={{ fontFamily: MONO, fontWeight: 300, fontSize: 26, color: netWorth < 0 ? "#D9B27C" : "#EFEBE3", fontVariantNumeric: "tabular-nums lining-nums" }}>
              {netWorth < 0 ? "−" : ""}{money(Math.abs(netWorth))}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 11 }}>
            <a href="/atlas/manual" style={{ fontFamily: GEIST, fontWeight: 400, fontSize: 12, color: "#A8C3A6", letterSpacing: "0.01em", textDecoration: "none" }}>+ Add crypto, debt &amp; off-bank holdings ›</a>
            <PlaidConnect compact />
          </div>
        </div>
      </div>
    </div>
  );
}
