# Paragon Voice Agent — setup guide

Two complementary modes, both feeding the same CRM (`Source = VoiceAgent`):

## 1. Inbound phone answering — Hume EVI + Twilio (recommended, zero code)

Never miss a call again: after-hours and overflow calls get answered by an empathic AI
receptionist that qualifies the lead and promises a callback.

1. Create a [Hume](https://platform.hume.ai) account → **EVI 3** config:
   - System prompt: roofing intake receptionist for Paragon Exteriors LLC — collect name, phone,
     town, service needed (roof repair/replacement, siding, windows, doors, decks, gutters,
     commercial), urgency (active leak?), and preferred callback window. Must disclose it is an
     AI assistant (TCPA). Never quote firm prices; say estimates are free and Joe's team calls back fast.
   - Pick a voice; note the `config_id`.
2. Buy a Twilio number (or port the tracking number) and point its **inbound call webhook** to:
   `https://api.hume.ai/v0/evi/twilio?config_id=<CONFIG_ID>&api_key=<HUME_API_KEY>`
3. Forward the business line (848-633-6440) to that number after-hours, or publish the Twilio
   number as a tracked line.
4. Lead entry: the direct Twilio↔EVI bridge can't call tools, so transcripts are reviewed in
   Hume's dashboard; enter leads via the admin app (Source: VoiceAgent), or upgrade to mode 2's
   server-mediated setup later for automatic capture.

**Note (TCPA):** inbound answering is fine; *outbound* AI calling requires prior express written
consent — don't do it.

## 2. Web voice widget — ElevenLabs Conversational AI (config-only)

The site already ships a widget mount (`src/components/VoiceWidget.astro`): set
`PUBLIC_ELEVENLABS_AGENT_ID` and it renders on every page.

1. Create an agent at [elevenlabs.io](https://elevenlabs.io) → Conversational AI.
2. Same intake prompt as above; add a **webhook tool** `capture_lead` pointing at the CRM:
   - `POST https://<api-host>/api/v1/crm/leads` with header `tenant: root`
   - body fields: `firstName, lastName, phone, email, address, serviceType, message,
     preferredContactMethod, source: "VoiceAgent"`
3. Copy the agent id into `PUBLIC_ELEVENLABS_AGENT_ID` and redeploy.

Prefer Hume end-to-end? Swap the widget for Hume's web SDK later — the CRM contract is identical.

## Lead flow

Both modes land in the same pipeline the website form uses:
`POST /api/v1/crm/leads` → admin app **Leads** page (status pipeline, notes, stats by source —
you'll see exactly how many jobs the voice agent books).
