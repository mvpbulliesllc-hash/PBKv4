# Security

- Never commit credentials, tokens, customer data, workflow credentials, or populated environment files.
- Privileged values must remain server-only. Do not use `NEXT_PUBLIC_` for service-role keys, provider secrets, n8n secrets, Composio credentials, Mux secrets, or webhook signing secrets.
- Run `bash scripts/secret-scan.sh` before every commit.
- Rotate any credential disclosed through chat, logs, screenshots, archives, commits, or workflow exports.
- This repository is currently public. Paid template packs and proprietary source must not be committed here.
- The previously uploaded Horizon Pro archive remains in Git history until an authorized history rewrite is performed. Make the repository private and purge that binary before treating the repository history as distributable.
