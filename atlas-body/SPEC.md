# Atlas · Body — Build Spec (Module Two)

> **Atlas was never a finance app — it's the umbrella. *Money* was module one.**
> Module two is the body. Same DNA: **the constraint is the product.** Three numbers,
> nothing else. Honest math over precise math. One screen. Your data, your cloud.
>
> This spec is self-contained so it lifts cleanly into its own repo (`atlas-body`),
> a sibling of `atlas`, with its own Vercel + Supabase + deploy button.

---

## 0. Positioning

**Atlas · Body.** Headline: **"See the exact day you'll have the body you want."**

The direct port of Money's *"See the exact day you become a millionaire."* The whole
fitness industry sells a fantasy 12-week date. Atlas · Body computes the **honest** date —
a range, usually measured in months or years — from your real body composition and the
real, literature-backed rates a natural body can change. The honesty *is* the wow.

---

## 1. The three numbers (the constraint)

Money used **state · buffer · goal** = net worth · runway · the date. Body mirrors it:

| Money | Body | Why it's the analog |
|---|---|---|
| **Net worth** (state) | **BODY-FAT %** | The single number that sits on top of everything else and tells the truth about where you are. |
| **The date** (goal) | **TARGET DATE** | The day you hit your target physique (target body-fat % and/or lean-mass target), at honest rates. |
| **Runway** (buffer/safety) | **LEAN MASS** | The thing you're protecting. Crash diets burn muscle — this is the honest warning. Sage when retained, amber when dropping. |

- **BODY-FAT %** — big mono number. Estimated from weight + waist/measurements (Navy/Hodgdon) or read from a smart scale; DEXA/manual override allowed.
- **TARGET DATE** — giant serif year + month, with a **p10–p90 band** beneath ("80% odds · 2027 to 2028"), exactly like Money's 500 futures.
- **LEAN MASS** — lbs/kg, with a trend color: **sage** = holding/building, **amber** = at risk (losing muscle on the current trajectory).

No charts. No nav. No settings. The constraint is the product.

---

## 2. The screen — states

One phone-frame screen, dark/gold, Geist + Instrument Serif. Five states:

1. **Empty / connect** — "Connect a scale or log a weigh-in." One CTA.
2. **Connected, on track** — the three numbers; date in serif; band below; lean mass sage.
3. **Not on track** — target is years out at this rate, or the goal is physiologically
   implausible (e.g., target lean mass above the natural ceiling). Honest amber state:
   *"At this rate, not before 2031"* / *"This lean-mass target is above the natural ceiling."*
   The twin of Money's "diverging / not on track" branch.
4. **Target hit** — celebratory state; offer the next phase (cut → lean-bulk, or maintain).
5. **At-risk** — on track for fat loss but **losing lean mass** → amber LEAN MASS with a
   one-line cause ("deficit too steep / protein low / no resistance training").

---

## 3. The engine — the honest math (`lib/engine.ts` twin)

Pure, deterministic, unit-tested. This is the unfair advantage, ported.

### Inputs
```ts
interface BodyInput {
  weight: number;            // lbs or kg (unit-aware)
  bodyFatPct: number;        // current, 0–100 (measured or estimated)
  heightCm: number;
  sex: "male" | "female";
  trainingAgeYears: number;  // 0 = novice; decays gains
  goal: { targetBodyFatPct?: number; targetLeanMass?: number };
  proteinAdequate: boolean;  // ≥0.7–1g/lb → muscle retention
  resistanceTraining: boolean;
  weeklyDeficitPct?: number; // % bodyweight/wk; default honest 0.7
  adherence?: number;        // 0–1; default 0.8
}
```

### Honest rates (literature-backed, the part no app ships)
- **Fat loss:** sustainable **0.5–1.0% bodyweight/week** (default 0.7%). ~3500 kcal/lb.
  Steeper deficits → muscle loss penalty applied to lean mass.
- **Muscle gain** (decays with training age — the FFMI approach):
  - Year 0–1: ~1.0–1.5% bodyweight/month (novice; recomp possible)
  - Year 1–2: ~0.5–1.0%/month
  - Year 2–3: ~0.25–0.5%/month
  - Year 4+: fractions of a percent — the honest ceiling
- **FFMI ceiling:** natural fat-free mass index ≈ **25** (cap, a few reach ~26).
  `FFMI = leanMassKg / heightM² (+ height normalization)`. This is the body's
  *"retirement counts as 0% liquid"* — the hard truth that bounds every projection.
- **Recomp** (gain muscle while losing fat) only credible for novices, the very
  overweight, or returners (muscle memory). Otherwise the engine **phases** the path:
  cut to target body-fat, *then* lean-bulk.

### Projection
Month-by-month simulation (like Money's 720-month loop):
1. Decompose weight → fat mass + lean mass.
2. Each month: apply fat change (deficit/surplus × adherence) and lean change
   (gain rate by training age if surplus + protein + lifting; retention/loss if deficit).
3. Clamp lean mass at the FFMI ceiling.
4. Recompute body-fat %. Mark the month target body-fat / target lean mass is reached.
5. Phase transitions when a sub-goal is met (cut done → switch to bulk).
6. **Not-on-track branch:** if target lean mass > ceiling → flag implausible; if date
   beyond a horizon → "not before YYYY."

### Output
```ts
interface BodyOutput {
  bodyFatPct: number;
  leanMass: number;
  leanMassHealthy: boolean;   // retaining/building → sage
  ffmi: number;
  ffmiHeadroom: number;       // distance to natural ceiling
  reachable: boolean;
  targetMonth: string | null;
  targetYear: number | null;
  monthsOut: number | null;
  phasePlan: Array<{ phase: "cut" | "bulk" | "maintain"; months: number }>;
}
```

---

## 4. The 500 futures — Monte Carlo over adherence (`lib/engineBands.ts` twin)

One date is a lie. Run **500 paths**, varying the real-world variable: **adherence**
(deficit consistency, missed weeks, diet breaks) ~ a distribution around the user's
estimate. Report the date as **p10–p90** plus the median:

> **80% odds · 2027 to 2028** under the target year.

Same exact pattern and copy shape as Money's bands.

---

## 5. The connection — your Plaid moment (`lib/withings*.ts`)

Two tiers (the body's data plane is split — this is the architectural fork):

- **v1 — web-native OAuth + manual (ships in one evening):**
  - **Withings OAuth** → weight, body-fat %, resting HR. Server-side token storage
    (like Plaid access tokens), **sync-on-read**. Clean Plaid analog.
  - **Manual weigh-ins** that re-project the date live — the twin of Money's
    "manual holdings priced live." Log a weight → the date moves.
- **Later — the data ceiling:** **Oura / Whoop / Garmin** OAuth (recovery, VO2max),
  and **Apple Health / HealthKit** — but HealthKit is **not web-reachable**; it needs a
  native iOS companion or a Shortcuts export. **v1 is explicitly web-only.** Do not
  assume Apple Health anywhere in v1.

---

## 6. Storage & infra (mirror Money exactly)

- **Supabase** KV table, RLS-locked to `service_role`, async, local-file fallback.
- **Password gate** (middleware) on real-data routes + APIs in prod; a representative
  **public demo** on sample data.
- Stack: **Next.js · TypeScript · Withings · Supabase · Vercel.** One-click deploy button.
- Health data is more sensitive than balances — **"your data / your cloud / deploy your
  own" is a *stronger* pitch here than it was for Money.** Lead with it.

---

## 7. Routes / pages (mirror `app/atlas/*`)

```
/                      landing (eyebrow: "Atlas · Body")
/body                  the one screen (demo data public)
/body/start            onboarding (sex, height, weight, bf%, training age, goal)
/body/connect          Withings OAuth
/body/manual           manual weigh-in / measurements
/body/target           set target physique (body-fat % / lean mass)
/body/assumptions      honest-rate assumptions (deficit %, protein, lifting)
/build                 the five on-camera prompts (DIY "deploy your own")
api/withings/*         link / exchange / sync
api/body/*             current / reproject / manual / preview
```

---

## 8. The /build page — the five on-camera prompts

Mirror Money's `app/build/page.tsx`. Five steps, each a paste-ready agent prompt:

1. **THE CONSTRAINT** — scaffold the one screen: BODY-FAT %, TARGET DATE, LEAN MASS.
2. **THE CONNECTION** — Withings OAuth (read-only), tokens server-side, sync-on-read.
3. **THE HONEST MATH** — the engine: honest fat-loss/muscle-gain rates, the FFMI ceiling,
   phased cut→bulk path, "not on track."
4. **THE FIVE HUNDRED FUTURES** — Monte Carlo over adherence → p10–p90 date band.
5. **THE LIVE LOG** — manual weigh-ins/measurements that re-project the date live.

Plus the "ship it" prompt (Supabase KV, password gate, public demo, PWA).

---

## 9. Brand

- Umbrella: **Atlas.** Eyebrow pattern: **`Atlas · Body`** (matches `Atlas · Money`).
- Naming for the constraint: *body-fat %*, *target date*, *lean mass* — plain, honest.
- Tone: blunt, anti-hype. The enemy is the 12-week-transformation industry.

---

## 10. Out of scope for v1 / roadmap

- **Module three — Longevity:** biological vs chronological age, healthspan margin, the
  year your trajectory crosses a threshold. Needs labs + wearables. Build after Body.
- **HealthKit native companion** (the data ceiling).
- **Cross-module screen:** "the date your money outlasts you, or you outlast it"
  (Money runway × healthspan). The shared design package is what keeps this door open.

---

## 11. Open questions

1. Units: default to lbs/imperial (US audience) with a kg toggle? (Assume yes.)
2. Body-fat source of truth when scale and Navy-method disagree — which wins? (Assume
   measured/DEXA override > scale > estimate.)
3. Shared design system: copy tokens for v1, extract `@atlas/ui` package at module three?
   (Assume yes — don't pay monorepo tax now.)
