#!/usr/bin/env bash
set -euo pipefail

patterns='sk-ant-api03-|sk-svcacct-|sk-or-v1-|sk-nous-|sk-ct-[A-Za-z0-9_-]{12,}|pk_live_[A-Za-z0-9_-]{12,}|nvapi-[A-Za-z0-9_-]{20}|ghp_[A-Za-z0-9]{36}|github_pat_|xapp-[0-9]-|xoxb-|vercel_blob_rw_[A-Za-z0-9_-]{20,}|bb_live_[A-Za-z0-9_-]{20,}|cal_live_[A-Za-z0-9_-]{20,}|whsec_[0-9A-Za-z_-]{20}|MUX_TOKEN_SECRET[[:space:]]*=[[:space:]]*[^[:space:]]+'
scan_paths=(
  app
  components
  config
  docs
  drizzle
  lib
  scripts
  skills
  .env.example
  AGENTS.md
  README.md
  SECURITY.md
  package.json
  pnpm-workspace.yaml
  tsconfig.json
  vercel.json
)

if rg -n --hidden \
  --glob '!scripts/secret-scan.sh' \
  "$patterns" "${scan_paths[@]}"; then
  echo 'Credential-like value found. Remove it before committing.' >&2
  exit 1
fi

while IFS= read -r file; do
  if rg -n '^[A-Za-z_][A-Za-z0-9_]*=.+$' "$file"; then
    echo "Populated environment assignment found in $file" >&2
    exit 1
  fi
done < <(find . \( -path './node_modules' -o -path './.next' -o -path './.git' \) -prune -o -type f -name '.env*' -print)

echo 'Secret scan passed.'
