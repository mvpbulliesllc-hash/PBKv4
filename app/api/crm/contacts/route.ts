import { NextResponse } from "next/server"
import { z } from "zod"
import { createContact, listContacts } from "@/lib/db/crm"
import { isOperatorRequest } from "@/lib/operator-auth"

export const dynamic = "force-dynamic"

const contactInput = z.object({
  displayName: z.string().trim().min(1).max(240),
  firstName: z.string().trim().max(120).optional(),
  lastName: z.string().trim().max(120).optional(),
  email: z.email().max(320).optional(),
  phone: z.string().trim().max(64).optional(),
  company: z.string().trim().max(240).optional(),
  jobTitle: z.string().trim().max(180).optional(),
  status: z.enum(["lead", "qualified", "customer", "inactive"]).optional(),
  source: z.string().trim().max(120).optional(),
  ownerEmail: z.email().max(320).optional(),
  tags: z.array(z.string().trim().min(1).max(80)).max(30).optional(),
  notes: z.string().trim().max(10_000).optional(),
  externalRef: z.string().trim().max(180).optional(),
})

function denied() {
  return NextResponse.json({ error: "Operator authorization required." }, { status: 403 })
}

export async function GET(request: Request) {
  if (!isOperatorRequest(request)) return denied()
  try {
    const limit = Number(new URL(request.url).searchParams.get("limit") ?? "50")
    return NextResponse.json({ contacts: await listContacts(Number.isFinite(limit) ? limit : 50) })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "CRM unavailable." }, { status: 503 })
  }
}

export async function POST(request: Request) {
  if (!isOperatorRequest(request)) return denied()
  const parsed = contactInput.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid contact.", issues: parsed.error.issues }, { status: 400 })

  try {
    return NextResponse.json({ contact: await createContact(parsed.data) }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Contact could not be created." }, { status: 503 })
  }
}
