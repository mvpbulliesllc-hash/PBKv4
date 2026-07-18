import "server-only"

import { readFileSync } from "node:fs"
import capabilityMap from "@/config/ay0-capabilities.json"

export type Ay0Seat = "Ay.0" | "runner"
export type CapabilityState = "env-ready" | "missing-env" | "denied" | "manual" | "quarantined" | "not-wired"

type EnvRequirement = string | string[]

type CapabilityEntry = {
  label: string
  env: EnvRequirement[]
  seats: string[]
  status: string
  probe?: string
}

const entries = capabilityMap.capabilities as Record<string, CapabilityEntry>

function parseEnvFile(content: string) {
  const values = new Map<string, string>()
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) continue
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!match) continue
    const [, name, rawValue] = match
    let value = rawValue.trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      const quote = value[0]
      value = value.slice(1, -1)
      if (quote === '"') value = value.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\")
    } else {
      value = value.replace(/\s+#.*$/, "").trim()
    }
    if (value) values.set(name, value)
  }
  return values
}

function vaultValues() {
  let path = process.env.AY0_SECRET_ENV_FILE?.trim()
  if (!path) {
    try {
      path = process.env.NODE_ENV === "production" ? "" : readFileSync(".ay0-vault-path", "utf8").trim()
    } catch {
      path = ""
    }
  }
  if (!path) return new Map<string, string>()
  try {
    return parseEnvFile(readFileSync(/* turbopackIgnore: true */ path, "utf8"))
  } catch {
    return new Map<string, string>()
  }
}

function resolveValue(name: string, vault: Map<string, string>) {
  return process.env[name] || vault.get(name) || ""
}

function envNames(requirement: EnvRequirement) {
  return Array.isArray(requirement) ? requirement : [requirement]
}

function canonicalEnvName(requirement: EnvRequirement) {
  return envNames(requirement)[0]
}

function resolveRequirement(requirement: EnvRequirement, vault: Map<string, string>) {
  for (const name of envNames(requirement)) {
    const value = resolveValue(name, vault)
    if (value) return value
  }
  return ""
}

function describeRequirement(requirement: EnvRequirement) {
  return envNames(requirement).join(" or ")
}

export function inspectCapability(capability: string, seat: Ay0Seat) {
  const entry = entries[capability]
  if (!entry) return { capability, label: capability, state: "not-wired" as const, missingEnv: [] as string[] }
  if (entry.status === "manual") return { capability, label: entry.label, state: "manual" as const, missingEnv: [] as string[] }
  if (entry.status === "quarantined") return { capability, label: entry.label, state: "quarantined" as const, missingEnv: [] as string[] }
  if (entry.status !== "live") return { capability, label: entry.label, state: "not-wired" as const, missingEnv: [] as string[] }
  if (!entry.seats.includes(seat)) return { capability, label: entry.label, state: "denied" as const, missingEnv: [] as string[] }
  const vault = vaultValues()
  const missingEnv = entry.env
    .filter((requirement) => !resolveRequirement(requirement, vault))
    .map(describeRequirement)
  return {
    capability,
    label: entry.label,
    state: missingEnv.length ? "missing-env" as const : "env-ready" as const,
    missingEnv,
  }
}

export function listCapabilities(seat: Ay0Seat) {
  return Object.keys(entries).map((capability) => inspectCapability(capability, seat))
}

export function getCapabilitySecrets(capability: string, seat: Ay0Seat) {
  const inspection = inspectCapability(capability, seat)
  if (inspection.state !== "env-ready") throw new Error(`Capability ${capability} is ${inspection.state}.`)
  const entry = entries[capability]
  const vault = vaultValues()
  return Object.fromEntries(entry.env.map((requirement) => [canonicalEnvName(requirement), resolveRequirement(requirement, vault)]))
}

export function getCapabilityProbe(capability: string) {
  return entries[capability]?.probe ?? null
}
