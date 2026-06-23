"use client";
import { useEffect, useState } from "react";
import { AtlasAccounts } from "@/components/AtlasAccounts";

export const dynamic = "force-dynamic";

type Snap = {
  input: { accounts: { name: string; balance: number; tier: string }[]; liabilities: { name: string; balance: number; apr: number; minPayment: number }[] };
  out: { netWorth: number };
};

// The breakdown behind net worth - every connected account + debt, from the cached snapshot.
export default function Page() {
  const [snap, setSnap] = useState<Snap | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "none">("loading");

  useEffect(() => {
    fetch("/api/atlas/current")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((s: Snap) => { setSnap(s); setState("ready"); })
      .catch(() => setState("none"));
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0b", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      {state === "ready" && snap ? (
        <AtlasAccounts accounts={snap.input.accounts} liabilities={snap.input.liabilities} netWorth={snap.out.netWorth} />
      ) : (
        <div style={{ width: 390, height: 844, borderRadius: 56, background: "#0C0C0D", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 40, color: "#9A968D", fontFamily: "'Geist', sans-serif", fontSize: 14, lineHeight: 1.6 }}>
          {state === "loading" ? "Loading your accounts" : "Connect your accounts first. Go to /atlas/live."}
        </div>
      )}
    </main>
  );
}
