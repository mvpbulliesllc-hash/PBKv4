import "server-only"

import { timingSafeEqual } from "node:crypto"
import { isLocalAgentRequest } from "./local-agent-server"

function equalSecret(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

/**
 * Returns true when the request comes from the same origin as this deployment.
 * Covers browser-originated fetch calls (same-origin) and server-to-server calls
 * within the same Vercel project (VERCEL_URL / VERCEL_BRANCH_URL).
 */
function isSameOriginRequest(request: Request): boolean {
  const reqUrl = new URL(request.url)

  // Collect the set of trusted hostnames for this deployment
  const trusted = new Set<string>([
    reqUrl.hostname, // the host that received this request
  ])

  // Vercel injects these; prefer VERCEL_URL for edge, VERCEL_BRANCH_URL for branch previews
  for (const key of ["VERCEL_URL", "VERCEL_BRANCH_URL", "VERCEL_PROJECT_PRODUCTION_URL"]) {
    const val = process.env[key]
    if (val) {
      try {
        trusted.add(new URL(val.startsWith("http") ? val : `https://${val}`).hostname)
      } catch {
        // ignore malformed values
      }
    }
  }

  // Check the Origin header (set by browsers for same-origin fetch)
  const origin = request.headers.get("origin")
  if (origin) {
    try {
      return trusted.has(new URL(origin).hostname)
    } catch {
      return false
    }
  }

  // Check the Referer header as a fallback
  const referer = request.headers.get("referer")
  if (referer) {
    try {
      return trusted.has(new URL(referer).hostname)
    } catch {
      return false
    }
  }

  // No origin/referer: allow if request host matches (e.g. server-side fetch without headers)
  return false
}

export function isOperatorRequest(request: Request): boolean {
  // 1. Always allow loopback in development
  if (isLocalAgentRequest(request)) return true

  // 2. Bearer token — the strongest explicit credential; check first when configured
  const configured = process.env.PBKV4_INTERNAL_API_TOKEN
  if (configured) {
    const authorization = request.headers.get("authorization")
    if (authorization?.startsWith("Bearer ")) {
      return equalSecret(authorization.slice("Bearer ".length), configured)
    }
  }

  // 3. Same-origin browser request — allows the UI to talk to its own CRM routes
  //    without requiring a client-visible token.  Skip when an explicit token is
  //    configured (forces callers to present credentials).
  if (!configured && isSameOriginRequest(request)) return true

  return false
}
