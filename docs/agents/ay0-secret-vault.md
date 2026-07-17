# AY.0 secret vault

AY.0 accepts credentials only through server-side environment variables or an operator-owned dotenv file referenced by `AY0_SECRET_ENV_FILE`. Local development may instead store that absolute path in the git-ignored `.ay0-vault-path` pointer file; the pointer contains no credential values.

Start the local app with the vault path in the parent process:

```bash
AY0_SECRET_ENV_FILE=/absolute/path/to/operator-vault/.env pnpm dev
```

Do not copy the vault into this repository. Do not commit a populated `.env*` file or `.ay0-vault-path`. The repository secret scan intentionally rejects all populated environment files, including ignored files.

The client capability map is [`config/ay0-capabilities.json`](../../config/ay0-capabilities.json). It contains environment-variable names, seats, states, and read-only health-probe identifiers only—never values.

Quarantined or manual paths remain unavailable to AY.0:

- GitHub requires a rotated, fine-grained repository PAT before it can be enabled.
- Slack uses Vercel Connect. PBKv4 stores only the connector UID and requests short-lived, scoped runtime tokens; it does not store a Slack bot token or signing secret.
- Vercel deployment and production environment configuration remain operator-manual.
- Hume is resolved only for the `runner` seat; AY.0 receives health status, not its credential values.
