import { createClient } from "@supabase/supabase-js";

// Owner-only dashboard (gated by the password cookie in middleware). Signups + recent list.
export const dynamic = "force-dynamic";

const GEIST = "'Geist', sans-serif";
const SERIF = "'Instrument Serif', serif";
const MONO = "'Geist Mono', monospace";

type Lead = { email: string; created_at: string; source: string | null };

async function getData() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { total: 0, last7: 0, today: 0, recent: [] as Lead[] };
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const since7 = new Date(Date.now() - 7 * 864e5).toISOString();
  const since1 = new Date(Date.now() - 1 * 864e5).toISOString();
  const [{ count: total }, { count: last7 }, { count: today }, { data: recent }] = await Promise.all([
    sb.from("atlas_leads").select("*", { count: "exact", head: true }),
    sb.from("atlas_leads").select("*", { count: "exact", head: true }).gte("created_at", since7),
    sb.from("atlas_leads").select("*", { count: "exact", head: true }).gte("created_at", since1),
    sb.from("atlas_leads").select("email, created_at, source").order("created_at", { ascending: false }).limit(100),
  ]);
  return { total: total ?? 0, last7: last7 ?? 0, today: today ?? 0, recent: (recent ?? []) as Lead[] };
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: "rgba(239,235,227,0.04)", border: "1px solid rgba(239,235,227,0.1)", borderRadius: 14, padding: "18px 20px", flex: 1, minWidth: 140 }}>
      <div style={{ fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#908C83" }}>{label}</div>
      <div style={{ fontFamily: MONO, fontWeight: 300, fontSize: 38, color: "#EFEBE3", marginTop: 8, fontVariantNumeric: "tabular-nums" }}>{value.toLocaleString("en-US")}</div>
    </div>
  );
}

export default async function Admin() {
  const { total, last7, today, recent } = await getData();
  const fmt = (s: string) => new Date(s).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  return (
    <main style={{ minHeight: "100dvh", background: "#08080a", color: "#EFEBE3", padding: "48px 22px 80px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: GEIST, fontSize: 11, fontWeight: 500, letterSpacing: "0.26em", textTransform: "uppercase", color: "#b9952f" }}>Atlas · Admin</div>
        <h1 style={{ fontFamily: SERIF, fontSize: 36, margin: "10px 0 0" }}>Signups</h1>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
          <Stat label="Total" value={total} />
          <Stat label="Last 7 days" value={last7} />
          <Stat label="Today" value={today} />
        </div>

        <div style={{ fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "#908C83", margin: "34px 0 6px" }}>Recent</div>
        {recent.length === 0 ? (
          <div style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 14, color: "#7E7A72", marginTop: 12 }}>No signups yet. Share the link.</div>
        ) : (
          <div>
            {recent.map((l, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", borderBottom: "1px solid rgba(239,235,227,0.07)" }}>
                <span style={{ fontFamily: GEIST, fontSize: 14.5, color: "#EFEBE3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.email}</span>
                <span style={{ fontFamily: MONO, fontSize: 12, color: "#7E7A72", whiteSpace: "nowrap", marginLeft: 14 }}>{fmt(l.created_at)}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ fontFamily: GEIST, fontWeight: 300, fontSize: 12, color: "#615E58", marginTop: 28 }}>
          Usage analytics (visits, demo opens) can be turned on with Vercel Web Analytics. Ask to enable.
        </div>
      </div>
    </main>
  );
}
