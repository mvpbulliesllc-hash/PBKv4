/**
 * Eli voice endpoint — expressive TTS via Hume (https://dev.hume.ai).
 *
 * POST { text: string } → audio/mpeg
 *
 * Runs as a Vercel serverless function on the site's own origin, so the
 * Hume API key stays server-side (this repo is public — never commit keys).
 * Configure in Vercel → Settings → Environment Variables:
 *   HUME_API_KEY     required — Hume API key
 *   HUME_VOICE_NAME  optional — a Hume Voice Library / custom voice name;
 *                    when unset, Hume generates a voice from ELI_DESCRIPTION
 *   HUME_VOICE_ID    optional — takes precedence over HUME_VOICE_NAME
 *
 * Without HUME_API_KEY the endpoint returns 503 and the chat widget falls
 * back to browser speech synthesis — degraded, never broken.
 */

const ELI_DESCRIPTION =
  'Eli, a warm, upbeat woman in her early thirties from the Jersey Shore. ' +
  'A friendly, confident roofing company assistant: natural conversational pace, ' +
  'reassuring and helpful, never salesy or robotic.';

const MAX_TEXT = 1000;

// Per-instance response cache — greetings and canned answers repeat often.
const cache = new Map();
const CACHE_MAX = 50;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const apiKey = process.env.HUME_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'voice not configured' });

  const text = String((req.body && req.body.text) || '').replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT);
  if (!text) return res.status(400).json({ error: 'text required' });

  const cached = cache.get(text);
  if (cached) {
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('X-Voice-Cache', 'hit');
    return res.status(200).send(Buffer.from(cached));
  }

  const utterance = { text, description: ELI_DESCRIPTION };
  if (process.env.HUME_VOICE_ID) utterance.voice = { id: process.env.HUME_VOICE_ID };
  else utterance.voice = { name: process.env.HUME_VOICE_NAME || 'Ava Song', provider: 'HUME_AI' };

  try {
    const r = await fetch('https://api.hume.ai/v0/tts/file', {
      method: 'POST',
      headers: { 'X-Hume-Api-Key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ utterances: [utterance], format: { type: 'mp3' } }),
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      console.error('hume tts failed', r.status, detail.slice(0, 300));
      return res.status(502).json({ error: 'tts failed' });
    }
    const audio = Buffer.from(await r.arrayBuffer());
    if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
    cache.set(text, audio);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(audio);
  } catch (err) {
    console.error('hume tts error', err);
    return res.status(502).json({ error: 'tts failed' });
  }
};
