"use client";
import { useCallback, useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";

// Read-only Plaid Link button, styled to Atlas. Fetches a link_token, opens Link, exchanges
// the public_token server-side, then calls onConnected. OAuth-aware: when a bank bounces the
// user through its own login (oauth_state_id in the URL), Link is re-initialised with the same
// token + receivedRedirectUri and auto-resumed. If no keys are configured (public demo), shows
// a clear message instead of spinning.
const TOKEN_KEY = "atlas_plaid_link_token";

export function PlaidConnect({ onConnected, compact }: { onConnected?: () => void; compact?: boolean }) {
  const [token, setToken] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const isOAuth = typeof window !== "undefined" && window.location.href.includes("oauth_state_id");

  useEffect(() => {
    // Returning from an OAuth bank: reuse the token we stashed before the redirect.
    if (isOAuth) {
      const saved = window.localStorage.getItem(TOKEN_KEY);
      if (saved) { setToken(saved); return; }
    }
    fetch("/api/plaid/link-token", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (d.link_token) { setToken(d.link_token); try { window.localStorage.setItem(TOKEN_KEY, d.link_token); } catch {} }
        else setFailed(true);
      })
      .catch(() => setFailed(true));
  }, [isOAuth]);

  const onSuccess = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (public_token: string, meta: any) => {
      try { window.localStorage.removeItem(TOKEN_KEY); } catch {}
      await fetch("/api/plaid/exchange", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ public_token, institution: meta?.institution?.name }),
      });
      if (onConnected) onConnected();
      else window.location.href = "/atlas/accounts";
    },
    [onConnected]
  );

  const { open, ready } = usePlaidLink({
    token: token ?? "",
    onSuccess,
    receivedRedirectUri: isOAuth ? window.location.href : undefined,
  });

  // Auto-resume Link after the OAuth redirect lands back on this page.
  useEffect(() => { if (isOAuth && ready) open(); }, [isOAuth, ready, open]);

  if (failed) {
    return compact ? (
      <span style={{ fontFamily: "'Geist', sans-serif", fontSize: 12, color: "#7E7A72" }}>Open the app to connect a bank.</span>
    ) : (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Geist', sans-serif", fontWeight: 300, fontSize: 13, lineHeight: 1.55, color: "#9A968D", maxWidth: 300, margin: "0 auto" }}>
          Connecting a bank opens in the app.
        </div>
        <a href="/atlas/start" style={{ display: "inline-block", marginTop: 14, fontFamily: "'Geist', sans-serif", fontSize: 13, fontWeight: 500, color: "#A8C3A6", textDecoration: "none", letterSpacing: "0.01em" }}>
          See the demo flow →
        </a>
      </div>
    );
  }

  if (compact) {
    return (
      <button onClick={() => open()} disabled={!ready || !token}
        style={{ background: "transparent", border: "none", padding: 0, fontFamily: "'Geist', sans-serif", fontWeight: 400, fontSize: 12, color: "#A8C3A6", letterSpacing: "0.01em", cursor: ready && token ? "pointer" : "default", opacity: ready && token ? 1 : 0.55 }}>
        {token ? "+ Link a bank account ›" : "Preparing secure link…"}
      </button>
    );
  }

  return (
    <button onClick={() => open()} disabled={!ready || !token}
      style={{ height: 54, borderRadius: 14, background: "#EFEBE3", border: "none", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", fontFamily: "'Geist', sans-serif", fontSize: 15, fontWeight: 500, color: "#0C0C0D", letterSpacing: "0.01em", cursor: ready && token ? "pointer" : "default", opacity: ready && token ? 1 : 0.6 }}>
      {token ? "Connect a bank" : "Preparing secure link"}
    </button>
  );
}
