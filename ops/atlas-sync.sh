#!/bin/zsh
# Cron target — refreshes the Atlas snapshot from Plaid. Requires the app running on :3000.
LOG=/Users/arya/Claude/arya/builds/001-finance/dashboard/.plaid/sync.log
mkdir -p "$(dirname "$LOG")"
RESULT=$(curl -s -m 90 -X POST http://localhost:3000/api/atlas/sync 2>&1 | head -c 200)
echo "$(date): $RESULT" >> "$LOG"
