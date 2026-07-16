"use client"

import { useState } from "react"
import { DashboardHome } from "./dashboard-home"
import { Workbench } from "./workbench"

/**
 * Client shell that owns the home ↔ workbench toggle.
 * Rendered by the RSC page.tsx after auth is confirmed server-side.
 */
export function HomeShell() {
  const [inPlatform, setInPlatform] = useState(false)

  if (inPlatform) return <Workbench />

  return <DashboardHome onEnter={() => setInPlatform(true)} />
}
