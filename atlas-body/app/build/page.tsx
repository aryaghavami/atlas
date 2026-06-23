// Self-serve "deploy your own" page — the free DIY path. Build Atlas · Body yourself by pasting
// these prompts into an AI coding agent. Your data, your cloud, your control.
export const dynamic = "force-static";

const GEIST = "'Geist', sans-serif";
const SERIF = "'Instrument Serif', serif";
const MONO = "'Geist Mono', monospace";

const STEPS = [
  {
    n: "1",
    title: "THE CONSTRAINT",
    what: "Three numbers, nothing else: your target date, body fat, lean mass. The constraint is the product.",
    prompt:
      "Scaffold a Next.js + TypeScript app called Atlas · Body. One screen: a centered dark phone-frame (black, gold accents, Geist + Instrument Serif). It shows a giant serif TARGET DATE (year + month), and two stats — BODY FAT (%) and LEAN MASS (lb) with a sage 'Holding' pill — using representative placeholder numbers. No charts, no nav, no settings. Make it look like a $1000 product.",
  },
  {
    n: "2",
    title: "THE HONEST MATH",
    what: "Every fitness app promises 12 weeks. Project the real date from real rates.",
    prompt:
      "Write the engine. Decompose weight into fat + lean mass. Project a cut month-by-month at a sustainable deficit (0.5–1% bodyweight/week). Muscle gain decays with training age; cap lean mass at a natural FFMI of 25. If the deficit is too steep or protein/lifting is missing, take a share of the loss from muscle and flag it. Output the month the target body fat is reached. Pure, deterministic, unit-tested.",
  },
  {
    n: "3",
    title: "THE FIVE HUNDRED FUTURES",
    what: "One date is a lie. Vary adherence and report a range.",
    prompt:
      "Add a Monte Carlo: 500 runs varying adherence (the weeks you actually hit the deficit) around the user's estimate. Report the target date as a p10–p90 band plus the odds of reaching it: '80% odds · 2027 to 2028' under the year.",
  },
  {
    n: "4",
    title: "THE PROTECTED NUMBER",
    what: "The honest fear in any cut is losing muscle. Surface it.",
    prompt:
      "Make lean mass the protected number. Simulate its trajectory through the cut; when more than ~10% of weight lost is muscle, turn it amber with a one-line cause ('deficit too steep · protein low') and a 'date slipping · muscle loss' note. Add a 'not on track' state when the deficit is too small to move the date.",
  },
  {
    n: "5",
    title: "THE LIVE LOG",
    what: "Add a weigh-in, watch the date move. Connect a scale later.",
    prompt:
      "Add a manual weigh-in screen (weight + body fat) that re-projects the date live as you type, showing the before→after delta ('1 month earlier'). Persist on-device first. Then add Withings OAuth (read-only) to sync weight/body-fat/HR from a smart scale, tokens stored server-side only.",
  },
];

function Prompt({ text }: { text: string }) {
  return (
    <pre style={{ fontFamily: MONO, fontSize: 12.5, lineHeight: 1.55, color: "#cfe0cb", background: "rgba(168,195,166,0.07)", border: "1px solid rgba(168,195,166,0.2)", borderRadius: 12, padding: "14px 16px", margin: "12px 0 0", whiteSpace: "pre-wrap", wordBreak: "break-word", userSelect: "all" }}>{text}</pre>
  );
}

export default function BuildPage() {
  return (
    <main style={{ minHeight: "100dvh", background: "radial-gradient(120% 70% at 50% -10%, rgba(212,175,55,0.07) 0%, rgba(0,0,0,0) 45%), #08080a", color: "#EFEBE3", padding: "56px 22px 96px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <a href="/" style={{ fontFamily: GEIST, fontSize: 13, color: "#908C83", textDecoration: "none" }}>‹ Atlas · Body</a>
        <div style={{ fontFamily: GEIST, fontSize: 11, fontWeight: 500, letterSpacing: "0.28em", textTransform: "uppercase", color: "#b9952f", marginTop: 22 }}>Deploy your own · free</div>
        <h1 style={{ fontFamily: SERIF, fontSize: 42, lineHeight: 1.08, margin: "12px 0 0", letterSpacing: "-0.01em" }}>
          Build Atlas · Body yourself.<br /><span style={{ fontStyle: "italic", color: "#b8b3a8" }}>The full build, start to finish.</span>
        </h1>
        <p style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 16, lineHeight: 1.6, color: "#b8b3a8", marginTop: 18 }}>
          You direct an AI, it writes the code. One focused evening, no prior coding. It runs on your
          own cloud — your weigh-ins never leave your control.
        </p>

        <div style={{ marginTop: 30, padding: "16px 18px", borderRadius: 13, border: "1px solid rgba(239,235,227,0.14)" }}>
          <div style={{ fontFamily: GEIST, fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#A8C3A6" }}>Before you start</div>
          <p style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 14.5, lineHeight: 1.6, color: "#cfcabf", margin: "8px 0 0" }}>
            Free accounts: an <b>AI coding agent</b> (Claude Code), optionally <b>Withings</b> (scale sync),
            <b> Supabase</b> (storage), and <b>Vercel</b> (hosting). Paste each prompt below in order, verifying as you go.
          </p>
        </div>

        {STEPS.map((s) => (
          <div key={s.n} style={{ marginTop: 34 }}>
            <div style={{ fontFamily: MONO, fontSize: 12, color: "#b9952f", letterSpacing: "0.1em" }}>STEP {s.n}</div>
            <div style={{ fontFamily: SERIF, fontSize: 25, color: "#EFEBE3", marginTop: 4 }}>{s.title}</div>
            <p style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 14.5, lineHeight: 1.6, color: "#b8b3a8", marginTop: 6 }}>{s.what}</p>
            <div style={{ fontFamily: GEIST, fontSize: 11, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7E7A72", marginTop: 10 }}>Paste this ↓ (tap to select all)</div>
            <Prompt text={s.prompt} />
          </div>
        ))}

        <div style={{ marginTop: 40, paddingTop: 26, borderTop: "1px solid rgba(239,235,227,0.12)" }}>
          <div style={{ fontFamily: SERIF, fontSize: 25, color: "#EFEBE3" }}>Ship it</div>
          <p style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 14.5, lineHeight: 1.6, color: "#b8b3a8", marginTop: 8 }}>
            Push to GitHub, import to Vercel, add your env vars. Move storage to a Supabase table so it
            runs on serverless and on your phone. Add a passcode, then open it in Safari and Add to Home Screen.
          </p>
          <Prompt text={"Migrate the local store to a Supabase key-value table (RLS-locked to service_role), with a local file fallback. Add middleware that password-gates the real-data routes in production; keep a representative demo public. Add a PWA manifest so it installs to the home screen."} />
        </div>
      </div>
    </main>
  );
}
