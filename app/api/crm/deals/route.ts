import { NextResponse } from "next/server"
import { z } from "zod"
import { createDeal, listDeals } from "@/lib/db/crm"
import { isOperatorRequest } from "@/lib/operator-auth"

export const dynamic = "force-dynamic"

const dealInput = z.object({
  title: z.string().trim().min(1).max(240),
  company: z.string().trim().max(240).optional(),
  contactId: z.uuid().optional(),
  pipelineId: z.uuid().optional(),
  stageId: z.uuid().optional(),
  amountCents: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).optional(),
  currency: z.string().trim().length(3).transform((value) => value.toUpperCase()).optional(),
  status: z.enum(["open", "won", "lost"]).optional(),
  expectedCloseDate: z.iso.date().optional(),
  ownerEmail: z.email().max(320).optional(),
  source: z.string().trim().max(120).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

function denied() {
  return NextResponse.json({ error: "Operator authorization required." }, { status: 403 })
}

export async function GET(request: Request) {
  if (!isOperatorRequest(request)) return denied()
  try {
    const limit = Number(new URL(request.url).searchParams.get("limit") ?? "50")
    return NextResponse.json({ deals: await listDeals(Number.isFinite(limit) ? limit : 50) })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "CRM unavailable." }, { status: 503 })
  }
}

export async function POST(request: Request) {
  if (!isOperatorRequest(request)) return denied()
  const parsed = dealInput.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid deal.", issues: parsed.error.issues }, { status: 400 })

  try {
    return NextResponse.json({ deal: await createDeal(parsed.data) }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Deal could not be created." }, { status: 503 })
  }
}
