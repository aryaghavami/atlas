// Withings smart-scale sync — the body's "Plaid moment". OAuth2, read-only (user.metrics).
// Tokens are stored server-side via the KV/file store; the manual weigh-in path works without any
// of this, so everything here degrades to a no-op when WITHINGS_* env is absent.

import type { WeighIn } from "./types";

const AUTHORIZE = "https://account.withings.com/oauth2_user/authorize2";
const TOKEN = "https://wbsapi.withings.net/v2/oauth2";
const MEASURE = "https://wbsapi.withings.net/measure";
const KG_TO_LB = 2.2046226218;

export interface WithingsTokens {
  accessToken: string;
  refreshToken: string;
  userId: string;
  expiresAt: number; // epoch ms
}

export function withingsEnabled(): boolean {
  return Boolean(process.env.WITHINGS_CLIENT_ID && process.env.WITHINGS_CLIENT_SECRET);
}

function redirectUri(): string {
  return process.env.WITHINGS_REDIRECT_URI || "http://localhost:3000/api/withings/callback";
}

export function authorizeUrl(state: string): string {
  const p = new URLSearchParams({
    response_type: "code",
    client_id: process.env.WITHINGS_CLIENT_ID || "",
    scope: "user.metrics",
    redirect_uri: redirectUri(),
    state,
  });
  return `${AUTHORIZE}?${p.toString()}`;
}

async function requestToken(params: Record<string, string>): Promise<WithingsTokens> {
  const body = new URLSearchParams({
    action: "requesttoken",
    client_id: process.env.WITHINGS_CLIENT_ID || "",
    client_secret: process.env.WITHINGS_CLIENT_SECRET || "",
    ...params,
  });
  const res = await fetch(TOKEN, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body });
  const json = (await res.json()) as { status: number; body?: { access_token: string; refresh_token: string; userid: string; expires_in: number } };
  if (json.status !== 0 || !json.body) throw new Error(`withings token error: status ${json.status}`);
  return {
    accessToken: json.body.access_token,
    refreshToken: json.body.refresh_token,
    userId: String(json.body.userid),
    expiresAt: Date.now() + json.body.expires_in * 1000,
  };
}

export function exchangeCode(code: string): Promise<WithingsTokens> {
  return requestToken({ grant_type: "authorization_code", code, redirect_uri: redirectUri() });
}

export function refreshTokens(refreshToken: string): Promise<WithingsTokens> {
  return requestToken({ grant_type: "refresh_token", refresh_token: refreshToken });
}

/** Raw Withings getmeas shape (only the bits we read). */
interface MeasureGroup {
  date: number; // epoch seconds
  measures: { value: number; type: number; unit: number }[];
}
interface MeasureResponse {
  status: number;
  body?: { measuregrps: MeasureGroup[] };
}

// type 1 = weight (kg), type 6 = fat ratio (%). value scaled by 10^unit.
export function parseLatestMeasure(json: MeasureResponse): WeighIn | null {
  const grps = json.body?.measuregrps ?? [];
  if (!grps.length) return null;
  const sorted = [...grps].sort((a, b) => b.date - a.date);
  for (const g of sorted) {
    const get = (t: number) => {
      const m = g.measures.find((x) => x.type === t);
      return m ? m.value * Math.pow(10, m.unit) : null;
    };
    const kg = get(1);
    const fat = get(6);
    if (kg != null) {
      return {
        date: new Date(g.date * 1000).toISOString().slice(0, 10),
        weightLb: Math.round(kg * KG_TO_LB * 10) / 10,
        bodyFatPct: fat != null ? Math.round(fat * 10) / 10 : 20,
        source: "withings",
      };
    }
  }
  return null;
}

export async function fetchLatestWeighIn(accessToken: string): Promise<WeighIn | null> {
  const body = new URLSearchParams({ action: "getmeas", meastypes: "1,6", category: "1" });
  const res = await fetch(MEASURE, {
    method: "POST",
    headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  return parseLatestMeasure((await res.json()) as MeasureResponse);
}
