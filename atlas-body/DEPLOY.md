# Deploy Atlas · Body

This module was built inside the `aryaghavami/atlas` repo (branch
`claude/second-module-physical-health-wohnza`) under `atlas-body/`, structured to lift cleanly into
its own repo + Vercel project — matching the `datum` setup. Three steps.

## 1 · Give it its own repo

**Option A — preserve history (recommended).** Splits just the `atlas-body/` subtree into a new repo:

```bash
git clone https://github.com/aryaghavami/atlas.git
cd atlas
git checkout claude/second-module-physical-health-wohnza
git subtree split --prefix=atlas-body -b atlas-body-only

gh repo create aryaghavami/atlas-body --private
git push https://github.com/aryaghavami/atlas-body.git atlas-body-only:main
```

**Option B — clean copy (simplest).** No history, just the files:

```bash
git clone -b claude/second-module-physical-health-wohnza https://github.com/aryaghavami/atlas.git
cd atlas/atlas-body
git init && git add -A && git commit -m "Atlas · Body — module two"
gh repo create aryaghavami/atlas-body --private --source=. --remote=origin --push
```

Then locally: `npm install && npm test && npm run build` to confirm it stands alone (it imports
nothing from the money module).

## 2 · Import to Vercel

1. Vercel → **New Project** → import `aryaghavami/atlas-body`.
2. Framework preset **Next.js** is auto-detected. **Root Directory: `./`** (it's the repo root now).
3. Deploy. The public demo works immediately with **no env vars**.
4. Add a domain (e.g. `body.aryajoonam.com`), same as `datum.aryajoonam.com`.

After this, every push to `main` deploys; every branch/PR gets a preview — same as Datum.

## 3 · Optional: real data (self-host)

Without these, the app is local-first (weigh-ins live on the device). To persist across devices:

- **Supabase** — the table is **already provisioned** in your `aryajoonam` project
  (`public.atlas_body_state`, RLS-locked to service-role, mirroring `atlas_state`). Just set the
  Vercel env vars:
  - `SUPABASE_URL=https://gdgqbuscvthwwfkvfhjp.supabase.co`
  - `SUPABASE_SERVICE_ROLE_KEY=` (copy from Supabase → Project Settings → API → service_role)

  To provision it elsewhere instead, run:
  ```sql
  create table public.atlas_body_state (
    key text primary key,
    value jsonb not null,
    updated_at timestamptz not null default now()
  );
  alter table public.atlas_body_state enable row level security;
  -- no policies → only the service_role key (server-side) can touch it
  ```
- **Password gate** — set `ATLAS_BODY_PASSWORD`; the public demo stays open, real-data routes lock.
  Unlock once via `/body/start?key=...`.
- **Withings scale sync** — create an app at developer.withings.com, then set `WITHINGS_CLIENT_ID`,
  `WITHINGS_CLIENT_SECRET`, and `WITHINGS_REDIRECT_URI=https://<your-domain>/api/withings/callback`
  (register that exact callback in the Withings dashboard). Manual logging works without it.

That's it — Atlas · Body live, its own repo, its own project, your data on your cloud.
