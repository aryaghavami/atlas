"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PageShell, PhoneFrame } from "./PhoneFrame";
import { onbColors as C } from "./ui";
import { tapHaptic } from "@/lib/haptics";

const GEIST = "'Geist', sans-serif";
const SERIF = "'Instrument Serif', serif";

const NOTES: Record<string, string> = {
  unconfigured: "Scale sync isn't set up on this deployment yet — log manually for now.",
  denied: "Connection cancelled. You can log manually anytime.",
  error: "Couldn't reach Withings. Try again, or log manually.",
};

function ConnectInner() {
  const params = useSearchParams();
  const note = NOTES[params.get("withings") ?? ""];

  return (
    <PageShell>
      <PhoneFrame contentStyle={{ padding: "60px 30px 34px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 26 }}>
          <Link href="/body" onClick={() => tapHaptic()} style={{ fontFamily: GEIST, fontSize: 13, color: C.muted, textDecoration: "none" }}>‹ Back</Link>
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 30, lineHeight: 1.05, color: C.bone, margin: "0 0 10px" }}>Where do the numbers come from?</h2>
          <p style={{ fontFamily: GEIST, fontSize: 13.5, fontWeight: 300, lineHeight: 1.5, color: C.muted, margin: "0 0 28px" }}>
            Sync a smart scale, or log by hand. Either way it stays yours.
          </p>

          {note && (
            <div style={{ marginBottom: 18, padding: "12px 14px", borderRadius: 12, border: `1px solid rgba(217,178,124,0.35)`, background: "rgba(217,178,124,0.06)", fontFamily: GEIST, fontSize: 12.5, fontWeight: 300, color: C.goldSoft }}>
              {note}
            </div>
          )}

          <a href="/api/withings/start" onClick={() => tapHaptic()} className="press" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 18px", borderRadius: 14, border: `1px solid ${C.border}`, textDecoration: "none", marginBottom: 12 }}>
            <span>
              <span style={{ display: "block", fontFamily: GEIST, fontSize: 15, color: C.bone }}>Connect Withings</span>
              <span style={{ display: "block", fontFamily: GEIST, fontSize: 12, fontWeight: 300, color: C.faint, marginTop: 3 }}>Auto-sync weight & body fat · read-only</span>
            </span>
            <span style={{ fontFamily: GEIST, fontSize: 18, color: C.muted }}>→</span>
          </a>

          <Link href="/body/log" onClick={() => tapHaptic()} className="press" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 18px", borderRadius: 14, border: `1px solid ${C.border}`, textDecoration: "none" }}>
            <span>
              <span style={{ display: "block", fontFamily: GEIST, fontSize: 15, color: C.bone }}>Log it manually</span>
              <span style={{ display: "block", fontFamily: GEIST, fontSize: 12, fontWeight: 300, color: C.faint, marginTop: 3 }}>A scale and a tape are all you need</span>
            </span>
            <span style={{ fontFamily: GEIST, fontSize: 18, color: C.muted }}>→</span>
          </Link>
        </div>

        <div style={{ textAlign: "center", fontFamily: GEIST, fontSize: 11, fontWeight: 300, color: C.faint }}>
          Read-only. We can see, never change a thing on your scale.
        </div>
      </PhoneFrame>
    </PageShell>
  );
}

export function BodyConnect() {
  return (
    <Suspense fallback={null}>
      <ConnectInner />
    </Suspense>
  );
}
