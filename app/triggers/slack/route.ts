import { after, NextResponse } from "next/server"
import { verifyVercelOidcToken } from "@vercel/oidc"
import { runAy0Model } from "@/lib/ay0/model-chat"
import { postSlackMessage } from "@/lib/slack/connect"

export const dynamic = "force-dynamic"
export const maxDuration = 60

type SlackEvent = {
  type?: string
  subtype?: string
  bot_id?: string
  channel?: string
  channel_type?: string
  text?: string
  ts?: string
  thread_ts?: string
  user?: string
}

type SlackEnvelope = {
  type?: string
  challenge?: string
  event_id?: string
  event?: SlackEvent
}

const recentEvents = new Map<string, number>()

async function verifyConnect(request: Request) {
  const authorization = request.headers.get("authorization") || ""
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1]?.trim()
  if (!token) throw new Error("Missing Vercel Connect attestation.")
  await verifyVercelOidcToken(token)
}

function rememberEvent(eventId: string) {
  const now = Date.now()
  for (const [id, seenAt] of recentEvents) {
    if (now - seenAt > 10 * 60_000) recentEvents.delete(id)
  }
  if (recentEvents.has(eventId)) return false
  recentEvents.set(eventId, now)
  return true
}

function cleanPrompt(text: string) {
  return text.replace(/<@[A-Z0-9]+>/gi, "").trim().slice(0, 4_000)
}

async function respondToSlack(event: SlackEvent) {
  if (!event.channel || !event.ts || !event.text || event.bot_id || event.subtype) return
  const shouldRespond = event.type === "app_mention" || (event.type === "message" && event.channel_type === "im")
  if (!shouldRespond) return
  const prompt = cleanPrompt(event.text)
  if (!prompt) return
  const result = await runAy0Model("openai", prompt)
  await postSlackMessage(event.channel, result.text, event.thread_ts || event.ts)
}

export async function POST(request: Request) {
  const body = await request.text()
  try {
    await verifyConnect(request)
  } catch {
    return NextResponse.json({ error: "Invalid Vercel Connect attestation." }, { status: 401 })
  }

  let payload: SlackEnvelope
  try {
    payload = JSON.parse(body) as SlackEnvelope
  } catch {
    return NextResponse.json({ error: "Invalid Slack payload." }, { status: 400 })
  }

  if (payload.type === "url_verification" && payload.challenge) {
    return NextResponse.json({ challenge: payload.challenge })
  }

  if (payload.event && (!payload.event_id || rememberEvent(payload.event_id))) {
    after(async () => {
      try {
        await respondToSlack(payload.event!)
      } catch (error) {
        console.error("Slack trigger processing failed", error instanceof Error ? error.message : "unknown error")
      }
    })
  }

  return NextResponse.json({ ok: true })
}
