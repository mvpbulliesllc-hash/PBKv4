import "server-only"

import { getToken, getTokenResponse } from "@vercel/connect"

export const SLACK_CONNECTOR = process.env.SLACK_CONNECTOR || "slack/pb-kv4"

const TOKEN_SCOPES = ["channels:history", "channels:read", "chat:write", "groups:history", "groups:read", "im:history", "im:read", "mpim:history", "mpim:read", "users:read"]

async function slackToken(scopes: string[]) {
  return getToken(SLACK_CONNECTOR, { subject: { type: "app" }, scopes })
}

async function slackRequest<T>(method: string, init: RequestInit & { scopes: string[] }) {
  const token = await slackToken(init.scopes)
  const response = await fetch(`https://slack.com/api/${method}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
      ...init.headers,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  })
  const payload = await response.json() as T & { ok?: boolean; error?: string }
  if (!response.ok || payload.ok === false) throw new Error(`Slack ${method} failed: ${payload.error || response.status}`)
  return payload
}

export async function inspectSlackConnection() {
  const token = await getTokenResponse(SLACK_CONNECTOR, { subject: { type: "app" }, scopes: ["team:read"] })
  const identity = await slackRequest<{ ok: true; team?: string; team_id?: string; bot_id?: string; user_id?: string }>("auth.test", {
    method: "POST",
    scopes: ["team:read"],
  })
  return {
    connector: token.connector.uid,
    installationId: token.installationId || null,
    workspace: token.name || identity.team || null,
    teamId: token.tenantId || identity.team_id || null,
    botUserId: identity.user_id || null,
    expiresAt: token.expiresAt,
  }
}

export async function listSlackChannels() {
  const payload = await slackRequest<{ ok: true; channels?: Array<{ id: string; name?: string; is_private?: boolean; is_member?: boolean }> }>("conversations.list", {
    method: "POST",
    scopes: TOKEN_SCOPES,
    body: JSON.stringify({ limit: 50, exclude_archived: true, types: "public_channel,private_channel" }),
  })
  return (payload.channels || []).map((channel) => ({
    id: channel.id,
    name: channel.name || channel.id,
    private: Boolean(channel.is_private),
    member: Boolean(channel.is_member),
  }))
}

export async function postSlackMessage(channel: string, text: string, threadTs?: string) {
  const payload = await slackRequest<{ ok: true; channel: string; ts: string }>("chat.postMessage", {
    method: "POST",
    scopes: ["chat:write"],
    body: JSON.stringify({ channel, text, thread_ts: threadTs, unfurl_links: false, unfurl_media: false }),
  })
  return { channel: payload.channel, ts: payload.ts }
}
