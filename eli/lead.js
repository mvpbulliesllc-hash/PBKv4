/**
 * Eli lead endpoint — emails captured leads via AgentMail (https://agentmail.to).
 *
 * POST { name?, firstName?, lastName?, phone?, email?, address?, town?,
 *        service?, serviceType?, message?, ... } → { ok: true }
 *
 * Serves both lead sources on the site: the Ask Eli chat intake (POSTs here
 * first) and the Instant Quote calculator (via PUBLIC_LEADS_API). Any JSON
 * fields it receives are included in the email, so the two payload shapes —
 * and future ones — need no mapping.
 *
 * Configure in Vercel → Settings → Environment Variables:
 *   AGENTMAIL_API_KEY  required — AgentMail API key
 *   AGENTMAIL_INBOX    optional — sending inbox id (default eli-paragon@agentmail.to)
 *   LEAD_EMAIL_TO      optional — recipient (default the site owner)
 *
 * Unconfigured → 503; the chat widget then falls back to its CRM/mailto path.
 */

const DEFAULT_INBOX = 'eli-paragon@agentmail.to';
const DEFAULT_TO = 'j@ecoaisolutions.com';

const LABELS = {
  name: 'Name', firstName: 'First name', lastName: 'Last name', phone: 'Phone',
  email: 'Email', address: 'Address', town: 'Town', service: 'Service',
  serviceType: 'Service', timeline: 'Timeline', message: 'Details',
  landingPage: 'Landing page', referrer: 'Referrer', utmSource: 'UTM source',
  utmMedium: 'UTM medium', utmCampaign: 'UTM campaign', source: 'Source',
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, tenant');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const apiKey = process.env.AGENTMAIL_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'lead delivery not configured' });

  const lead = req.body && typeof req.body === 'object' ? req.body : {};
  if (lead.company) return res.status(200).json({ ok: true }); // honeypot — pretend success
  delete lead.company;

  const who = [lead.name || [lead.firstName, lead.lastName].filter(Boolean).join(' ')].filter(Boolean)[0] || 'Unknown';
  const what = lead.service || lead.serviceType || 'General';
  const hasContact = Boolean(lead.phone || lead.email);
  if (!hasContact) return res.status(400).json({ error: 'phone or email required' });

  const known = Object.keys(LABELS).filter((k) => lead[k]).map((k) => `${LABELS[k]}: ${String(lead[k]).slice(0, 500)}`);
  const extra = Object.keys(lead)
    .filter((k) => !(k in LABELS) && lead[k] && typeof lead[k] !== 'object')
    .map((k) => `${k}: ${String(lead[k]).slice(0, 500)}`);
  const text =
    `New lead from paragondemo.ecoaisolutions.com\n\n${known.join('\n')}` +
    (extra.length ? `\n\nOther fields:\n${extra.join('\n')}` : '') +
    `\n\nReceived: ${new Date().toISOString()}`;

  // Fan out to the back-office pipeline (Convex) — best-effort, never blocks the lead.
  const ingestUrl = process.env.CONVEX_INGEST_URL;
  if (ingestUrl) {
    try {
      await fetch(ingestUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-ingest-secret': process.env.CONVEX_INGEST_SECRET || '' },
        body: JSON.stringify(lead),
      });
    } catch (err) {
      console.error('convex ingest error', err);
    }
  }

  const inbox = process.env.AGENTMAIL_INBOX || DEFAULT_INBOX;
  try {
    const r = await fetch(`https://api.agentmail.to/v0/inboxes/${encodeURIComponent(inbox)}/messages/send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: [process.env.LEAD_EMAIL_TO || DEFAULT_TO],
        subject: `New lead — ${what} — ${who}`,
        text,
      }),
    });
    if (!r.ok) {
      console.error('agentmail send failed', r.status, (await r.text().catch(() => '')).slice(0, 300));
      return res.status(502).json({ error: 'lead delivery failed' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('agentmail send error', err);
    return res.status(502).json({ error: 'lead delivery failed' });
  }
};
