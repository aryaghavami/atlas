# Atlas

A finance app that shows the three numbers that actually run your life: your **net worth**
(liquidity-adjusted), your **runway**, and the **exact date** you hit your number. Free, open, and
you run your own copy connected to your own accounts.

## Deploy your own (one click)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aryaghavami/atlas&env=PLAID_CLIENT_ID,PLAID_SECRET,PLAID_ENV,SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY,ATLAS_PASSWORD)

You'll be asked for a few env vars (see `.env.example`). Get Plaid keys at dashboard.plaid.com and a
Supabase project at supabase.com (both have free tiers).

## Run it locally
```
npm install
cp .env.example .env.local   # fill in your keys
npm run dev                  # http://localhost:3000/atlas
```

## What's inside
- **Engine** (`lib/engine.ts`): liquidity-adjusted net worth, runway, time-to-target.
- **Bands** (`lib/engineBands.ts`): a 500-run Monte Carlo, so the date is an honest range.
- **Plaid** (read-only) for balances; **CoinGecko / Yahoo** for live crypto + stock prices.
- **Supabase** for storage; a password gate on the real-data routes; a representative demo that stays public.

Stack: Next.js · TypeScript · Plaid · Supabase · Vercel.

Built in public by Arya — https://www.youtube.com/@aryajoonam
