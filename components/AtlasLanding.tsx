"use client";
import { useEffect, useState } from "react";

// Free funnel landing: TikTok/YT -> here. Lead with the wow, capture email, then unlock the
// free app (instant demo) + the "make it yours" path (deploy your own — your data, your control).
const GEIST = "'Geist', sans-serif";
const SERIF = "'Instrument Serif', serif";

const YT = "https://www.youtube.com/@aryajoonam";

export function AtlasLanding() {
  const [email, setEmail] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (typeof document !== "undefined" && document.cookie.includes("atlas_lead=1")) setUnlocked(true);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { setErr("Enter a valid email."); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/lead", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, source: "landing" }) });
      if (!r.ok) throw new Error();
      setUnlocked(true);
    } catch { setErr("Something went wrong. Try again."); }
    setBusy(false);
  };

  const btn = { display: "block", textAlign: "center" as const, textDecoration: "none", borderRadius: 13, padding: "15px 18px", fontFamily: GEIST, fontSize: 15, fontWeight: 500, letterSpacing: "0.01em" };

  return (
    <main style={{ minHeight: "100dvh", background: "radial-gradient(120% 80% at 50% -10%, rgba(212,175,55,0.08) 0%, rgba(0,0,0,0) 45%), #08080a", color: "#EFEBE3", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 22px", textAlign: "center" }}>
      <div style={{ maxWidth: 560, width: "100%" }}>
        <div style={{ fontFamily: GEIST, fontSize: 11, fontWeight: 500, letterSpacing: "0.28em", textTransform: "uppercase", color: "#908C83" }}>Datum · Personal finance</div>
        <h1 style={{ fontFamily: SERIF, fontSize: 46, lineHeight: 1.05, margin: "18px 0 0", letterSpacing: "-0.01em" }}>See the exact day<br />you become a <span style={{ fontStyle: "italic" }}>millionaire.</span></h1>
        <p style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 16, lineHeight: 1.55, color: "#b8b3a8", margin: "18px auto 0", maxWidth: 460 }}>
          See your net worth, your runway, and the exact day you hit your number. Connect your accounts and watch the date move. Free.
        </p>

        {!unlocked ? (
          <form onSubmit={submit} style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 10 }}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" inputMode="email" placeholder="you@email.com"
              style={{ fontFamily: GEIST, fontSize: 16, color: "#EFEBE3", background: "rgba(239,235,227,0.06)", border: "1px solid rgba(239,235,227,0.16)", borderRadius: 13, padding: "15px 16px", outline: "none", width: "100%", boxSizing: "border-box", textAlign: "center" }} />
            <button type="submit" disabled={busy} style={{ ...btn, background: "#EFEBE3", color: "#0C0C0D", border: "none", cursor: "pointer" }}>{busy ? "…" : "Use it free →"}</button>
            {err && <div style={{ fontFamily: GEIST, fontSize: 13, color: "#D9B27C" }}>{err}</div>}
            <div style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 12, color: "#7E7A72", marginTop: 2 }}>One email and you&rsquo;re in.</div>
          </form>
        ) : (
          <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 11 }}>
            <a href="/atlas/start" style={{ ...btn, background: "#EFEBE3", color: "#0C0C0D" }}>Open Datum now ›</a>
            <a href="/build" style={{ ...btn, background: "transparent", color: "#EFEBE3", border: "1px solid rgba(239,235,227,0.18)" }}>Deploy your own ›</a>
            <a href={YT} style={{ ...btn, background: "transparent", color: "#A8C3A6", border: "1px solid rgba(168,195,166,0.25)" }}>Watch me build it ›</a>
            <div style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 12, color: "#7E7A72", marginTop: 4 }}>You&rsquo;re in. The demo runs on sample data. Deploy your own to use your real accounts.</div>
          </div>
        )}
      </div>
    </main>
  );
}
