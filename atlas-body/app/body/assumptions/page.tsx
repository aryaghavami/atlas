// The honest-math page. What the engine assumes and why — stated plainly. No charts.
export const dynamic = "force-static";

const GEIST = "'Geist', sans-serif";
const SERIF = "'Instrument Serif', serif";
const MONO = "'Geist Mono', monospace";

const RULES: { k: string; v: string }[] = [
  { k: "Fat loss", v: "A sustainable cut runs ~0.5–1% of bodyweight per week. Gentle (0.3%) holds muscle best; aggressive (0.8%+) is faster but starts costing you muscle." },
  { k: "Muscle gain", v: "Decays hard with training age: ~1%/month of bodyweight in year one, ~0.5% in year two, a quarter-percent in year three, then fractions. No app can sell you past this." },
  { k: "The FFMI ceiling", v: "A natural lifter tops out near a fat-free mass index of 25. We treat that as a hard cap — the body's version of an honest constraint." },
  { k: "Muscle at risk", v: "Too steep a deficit, low protein, or no lifting and part of every pound lost is muscle. When that share crosses 10%, your lean number turns amber." },
  { k: "The 500 futures", v: "One date is a lie. We vary your adherence — the weeks you actually hit the deficit — across 500 runs and report a p10–p90 range plus the odds you arrive at all." },
  { k: "Recomp", v: "Gaining muscle while losing fat is only realistic for newer lifters in a modest deficit. Otherwise the honest path is cut first, then build." },
];

export default function AssumptionsPage() {
  return (
    <main style={{ minHeight: "100dvh", background: "radial-gradient(120% 70% at 50% -10%, rgba(212,175,55,0.06) 0%, rgba(0,0,0,0) 45%), #08080a", color: "#EFEBE3", padding: "56px 22px 96px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <a href="/body" style={{ fontFamily: GEIST, fontSize: 13, color: "#908C83", textDecoration: "none" }}>‹ Atlas · Body</a>
        <div style={{ fontFamily: GEIST, fontSize: 11, fontWeight: 500, letterSpacing: "0.28em", textTransform: "uppercase", color: "#b9952f", marginTop: 22 }}>The honest math</div>
        <h1 style={{ fontFamily: SERIF, fontSize: 42, lineHeight: 1.08, margin: "12px 0 0", letterSpacing: "-0.01em" }}>
          Honest before encouraging.
        </h1>
        <p style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 16, lineHeight: 1.6, color: "#b8b3a8", marginTop: 18 }}>
          Every other app promises twelve weeks. The truth is a range, usually measured in months or
          years. Here is exactly what the engine assumes — so you can trust the date.
        </p>

        <div style={{ marginTop: 34 }}>
          {RULES.map((r) => (
            <div key={r.k} style={{ padding: "20px 0", borderTop: "1px solid rgba(239,235,227,0.12)" }}>
              <div style={{ fontFamily: MONO, fontSize: 12.5, color: "#b9952f", letterSpacing: "0.04em" }}>{r.k}</div>
              <p style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 14.5, lineHeight: 1.6, color: "#cfcabf", margin: "8px 0 0" }}>{r.v}</p>
            </div>
          ))}
        </div>

        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, lineHeight: 1.5, color: "#b8b3a8", marginTop: 36 }}>
          “The date is usually months or years out. That honesty is the whole point.”
        </p>
      </div>
    </main>
  );
}
