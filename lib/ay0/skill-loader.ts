import "server-only"

import { readdir, readFile, realpath } from "node:fs/promises"
import { homedir } from "node:os"
import { basename, delimiter, join, resolve } from "node:path"
import type { Ay0LoadedSkill, Ay0SkillSummary } from "./types"

const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MAX_SKILL_BYTES = 256_000

type SkillRecord = Ay0SkillSummary & { path: string }

function skillRoots() {
  const configured = (process.env.AY0_SKILL_DIRS ?? "")
    .split(delimiter)
    .map((value) => value.trim())
    .filter(Boolean)

  return [
    { path: resolve(process.cwd(), "skills"), source: "workspace" as const },
    { path: join(homedir(), ".agents", "skills"), source: "operator" as const },
    ...configured.map((path) => ({ path: resolve(path), source: "operator" as const })),
  ]
}

function parseFrontmatter(content: string) {
  if (!content.startsWith("---\n")) return null
  const end = content.indexOf("\n---\n", 4)
  if (end < 0) return null
  const values = new Map<string, string>()
  for (const line of content.slice(4, end).split("\n")) {
    const separator = line.indexOf(":")
    if (separator < 1) continue
    const key = line.slice(0, separator).trim()
    const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "")
    values.set(key, value)
  }
  return { values, body: content.slice(end + 5).trim() }
}

async function discoverRoot(root: ReturnType<typeof skillRoots>[number]) {
  try {
    const canonicalRoot = await realpath(root.path)
    const entries = await readdir(canonicalRoot, { withFileTypes: true })
    const skills = await Promise.all(entries.filter((entry) => entry.isDirectory()).map(async (entry) => {
      const path = join(canonicalRoot, entry.name, "SKILL.md")
      try {
        const canonicalSkill = await realpath(path)
        if (!canonicalSkill.startsWith(`${canonicalRoot}/`)) return null
        const content = await readFile(canonicalSkill, "utf8")
        if (Buffer.byteLength(content) > MAX_SKILL_BYTES) return null
        const parsed = parseFrontmatter(content)
        const name = parsed?.values.get("name") ?? ""
        const description = parsed?.values.get("description") ?? ""
        if (!SKILL_NAME.test(name) || name.length > 64 || name !== basename(entry.name)) return null
        if (!description || description.length > 1_024) return null
        return { name, description, source: root.source, path: canonicalSkill } satisfies SkillRecord
      } catch {
        return null
      }
    }))
    return skills.filter((skill): skill is SkillRecord => skill !== null)
  } catch {
    return []
  }
}

async function skillIndex() {
  const discovered = (await Promise.all(skillRoots().map(discoverRoot))).flat()
  const byName = new Map<string, SkillRecord>()
  for (const skill of discovered) {
    if (!byName.has(skill.name) || skill.source === "workspace") byName.set(skill.name, skill)
  }
  return byName
}

export async function listAy0Skills(): Promise<Ay0SkillSummary[]> {
  return [...(await skillIndex()).values()]
    .map(({ name, description, source }) => ({ name, description, source }))
    .sort((left, right) => left.name.localeCompare(right.name))
}

export async function loadAy0Skills(names: string[]): Promise<Ay0LoadedSkill[]> {
  const unique = [...new Set(names)].slice(0, 8)
  const index = await skillIndex()
  return Promise.all(unique.map(async (name) => {
    const skill = index.get(name)
    if (!skill) throw new Error(`Unknown or invalid skill: ${name}`)
    const content = await readFile(skill.path, "utf8")
    const parsed = parseFrontmatter(content)
    if (!parsed) throw new Error(`Invalid skill frontmatter: ${name}`)
    return { name: skill.name, description: skill.description, source: skill.source, instructions: parsed.body }
  }))
}
