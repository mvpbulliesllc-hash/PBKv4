import "server-only"

import { put } from "@vercel/blob"
import { randomUUID } from "node:crypto"

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024

function safeFilename(filename: string) {
  const cleaned = filename.normalize("NFKC").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "")
  return cleaned.slice(-180) || "file"
}

export async function uploadCrmFile(file: File, tenantId: string) {
  if (file.size <= 0) throw new Error("The upload is empty.")
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("The upload exceeds the 25 MB server limit.")

  const token = process.env.pbk4_READ_WRITE_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN
  const storeId = process.env.pbk4_STORE_ID ?? process.env.BLOB_STORE_ID
  if (!token && !(process.env.VERCEL_OIDC_TOKEN && storeId)) {
    throw new Error("Vercel Blob is not configured.")
  }

  const pathname = `crm/${tenantId}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeFilename(file.name)}`
  return put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type || undefined,
    token,
    storeId,
  })
}
