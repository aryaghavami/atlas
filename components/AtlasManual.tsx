// Atlas manual holdings editor. Add assets and debts Plaid cannot reach. Coins and
// stocks are searched live (market-cap ranked) and held by quantity, priced from the
// market on every read. Cash, retirement, and debt are fixed amounts. Saved, then
// folded into net worth on sync.
"use client";
import { useEffect, useRef, useState } from "react";
import type { Account, Liability, Tier } from "@/lib/engine";

const GEIST = "'Geist', sans-serif";
const MONO = "'Geist Mono', monospace";
const SERIF = "'Instrument Serif', serif";

const KINDS = [
  { key: "market", label: "Coin / Stock" },
  { key: "liquid", label: "Cash" },
  { key: "near", label: "Investments" },
  { key: "illiquid", label: "Retirement" },
  { key: "debt", label: "Debt" },
] as const;
type Kind = (typeof KINDS)[number]["key"];
type Hit = { symbol: string; name: string; asset: "crypto" | "stock"; rank: number | null };
type Prices = { crypto: Record<string, number>; stocks: Record<string, number> };

const money = (n: number) => `$${Math.round(Math.abs(n)).toLocaleString("en-US")}`;
const onlyNum = (s: string) => s.replace(/[^\d.]/g, "");

export function AtlasManual() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [prices, setPrices] = useState<Prices>({ crypto: {}, stocks: {} });
  const [kind, setKind] = useState<Kind>("market");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Hit[]>([]);
  const [picked, setPicked] = useState<Hit | null>(null);
  const [qty, setQty] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [apr, setApr] = useState("");
  const [min, setMin] = useState("");
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/atlas/manual").then((r) => r.json()).then((m) => {
      setAccounts(m.accounts ?? []);
      setLiabilities(m.liabilities ?? []);
    }).catch(() => {});
  }, []);

  // Live prices for held coins + stocks, refreshed when the list changes.
  useEffect(() => {
    const cs = accounts.filter((a) => a.symbol && (a.asset ?? "crypto") === "crypto").map((a) => a.symbol as string);
    const ss = accounts.filter((a) => a.symbol && a.asset === "stock").map((a) => a.symbol as string);
    if (!cs.length && !ss.length) return;
    fetch(`/api/atlas/price?crypto=${cs.join(",")}&stocks=${ss.join(",")}`).then((r) => r.json()).then(setPrices).catch(() => {});
  }, [accounts]);

  // Debounced search.
  const onQuery = (q: string) => {
    setQuery(q);
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 1) { setResults([]); return; }
    timer.current = setTimeout(() => {
      fetch(`/api/atlas/search?q=${encodeURIComponent(q.trim())}`).then((r) => r.json()).then(setResults).catch(() => setResults([]));
    }, 220);
  };

  const isMarket = kind === "market";
  const isDebt = kind === "debt";
  const canAdd = isMarket ? (picked != null && Number(qty) > 0) : (name.trim() !== "" && Number(amount) > 0);

  const add = () => {
    if (!canAdd) return;
    if (isMarket && picked) {
      const tier: Tier = picked.asset === "crypto" ? "volatile" : "near";
      setAccounts((xs) => [...xs, { name: picked.symbol, tier, symbol: picked.symbol, quantity: Number(qty), asset: picked.asset, balance: 0 }]);
      setPicked(null); setQty(""); setQuery(""); setResults([]);
    } else if (isDebt) {
      setLiabilities((xs) => [...xs, { name: name.trim(), balance: Number(amount), apr: (Number(apr) || 0) / 100, minPayment: Number(min) || 0 }]);
      setName(""); setAmount(""); setApr(""); setMin("");
    } else {
      setAccounts((xs) => [...xs, { name: name.trim(), tier: kind as Tier, balance: Number(amount) }]);
      setName(""); setAmount("");
    }
  };

  // Tap a row to edit: pull it back into the form (pre-filled) and remove it from the list,
  // so the user tweaks the values and re-adds the updated version, then saves.
  const edit = (dbt: boolean, i: number) => {
    if (dbt) {
      const l = liabilities[i];
      setKind("debt");
      setName(l.name);
      setAmount(String(Math.round(l.balance)));
      setApr(l.apr ? String(+(l.apr * 100).toFixed(4)) : "");
      setMin(l.minPayment ? String(Math.round(l.minPayment)) : "");
      setLiabilities((xs) => xs.filter((_, j) => j !== i));
    } else {
      const a = accounts[i];
      if (a.symbol && a.quantity != null) {
        setKind("market");
        setPicked({ symbol: a.symbol, name: a.symbol, asset: a.asset ?? "crypto", rank: null });
        setQty(String(a.quantity));
      } else {
        setKind((["liquid", "near", "illiquid"].includes(a.tier) ? a.tier : "near") as Kind);
        setName(a.name);
        setAmount(String(Math.round(a.balance ?? 0)));
      }
      setAccounts((xs) => xs.filter((_, j) => j !== i));
    }
  };

  const save = async () => {
    setSaving(true);
    await fetch("/api/atlas/manual", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ accounts, liabilities }) });
    await fetch("/api/atlas/sync", { method: "POST" });
    window.location.href = "/atlas/accounts";
  };

  const acctValue = (a: Account) => {
    if (a.symbol && a.quantity != null) {
      const map = (a.asset ?? "crypto") === "stock" ? prices.stocks : prices.crypto;
      const px = map?.[a.symbol.toUpperCase()];
      if (px != null) return a.quantity * px;
    }
    return a.balance ?? 0;
  };

  const chip = (active: boolean) => ({
    fontFamily: GEIST, fontSize: 11.5, fontWeight: 500, letterSpacing: "0.01em",
    padding: "8px 12px", borderRadius: 999, cursor: "pointer", whiteSpace: "nowrap" as const,
    border: `1px solid ${active ? "#A8C3A6" : "rgba(239,235,227,0.16)"}`,
    color: active ? "#0C0C0D" : "#9A968D", background: active ? "#A8C3A6" : "transparent",
  });
  const inputStyle = { fontFamily: GEIST, fontSize: 14, color: "#EFEBE3", background: "rgba(239,235,227,0.05)", border: "1px solid rgba(239,235,227,0.12)", borderRadius: 11, padding: "12px 13px", outline: "none", width: "100%", boxSizing: "border-box" as const };

  return (
    <div style={{ width: 390, height: 844, borderRadius: 56, background: "#0a0a0b", padding: 11, boxShadow: "0 50px 90px -30px rgba(26,24,20,0.5),0 0 0 1px rgba(0,0,0,0.55)", position: "relative" }}>
      <div style={{ position: "absolute", inset: 11, borderRadius: 45, background: "#0C0C0D", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 13, left: "50%", transform: "translateX(-50%)", width: 118, height: 33, borderRadius: 18, background: "#000", zIndex: 6 }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", zIndex: 5 }}>
          <span style={{ fontFamily: GEIST, fontSize: 14, fontWeight: 500, color: "#EFEBE3", letterSpacing: "0.02em" }}>9:41</span>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 11 }}>{[5, 7, 9, 11].map((h) => <div key={h} style={{ width: 3, height: h, background: "#EFEBE3", borderRadius: 1 }} />)}</div>
            <div style={{ width: 24, height: 12, borderRadius: 3, border: "1px solid rgba(239,235,227,0.5)", padding: 1.5 }}><div style={{ width: "72%", height: "100%", background: "#EFEBE3", borderRadius: 1 }} /></div>
          </div>
        </div>
        <div style={{ position: "absolute", inset: 0, padding: "74px 26px 26px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <a href="/atlas/accounts" style={{ fontFamily: GEIST, fontSize: 13, color: "#908C83", textDecoration: "none" }}>‹ Accounts</a>
            <span style={{ fontFamily: GEIST, fontSize: 10, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "#908C83" }}>Holdings</span>
          </div>
          <div style={{ marginTop: 16, fontFamily: SERIF, fontSize: 27, color: "#EFEBE3", lineHeight: 1.1 }}>Add what Plaid<br />cannot reach.</div>
          <div style={{ marginTop: 7, fontFamily: GEIST, fontWeight: 300, fontSize: 12.5, lineHeight: 1.5, color: "#9A968D", maxWidth: 300 }}>Coins and stocks track the live price. Cash and debt are fixed.</div>

          <div style={{ marginTop: 14, flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 7 }}>
            {[...accounts.map((a, i) => ({ a, i, dbt: false })), ...liabilities.map((l, i) => ({ a: l, i, dbt: true }))].map(({ a, i, dbt }, k) => (
              <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 13px", borderRadius: 11, background: "rgba(239,235,227,0.04)", border: "1px solid rgba(239,235,227,0.08)" }}>
                <div onClick={() => edit(dbt, i)} title="Tap to edit" style={{ minWidth: 0, flex: 1, cursor: "pointer" }}>
                  <div style={{ fontFamily: GEIST, fontSize: 13.5, color: "#EFEBE3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {!dbt && (a as Account).symbol ? `${(a as Account).quantity} ${(a as Account).symbol}` : a.name}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 12, color: dbt ? "#D9B27C" : "#A8C3A6", marginTop: 2 }}>
                    {dbt ? `-${money(a.balance)}` : money(acctValue(a as Account))}<span style={{ color: "#615E58", marginLeft: 8, fontFamily: GEIST, fontSize: 10.5 }}>edit</span>
                  </div>
                </div>
                <button onClick={() => (dbt ? setLiabilities((xs) => xs.filter((_, j) => j !== i)) : setAccounts((xs) => xs.filter((_, j) => j !== i)))} aria-label="Remove" style={{ background: "transparent", border: "none", color: "#7E7A72", fontSize: 19, cursor: "pointer", padding: "0 2px", lineHeight: 1 }}>×</button>
              </div>
            ))}

            <div style={{ marginTop: 4, padding: 13, borderRadius: 13, border: "1px dashed rgba(239,235,227,0.16)", display: "flex", flexDirection: "column", gap: 9 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {KINDS.map((k) => <span key={k.key} onClick={() => { setKind(k.key); setPicked(null); setResults([]); setQuery(""); }} style={chip(kind === k.key)}>{k.label}</span>)}
              </div>

              {isMarket ? (
                picked ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 10, background: "rgba(168,195,166,0.08)", border: "1px solid rgba(168,195,166,0.25)" }}>
                      <span style={{ fontFamily: GEIST, fontSize: 13, color: "#EFEBE3" }}><b style={{ fontFamily: MONO }}>{picked.symbol}</b> · {picked.name}</span>
                      <span onClick={() => setPicked(null)} style={{ fontFamily: GEIST, fontSize: 12, color: "#A8C3A6", cursor: "pointer" }}>change</span>
                    </div>
                    <input value={qty} onChange={(e) => setQty(onlyNum(e.target.value))} inputMode="decimal" placeholder={`Quantity of ${picked.symbol}`} style={inputStyle} autoFocus />
                  </>
                ) : (
                  <>
                    <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search a coin or stock (BTC, AAPL, Worldcoin)" style={inputStyle} autoFocus />
                    {results.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", maxHeight: 168, overflowY: "auto", borderRadius: 10, border: "1px solid rgba(239,235,227,0.1)" }}>
                        {results.map((r, ri) => (
                          <div key={`${r.asset}-${r.symbol}-${ri}`} onClick={() => { setPicked(r); setResults([]); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", cursor: "pointer", borderBottom: ri < results.length - 1 ? "1px solid rgba(239,235,227,0.06)" : "none" }}>
                            <div style={{ minWidth: 0 }}>
                              <span style={{ fontFamily: MONO, fontSize: 13, color: "#EFEBE3" }}>{r.symbol}</span>
                              <span style={{ fontFamily: GEIST, fontSize: 12, color: "#908C83", marginLeft: 8, overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</span>
                            </div>
                            <span style={{ fontFamily: GEIST, fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", color: r.asset === "crypto" ? "#A8C3A6" : "#D9B27C", border: `1px solid ${r.asset === "crypto" ? "rgba(168,195,166,0.4)" : "rgba(217,178,124,0.4)"}`, borderRadius: 5, padding: "2px 6px", whiteSpace: "nowrap" }}>{r.asset === "crypto" ? "COIN" : "STOCK"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )
              ) : (
                <>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (e.g. Business debt)" style={inputStyle} />
                  <input value={amount ? `$${Number(onlyNum(amount)).toLocaleString("en-US")}` : ""} onChange={(e) => setAmount(onlyNum(e.target.value))} inputMode="decimal" placeholder="$ Amount" style={inputStyle} />
                  {isDebt && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <input value={apr} onChange={(e) => setApr(onlyNum(e.target.value))} inputMode="decimal" placeholder="APR %" style={{ ...inputStyle, flex: 1 }} />
                      <input value={min ? `$${Number(onlyNum(min)).toLocaleString("en-US")}` : ""} onChange={(e) => setMin(onlyNum(e.target.value))} inputMode="decimal" placeholder="Min /mo" style={{ ...inputStyle, flex: 1 }} />
                    </div>
                  )}
                </>
              )}

              <button onClick={add} disabled={!canAdd} style={{ fontFamily: GEIST, fontSize: 13.5, fontWeight: 500, color: canAdd ? "#EFEBE3" : "#6E6A63", background: "transparent", border: "1px solid rgba(239,235,227,0.16)", borderRadius: 11, padding: "11px", cursor: canAdd ? "pointer" : "default" }}>+ Add holding</button>
            </div>
          </div>

          <button onClick={save} disabled={saving} style={{ marginTop: 12, height: 54, borderRadius: 14, background: saving ? "#cfcabf" : "#EFEBE3", border: "none", fontFamily: GEIST, fontSize: 15, fontWeight: 500, color: "#0C0C0D", letterSpacing: "0.01em", cursor: "pointer", width: "100%" }}>
            {saving ? "Saving" : "Save and recompute"}
          </button>
        </div>
      </div>
    </div>
  );
}
