import { NextResponse } from "next/server"
import { del } from "@vercel/blob"
import { getDatabase } from "@/lib/db/client"
import { resolveTenant } from "@/lib/db/crm"
import { attachments } from "@/lib/db/schema"
import { uploadCrmFile } from "@/lib/blob/storage"
import { isOperatorRequest } from "@/lib/operator-auth"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function POST(request: Request) {
  if (!isOperatorRequest(request)) {
    return NextResponse.json({ error: "Operator authorization required." }, { status: 403 })
  }

  const form = await request.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: "Multipart form data is required." }, { status: 400 })
  const file = form.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "A file is required." }, { status: 400 })

  const contactId = form.get("contactId")?.toString() || null
  const dealId = form.get("dealId")?.toString() || null
  const uploadedBy = form.get("uploadedBy")?.toString() || null

  let blob: Awaited<ReturnType<typeof uploadCrmFile>> | null = null
  try {
    const db = getDatabase()
    const tenant = await resolveTenant()
    blob = await uploadCrmFile(file, tenant.id)
    const [attachment] = await db.insert(attachments).values({
      tenantId: tenant.id,
      contactId,
      dealId,
      pathname: blob.pathname,
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      contentType: file.type || null,
      sizeBytes: file.size,
      uploadedBy,
    }).returning()
    return NextResponse.json({ attachment }, { status: 201 })
  } catch (error) {
    if (blob) await del(blob.url, { token: process.env.pbk4_READ_WRITE_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN }).catch(() => undefined)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 503 })
  }
}
