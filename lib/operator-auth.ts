import "server-only"

import { timingSafeEqual } from "node:crypto"
import { isLocalAgentRequest } from "./local-agent-server"

function equalSecret(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

export function isOperatorRequest(request: Request) {
  if (isLocalAgentRequest(request)) return true

  const configured = process.env.PBKV4_INTERNAL_API_TOKEN
  const authorization = request.headers.get("authorization")
  if (!configured || !authorization?.startsWith("Bearer ")) return false

  return equalSecret(authorization.slice("Bearer ".length), configured)
}
