"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatedNumber } from "./AnimatedNumber";
import { EYEBROW_STYLE, PageShell, PhoneFrame } from "./PhoneFrame";
import { computeBody, inputFromState, type EngineOutput } from "@/lib/engine";
import { monteCarloBands } from "@/lib/engineBands";
import { DEMO_STATE } from "@/lib/demo";
import { loadState } from "@/lib/store";
import { baseFromIso, weightDisplay } from "@/lib/format";
import { tapHaptic } from "@/lib/haptics";
import type { BodyState } from "@/lib/types";

const C = {
  bone: "#EFEBE3", ash: "#b8b3a8", muted: "#908C83", faint: "#6E6A63",
  gold: "#b9952f", goldSoft: "#D9B27C", goldDim: "#A8824E",
  sage: "#A8C3A6", sageDim: "#7E9579",
};
const GEIST = "'Geist', sans-serif";
const MONO = "'Geist Mono', monospace";
const SERIF = "'Instrument Serif', serif";

export function BodyScreen() {
  // Render the demo on the server and first client paint (deterministic → no hydration flash),
  // then swap to real saved state once mounted.
  const [state, setState] = useState<BodyState>(DEMO_STATE);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    const real = loadState();
    if (real) {
      setState(real);
      setIsDemo(false);
    }
  }, []);

  const latest = state.weighIns.length ? state.weighIns[state.weighIns.length - 1] : null;
  const units = state.profile.units ?? "imperial";

  let out: EngineOutput | null = null;
  let bandLabel = "";
  if (latest) {
    const input = inputFromState(state.profile, latest, baseFromIso(latest.date));
    out = computeBody(input);
    bandLabel = monteCarloBands(input).label;
  }

  const mode: "connect" | "off" | "on" = !out ? "connect" : out.notOnTrack ? "off" : "on";

  return (
    <PageShell>
      <PhoneFrame>
        <div style={EYEBROW_STYLE}>Atlas · Body</div>

        {mode === "connect" && <ConnectHero />}
        {mode === "off" && out && <OffHero out={out} />}
        {mode === "on" && out && <OnHero out={out} bandLabel={bandLabel} />}

        {mode === "connect" ? (
          <ConnectFooter />
        ) : (
          out && <StatsFooter out={out} units={units} isDemo={isDemo} />
        )}
      </PhoneFrame>
    </PageShell>
  );
}

/* ----------------------------- heroes ----------------------------- */

function HeroLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.28em", textTransform: "uppercase", color: C.muted }}>
      {children}
    </div>
  );
}

function OnHero({ out, bandLabel }: { out: EngineOutput; bandLabel: string }) {
  const slipping = out.leanStatus === "at-risk";
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <HeroLabel>Target date</HeroLabel>
      <div
        key={`${out.targetYear}-${out.targetMonth}`}
        className="focus-in tnum"
        style={{ fontFamily: SERIF, fontSize: 108, lineHeight: 0.9, color: C.bone, letterSpacing: "-0.02em", marginTop: 18 }}
      >
        {out.targetYear}
      </div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 30, color: C.ash, marginTop: 4 }}>{out.targetMonth}</div>
      <div
        className="shimmer"
        style={{ fontFamily: MONO, fontSize: 12, fontWeight: 300, letterSpacing: "0.04em", color: slipping ? C.goldSoft : C.gold, marginTop: 20 }}
      >
        {slipping ? "date slipping · muscle loss" : bandLabel}
      </div>
    </div>
  );
}

function OffHero({ out }: { out: EngineOutput }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <HeroLabel>Target date</HeroLabel>
      <div
        className="focus-in"
        style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 42, lineHeight: 1.08, color: C.goldSoft, letterSpacing: "-0.01em", marginTop: 24, maxWidth: 250, textWrap: "balance" } as React.CSSProperties}
      >
        Not before {out.targetYear} at this rate.
      </div>
      <div style={{ fontFamily: GEIST, fontSize: 13, fontWeight: 300, lineHeight: 1.55, color: C.muted, marginTop: 22, maxWidth: 236, textWrap: "pretty" } as React.CSSProperties}>
        {out.notOnTrackReason}
      </div>
    </div>
  );
}

function ConnectHero() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <HeroLabel>Target date</HeroLabel>
      <div className="focus-in" style={{ fontFamily: SERIF, fontSize: 108, lineHeight: 0.9, color: "#2c2c30", letterSpacing: "-0.02em", marginTop: 18 }}>
        ————
      </div>
      <div style={{ fontFamily: GEIST, fontSize: 13, fontWeight: 300, lineHeight: 1.55, color: C.muted, marginTop: 18, maxWidth: 228, textWrap: "pretty" } as React.CSSProperties}>
        No data yet. One weigh-in sets the baseline. The date appears after the second.
      </div>
    </div>
  );
}

/* ----------------------------- footers ----------------------------- */

function StatsFooter({ out, units, isDemo }: { out: EngineOutput; units: "imperial" | "metric"; isDemo: boolean }) {
  const atRisk = out.leanStatus === "at-risk";
  const lean = weightDisplay(out.leanMassLb, units);
  return (
    <div>
      <div className="stagger" style={{ display: "flex", borderTop: `1px solid ${C.bone}1a` }}>
        {/* body fat */}
        <div style={{ flex: 1, padding: "24px 4px 4px" }}>
          <StatLabel>Body fat</StatLabel>
          <div style={{ fontFamily: MONO, fontWeight: 300, fontSize: 40, lineHeight: 1, color: C.bone, marginTop: 13, letterSpacing: "-0.012em" }}>
            <AnimatedNumber value={out.bodyFatPct} decimals={1} />
            <span style={{ fontSize: "0.5em", color: C.muted }}>%</span>
          </div>
        </div>

        <div style={{ width: 1, background: `${C.bone}1a` }} />

        {/* lean mass */}
        <div style={{ flex: 1, padding: "24px 4px 4px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <StatLabel>Lean mass</StatLabel>
            <span
              style={{
                fontFamily: GEIST, fontSize: 8.5, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase",
                color: atRisk ? C.goldSoft : C.sage,
                border: `1px solid ${atRisk ? "rgba(217,178,124,0.45)" : "rgba(168,195,166,0.4)"}`,
                borderRadius: 999, padding: "2px 7px",
              }}
            >
              {atRisk ? "At risk" : "Holding"}
            </span>
          </div>
          <div style={{ fontFamily: MONO, fontWeight: 300, fontSize: 40, lineHeight: 1, color: atRisk ? C.goldSoft : C.sage, marginTop: 13, letterSpacing: "-0.012em" }}>
            <AnimatedNumber value={lean.value} />
            <span style={{ fontSize: "0.42em", color: atRisk ? C.goldDim : C.sageDim, marginLeft: 4, letterSpacing: "0.04em" }}>{lean.unit}</span>
          </div>
          {atRisk && out.leanCaption && (
            <div style={{ fontFamily: GEIST, fontSize: 10.5, fontWeight: 300, letterSpacing: "0.02em", color: C.goldDim, marginTop: 9 }}>
              {out.leanCaption}
            </div>
          )}
        </div>
      </div>

      {/* whisper-quiet navigation — keeps the screen pure but reachable */}
      <MicroNav isDemo={isDemo} />
    </div>
  );
}

function StatLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: C.muted }}>
      {children}
    </div>
  );
}

function MicroNav({ isDemo }: { isDemo: boolean }) {
  const link: React.CSSProperties = { color: C.gold, textDecoration: "none" };
  return (
    <div style={{ textAlign: "center", marginTop: 18, fontFamily: GEIST, fontSize: 11, fontWeight: 300, color: C.faint }}>
      {isDemo ? (
        <span>
          Demo numbers ·{" "}
          <Link href="/body/start" style={link} onClick={() => tapHaptic()}>
            Set up yours →
          </Link>
        </span>
      ) : (
        <span>
          <Link href="/body/log" style={link} onClick={() => tapHaptic()}>
            Log weigh-in
          </Link>
          <span style={{ color: "#3a382f", margin: "0 9px" }}>·</span>
          <Link href="/body/target" style={link} onClick={() => tapHaptic()}>
            Target
          </Link>
        </span>
      )}
    </div>
  );
}

function ConnectFooter() {
  return (
    <div>
      <Link
        href="/body/start"
        onClick={() => tapHaptic()}
        className="press"
        style={{
          height: 56, borderRadius: 14, background: C.bone, display: "flex", alignItems: "center", justifyContent: "center",
          gap: 8, fontFamily: GEIST, fontSize: 15, fontWeight: 500, color: "#08080a", letterSpacing: "0.01em", textDecoration: "none",
        }}
      >
        Connect a scale or log a weigh-in <span style={{ fontSize: 18, lineHeight: 0 }}>→</span>
      </Link>
      <div style={{ textAlign: "center", fontFamily: GEIST, fontSize: 11, fontWeight: 300, color: C.faint, marginTop: 14 }}>
        No streaks. No reminders. Open it when you weigh in.
      </div>
    </div>
  );
}
