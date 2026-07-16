# Paragon Exteriors — Marketing Website

The public marketing site for **Paragon Exteriors LLC** (paragonexteriorsnj.com): a ~150-page,
SEO/GEO-optimized static site built with **Astro 5 + Tailwind 4**, wired into the FSH.Starter
backend's **Crm module** for lead capture.

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static build → dist/
```

## Architecture

| Piece | Where |
|---|---|
| Business identity (NAP, license, socials) | `src/config/business.ts` — single source of truth |
| Integration switches (Mux, CRM, GA4, voice) | `.env` → see `.env.example` |
| Content collections (services/towns/combos/posts) | `src/content/` + `src/content.config.ts` |
| Page templates | `src/pages/[service]/…`, `src/pages/service-areas/…`, `src/pages/blog/…` |
| JSON-LD builders (RoofingContractor/Service/FAQ/Article/Breadcrumb) | `src/lib/schema.ts` |
| GEO endpoints | `/llms.txt`, `/llms-full.txt` (generated from all content) |
| Lead capture → CRM | `src/components/LeadForm.astro` → `POST {PUBLIC_LEADS_API}` with `tenant` header; UTM/referrer first-touch attribution included |

### URL structure

- `/{service}/` — service pillars (e.g. `/roof-replacement/`)
- `/{service}/{town}/` — money pages (e.g. `/roof-replacement/toms-river/`), generated from `src/content/combos/`
- `/service-areas/{town}/` — town hubs
- `/blog/{slug}/` — guides

## Media assets (one-time fetch)

The remote build environment can't reach the media CDNs, so assets are pulled by the
**Fetch Website Assets** GitHub Action (`.github/workflows/fetch-assets.yml`), which downloads
everything in `scripts/asset-manifest.json` (brand imagery, the previous site's real drone
project photos, team photos, and the hero reel), optimizes it, and commits to
`clients/website/public/media/`. Run it from the Actions tab against this branch if media is missing.

## Launch runbook (do these once at go-live)

1. **Mux hero**: upload `public/media/hero-reel.mp4` (the "30 roofs / 30 days" reel) at
   [dashboard.mux.com](https://dashboard.mux.com) → copy the playback ID → set `PUBLIC_MUX_PLAYBACK_ID`.
   Until then the hero uses the local video fallback automatically.
2. **CRM**: deploy the FSH.Starter API, set `PUBLIC_LEADS_API=https://<api-host>/api/v1/crm/leads`
   and `PUBLIC_TENANT` (default `root`). Leads then appear in the admin app's Leads section.
3. **DNS/hosting**: deploy to Vercel. **This is a monorepo — set the Vercel project's
   Root Directory to `clients/website`** (Settings → Build and Deployment → Root Directory), then
   Vercel auto-detects Astro and uses `clients/website/vercel.json` (301s from old Wix URLs + cache
   headers). Without that setting Vercel builds from the repo root and returns `404: NOT_FOUND` on
   every route; the root-level `vercel.json` is a fallback that builds the site from root, but
   setting Root Directory is preferred. Point paragonexteriorsnj.com at the deployment.
4. **Google Search Console**: verify the domain, submit `/sitemap-index.xml`, request indexing for
   the homepage + service pillars. **The old Wix site shipped `noindex` on every page** — after
   launch, confirm no route carries `noindex` (only `/thank-you/` does, intentionally).
5. **Google Business Profile**: create/claim the GBP for Paragon Exteriors LLC, category "Roofing
   contractor", service-area business (Ocean/Monmouth County), same NAP as `business.ts`,
   link the site, start the review-generation habit (ask every Won customer).
   Also correct/claim the stray Yelp listing that duplicates a Wisconsin company's text.
6. **GA4**: create a property, set `PUBLIC_GA4_ID`. Add an "AI Traffic" channel group with regex
   `chatgpt\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com` placed
   above Referral to measure AI-search referrals. Conversion events already fire:
   `generate_lead` (form submit) and `conversion_thank_you` (thank-you page).
7. **Voice agent**: see `docs/voice-agent.md` (Hume EVI phone answering + optional web widget).
8. **Socials**: fix the Facebook page link in `src/config/business.ts` if the real page URL
   differs (`facebook.com/paragonexteriorsnj` is assumed; the old site linked a Wix placeholder).

## Content conventions

Every content file's frontmatter is validated by zod (`src/content.config.ts`) at build time —
`metaDescription` is capped at 175 chars, FAQs become FAQPage JSON-LD automatically, and internal
links must use existing slugs (the build fails on schema violations, not on broken links — run
a link checker before big content changes).

**Do not invent facts in content**: no awards, certifications, or review counts that aren't real.
The license number NJ HIC #13VH13814500 and the phone number live in `business.ts` only.
