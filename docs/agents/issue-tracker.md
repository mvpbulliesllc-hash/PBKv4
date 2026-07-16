# Issue tracker: GitHub

Issues and PRDs for PBKv4 live as GitHub issues in `mvpbulliesllc-hash/PBKv4`.

## Conventions

- Create, read, update, label, and close issues with the authenticated GitHub tooling available to the current agent.
- Infer the repository from the `origin` remote when running inside this checkout.
- Keep implementation commits independent from issue administration when issue tooling is unavailable.

## Pull requests as a triage surface

**PRs as a request surface: no.** The operator ships approved work directly to `main` unless they explicitly request a review branch.

## Skill translations

- "Publish to the issue tracker" means create a GitHub issue.
- "Fetch the relevant ticket" means read the matching GitHub issue and its comments.
- A wayfinding map is one GitHub issue with linked child issues; use native issue dependencies when available.
