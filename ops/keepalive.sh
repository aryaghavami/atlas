#!/bin/zsh
# Keeps the Atlas app alive on :3000. launchd restarts this if it dies.
export PATH="/opt/homebrew/bin:/usr/bin:/bin:$PATH"
cd /Users/arya/Claude/arya/builds/001-finance/dashboard || exit 1

# Free port 3000 from any stale process before (re)starting.
lsof -ti :3000 | xargs kill -9 2>/dev/null

# Force localhost-only (-H 127.0.0.1). next dev otherwise binds ALL interfaces by default,
# which would expose this real-financial-data server to the LAN. Phone access = Tailscale
# `serve 3000` (proxies via loopback). Do NOT bind 0.0.0.0 here.
exec npm run dev -- -H 127.0.0.1
