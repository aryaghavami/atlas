import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Public email capture for the free funnel (TikTok/YT -> landing -> email -> unlock).
// Stores the email in atlas_leads and sets a year-long cookie so returning visitors skip the gate.
export async function POST(req: Request) {
  try {
    const { email, source } = await req.json();
    const e = String(email || "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let isNew = true;
    if (url && key) {
      const sb = createClient(url, key, { auth: { persistSession: false } });
      const { data: existing } = await sb.from("atlas_leads").select("id").eq("email", e).maybeSingle();
      isNew = !existing;
      await sb.from("atlas_leads").upsert({ email: e, source: source || "site" }, { onConflict: "email" });
    }
    // Real-time phone notification on a genuinely new signup (fire-and-forget).
    const topic = process.env.ATLAS_NTFY_TOPIC;
    if (topic && isNew) {
      await fetch(`https://ntfy.sh/${topic}`, {
        method: "POST",
        headers: { Title: "New Atlas signup", Tags: "tada" },
        body: e,
      }).catch(() => {});
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set("atlas_lead", "1", { secure: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365, path: "/" });
    return res;
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
