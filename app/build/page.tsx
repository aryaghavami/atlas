// Self-serve "deploy your own" page. The free DIY path: build Atlas yourself by pasting these
// prompts into an AI coding agent. Your data, your cloud, your control.
export const dynamic = "force-static";

const GEIST = "'Geist', sans-serif";
const SERIF = "'Instrument Serif', serif";
const MONO = "'Geist Mono', monospace";

const STEPS = [
  { n: "1", title: "THE CONSTRAINT", what: "Three numbers, nothing else: net worth, your date, your runway. The constraint is the product.", prompt: "Scaffold a Next.js + TypeScript app called Datum. One screen: a centered dark phone-frame (warm anthracite, near-monochrome, Geist + Geist Mono + Instrument Serif). It shows NET WORTH (big mono number), TARGET DATE (giant serif year + month), and RUNWAY (months), using representative placeholder numbers. Status is the only colour — sage for on-track. No charts, no nav, no settings. Make it look like a $1000 instrument, not a default template." },
  { n: "2", title: "THE CONNECTION", what: "Connect your accounts through Plaid. Balances and liabilities flow in automatically.", prompt: "Add Plaid Link (read-only). A server route to create a link_token, a client button to open Link, a route to exchange the public_token. Store the access token server-side only, never in the browser or git. Pull balances + liabilities." },
  { n: "3", title: "THE HONEST MATH", what: "Every other app counts a 401k like cash. Discount every dollar by how fast you can actually touch it.", prompt: "Write the engine. Net worth must be LIQUIDITY-ADJUSTED: cash 100%, brokerage ~75%, retirement 0%. Runway = spendable assets / monthly burn. Months-to-target from monthly contribution + expected return. Pure, deterministic, unit-tested." },
  { n: "4", title: "THE FIVE HUNDRED FUTURES", what: "One retirement date is a lie. Run 500 simulations and report a range.", prompt: "Add a Monte Carlo: 500 return paths (higher volatility on the crypto sleeve), report the target date as a p10-p90 band plus the median. Show it as '80% odds · 2030 to 2034' under the target year." },
  { n: "5", title: "THE LIVE PRICES", what: "Add what Plaid cannot see: crypto, business debt, priced live, tap to edit.", prompt: "Add a manual-holdings screen for what Plaid can't reach (crypto, debt, off-bank assets). Coins/stocks are entered by quantity and priced LIVE from CoinGecko/Yahoo on every read. Cash/debt are fixed. Fold into net worth. Let me tap any entry to edit, and × to delete." },
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
        <a href="/" style={{ fontFamily: GEIST, fontSize: 13, color: "#908C83", textDecoration: "none" }}>‹ Datum</a>
        <div style={{ fontFamily: GEIST, fontSize: 11, fontWeight: 500, letterSpacing: "0.28em", textTransform: "uppercase", color: "#908C83", marginTop: 22 }}>Deploy your own · free</div>
        <h1 style={{ fontFamily: SERIF, fontSize: 42, lineHeight: 1.08, margin: "12px 0 0", letterSpacing: "-0.01em" }}>Build Datum yourself.<br /><span style={{ fontStyle: "italic", color: "#b8b3a8" }}>The full build, start to finish.</span></h1>
        <p style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 16, lineHeight: 1.6, color: "#b8b3a8", marginTop: 18 }}>
          You direct an AI, it writes the code. One focused evening, no prior coding. It runs on your own cloud, connected to your own accounts.
        </p>

        <div style={{ marginTop: 30, padding: "16px 18px", borderRadius: 13, border: "1px solid rgba(239,235,227,0.14)" }}>
          <div style={{ fontFamily: GEIST, fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#A8C3A6" }}>Before you start</div>
          <p style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 14.5, lineHeight: 1.6, color: "#cfcabf", margin: "8px 0 0" }}>
            Free accounts: an <b>AI coding agent</b> (Claude Code), <b>Plaid</b> (Sandbox is free; Production for real banks),
            <b> Supabase</b> (storage), and <b>Vercel</b> (hosting). Then paste each prompt below in order, verifying as you go.
          </p>
        </div>

        {STEPS.map((s) => (
          <div key={s.n} style={{ marginTop: 34 }}>
            <div style={{ fontFamily: MONO, fontSize: 12, color: "#908C83", letterSpacing: "0.1em" }}>STEP {s.n}</div>
            <div style={{ fontFamily: SERIF, fontSize: 25, color: "#EFEBE3", marginTop: 4 }}>{s.title}</div>
            <p style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 14.5, lineHeight: 1.6, color: "#b8b3a8", marginTop: 6 }}>{s.what}</p>
            <div style={{ fontFamily: GEIST, fontSize: 11, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7E7A72", marginTop: 10 }}>Paste this ↓ (tap to select all)</div>
            <Prompt text={s.prompt} />
          </div>
        ))}

        <div style={{ marginTop: 40, paddingTop: 26, borderTop: "1px solid rgba(239,235,227,0.12)" }}>
          <div style={{ fontFamily: SERIF, fontSize: 25, color: "#EFEBE3" }}>Ship it</div>
          <p style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 14.5, lineHeight: 1.6, color: "#b8b3a8", marginTop: 8 }}>
            Push to GitHub, import to Vercel, add your env vars (Plaid and Supabase). Move storage to a Supabase table so it runs on serverless and on your phone. Add a passcode, then open it in Safari and Add to Home Screen.
          </p>
          <Prompt text={'Migrate the file-based stores to a Supabase key-value table (RLS-locked to service_role), async, with a local file fallback. Add middleware that password-gates the real-data routes + APIs in production; keep a representative demo public. Hide the device-mockup chrome on mobile so it is edge-to-edge.'} />
        </div>

        <div style={{ marginTop: 40, padding: "20px 20px", borderRadius: 14, border: "1px solid rgba(217,178,124,0.25)", background: "rgba(217,178,124,0.05)" }}>
          <div style={{ fontFamily: SERIF, fontSize: 22, color: "#EFEBE3" }}>Run a business?</div>
          <p style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 14.5, lineHeight: 1.6, color: "#cfcabf", margin: "8px 0 14px" }}>
            Datum is free, always. If you run a company and want a custom AI agent built for it, I take a few of those.
          </p>
          <a href="https://www.youtube.com/@aryajoonam" style={{ display: "inline-block", fontFamily: GEIST, fontSize: 14, fontWeight: 500, color: "#0C0C0D", background: "#EFEBE3", borderRadius: 11, padding: "12px 18px", textDecoration: "none" }}>See how that works ›</a>
        </div>
      </div>
    </main>
  );
}
