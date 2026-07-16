#!/usr/bin/env bash
set -euo pipefail

patterns='sk-ant-api03-|sk-svcacct-|sk-or-v1-|sk-nous-|sk-ct-[A-Za-z0-9_-]{12,}|pk_live_[A-Za-z0-9_-]{12,}|nvapi-[A-Za-z0-9_-]{20}|ghp_[A-Za-z0-9]{36}|github_pat_|xapp-[0-9]-|xoxb-|vercel_blob_rw_[A-Za-z0-9_-]{20,}|bb_live_[A-Za-z0-9_-]{20,}|cal_live_[A-Za-z0-9_-]{20,}|whsec_[0-9A-Za-z_-]{20}|MUX_TOKEN_SECRET[[:space:]]*=[[:space:]]*[^[:space:]]+'

if rg -n --hidden \
  --glob '!.git/**' \
  --glob '!node_modules/**' \
  --glob '!.next/**' \
  --glob '!scripts/secret-scan.sh' \
  "$patterns" .; then
  echo 'Credential-like value found. Remove it before committing.' >&2
  exit 1
fi

while IFS= read -r file; do
  if rg -n '^[A-Za-z_][A-Za-z0-9_]*=.+$' "$file"; then
    echo "Populated environment assignment found in $file" >&2
    exit 1
  fi
done < <(find . -type f -name '.env*' -not -path './node_modules/*' -not -path './.git/*')

echo 'Secret scan passed.'
