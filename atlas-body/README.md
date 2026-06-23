# Atlas · Body

The honest projected date you reach your body-composition target. **Three numbers, no charts:**
your **body fat**, your **lean mass**, and the **date** — computed at the real rate a body can
change, not the fantasy 12 weeks every other app sells.

Module two of [Atlas](../README.md). Same DNA: the constraint is the product. Your data, your cloud.

> "The date is usually months or years out. That honesty is the whole point."

## Run it locally
```
npm install
npm run dev      # http://localhost:3000
npm test         # the engine is unit-tested (19 tests)
```
No keys needed to try it — the app is **local-first**: your weigh-ins live on your device, and the
engine runs in the browser so the date re-projects instantly when you log one. Supabase + Withings
are optional upgrades (below).

## What's inside
- **Engine** (`lib/engine.ts`): decomposes weight into fat + lean, projects an honest cut (sustainable
  deficit, muscle-gain that decays with training age, the natural **FFMI ceiling** of ~25), and flags
  muscle "at risk" when the cut is run badly. Pure, deterministic, tested.
- **The 500 futures** (`lib/engineBands.ts`): a Monte Carlo over *adherence* → a p10–p90 date band
  ("80% odds · 2027 to 2028").
- **Body-fat estimate** (`lib/bodyfat.ts`): US Navy tape method for onboarding without a scale.
- **The one screen** (`components/BodyScreen.tsx`): four states — on track, not on track, lean mass
  at risk, connect — ported pixel-for-pixel from the design. Count-up, focus-pull, and shimmer motion,
  all reduced-motion aware; edge-to-edge PWA on a real phone.

Stack: Next.js · TypeScript · Tailwind · (optional) Supabase · Vercel.

## Deploy your own (optional persistence)
1. **Supabase** for storage on serverless. Create the table:
   ```sql
   create table public.atlas_body_state (
     key text primary key,
     value jsonb not null,
     updated_at timestamptz not null default now()
   );
   alter table public.atlas_body_state enable row level security;
   -- no policies → only the service_role key (server-side) can read/write
   ```
   Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
2. **Password gate** your real data: set `ATLAS_BODY_PASSWORD` (the public demo stays open). Unlock
   once with `/body/start?key=...`.
3. **Withings** (smart-scale sync) is stubbed for a future step — manual weigh-ins work today.
4. Push to GitHub, import to Vercel, add the env vars. Open in Safari → Add to Home Screen.

See `.env.example` for the full list, and `/build` in the running app for the on-camera build prompts.

## This is a standalone module
`atlas-body` is self-contained so it lifts cleanly into its own repo (a sibling of `atlas`). To
extract: copy this directory to a new repo root, `npm install`, done — nothing here imports from the
money module.

Built in public by Arya — https://www.youtube.com/@aryajoonam
