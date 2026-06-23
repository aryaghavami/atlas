// Atlas — the umbrella. One screen: the suite of instruments, each linking to its module.
// Module URLs live here; point them at your custom domains once they're attached in Vercel.
export const dynamic = "force-static";

const GEIST = "'Geist', sans-serif";
const SERIF = "'Instrument Serif', serif";
const MONO = "'Geist Mono', monospace";
const YT = "https://www.youtube.com/@aryajoonam";

const C = {
  bone: "#EFEBE3", ash: "#b8b3a8", muted: "#908C83", faint: "#6E6A63",
  sage: "#A8C3A6", line: "rgba(239,235,227,0.12)",
};

type Module = {
  eyebrow: string;
  name: string;
  promise: string;
  figures: string[];
  href?: string;
  live: boolean;
};

const MODULES: Module[] = [
  {
    eyebrow: "Module one",
    name: "Atlas · Money",
    promise: "The exact day you hit your number.",
    figures: ["Net worth", "Runway", "Target date"],
    href: "https://atlas-money.aryajoonam.com",
    live: true,
  },
  {
    eyebrow: "Module two",
    name: "Atlas · Body",
    promise: "The honest date you reach your target physique.",
    figures: ["Body fat", "Lean mass", "Target date"],
    href: "https://atlas-body.aryajoonam.com",
    live: true,
  },
  {
    eyebrow: "Module three",
    name: "Atlas · Mind",
    promise: "Coming next.",
    figures: ["—", "—", "—"],
    live: false,
  },
];

function ModuleCard({ m }: { m: Module }) {
  const inner = (
    <>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span style={{ fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.24em", textTransform: "uppercase", color: C.muted }}>{m.eyebrow}</span>
        {m.live ? (
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.sage, boxShadow: `0 0 11px ${C.sage}99` }} />
            <span style={{ fontFamily: GEIST, fontSize: 9.5, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: C.sage }}>Live</span>
          </span>
        ) : (
          <span style={{ fontFamily: GEIST, fontSize: 9.5, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: C.faint }}>Soon</span>
        )}
      </div>

      <div style={{ fontFamily: SERIF, fontSize: 32, lineHeight: 1.04, color: m.live ? C.bone : "#5a574f", marginTop: 16, letterSpacing: "-0.01em" }}>{m.name}</div>
      <div style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 14.5, lineHeight: 1.5, color: m.live ? C.ash : C.faint, marginTop: 10 }}>{m.promise}</div>

      <div style={{ display: "flex", gap: 18, marginTop: 22, flexWrap: "wrap" }}>
        {m.figures.map((f, i) => (
          <span key={i} style={{ fontFamily: MONO, fontSize: 11, fontWeight: 300, letterSpacing: "0.03em", color: m.live ? C.muted : "#4a473f" }}>{f}</span>
        ))}
      </div>

      {m.live && (
        <div style={{ marginTop: 22, fontFamily: GEIST, fontSize: 13, fontWeight: 400, color: C.sage }}>
          Open ›
        </div>
      )}
    </>
  );

  const style: React.CSSProperties = {
    display: "block", textDecoration: "none", color: "inherit",
    padding: "26px 26px 24px", borderRadius: 18,
    border: `1px solid ${C.line}`, background: "rgba(239,235,227,0.012)",
    cursor: m.live ? "pointer" : "default",
  };

  return m.live && m.href ? (
    <a className="card" href={m.href} style={style}>{inner}</a>
  ) : (
    <div style={style}>{inner}</div>
  );
}

export default function AtlasHome() {
  return (
    <main
      style={{
        minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "64px 22px", textAlign: "left",
        background: "radial-gradient(120% 70% at 50% -10%, rgba(168,195,166,0.05) 0%, rgba(0,0,0,0) 45%), #050506",
      }}
    >
      <div className="stagger" style={{ maxWidth: 600, width: "100%" }}>
        <div style={{ fontFamily: GEIST, fontSize: 11, fontWeight: 500, letterSpacing: "0.32em", textTransform: "uppercase", color: C.muted, textAlign: "center" }}>Atlas</div>
        <h1 style={{ fontFamily: SERIF, fontSize: 44, lineHeight: 1.06, color: C.bone, margin: "16px 0 0", letterSpacing: "-0.015em", textAlign: "center" }}>
          One honest instrument<br />for each part of your life.
        </h1>
        <p style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 16, lineHeight: 1.55, color: C.ash, margin: "18px auto 0", maxWidth: 460, textAlign: "center" }}>
          Each module shows the three numbers that run a domain of your life — and the date they&rsquo;re
          taking you to. No charts. No noise. The constraint is the product.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 40 }}>
          {MODULES.map((m) => <ModuleCard key={m.name} m={m} />)}
        </div>

        <div style={{ textAlign: "center", marginTop: 36 }}>
          <a href={YT} style={{ fontFamily: GEIST, fontSize: 13, fontWeight: 300, color: C.muted, textDecoration: "none" }}>Built in public by Arya ›</a>
        </div>
      </div>
    </main>
  );
}
