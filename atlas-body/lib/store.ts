// Client-side, local-first store. The demo and the PWA run entirely on the device — no account,
// no backend round-trip — so logging a weigh-in re-projects the date instantly. Self-hosters who
// set Supabase get server persistence via /api/body (progressive enhancement); the local copy
// stays the source of truth for the snappy, offline-friendly experience.

import { DEMO_STATE } from "./demo";
import type { BodyState, Profile, WeighIn } from "./types";

const KEY = "atlas_body_state_v1";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** The user's real state, or null if they haven't onboarded. */
export function loadState(): BodyState | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BodyState;
    if (!parsed?.profile || !Array.isArray(parsed.weighIns)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** What the screen renders: real state if present, otherwise the demo. */
export function effectiveState(): BodyState {
  return loadState() ?? DEMO_STATE;
}

export function isOnboarded(): boolean {
  return loadState() !== null;
}

export function saveState(state: BodyState): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
  void syncToServer(state);
}

export function saveProfile(profile: Profile, firstWeighIn?: WeighIn): void {
  const existing = loadState();
  const next: BodyState = existing
    ? { ...existing, profile }
    : { profile, weighIns: firstWeighIn ? [firstWeighIn] : [] };
  saveState(next);
}

/** Append a weigh-in (kept chronological, de-duped by date) and persist. */
export function addWeighIn(w: WeighIn): BodyState {
  const state = loadState() ?? { ...DEMO_STATE };
  const weighIns = [...state.weighIns.filter((x) => x.date !== w.date), w].sort((a, b) =>
    a.date < b.date ? -1 : 1,
  );
  const next = { ...state, weighIns };
  saveState(next);
  return next;
}

export function latestWeighIn(state: BodyState): WeighIn | null {
  return state.weighIns.length ? state.weighIns[state.weighIns.length - 1] : null;
}

export function resetState(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(KEY);
}

// Best-effort server sync. Silent no-op when the route isn't configured (demo / static host).
async function syncToServer(state: BodyState): Promise<void> {
  try {
    await fetch("/api/body/current", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(state),
      keepalive: true,
    });
  } catch {
    /* offline or no backend — local copy is authoritative */
  }
}
