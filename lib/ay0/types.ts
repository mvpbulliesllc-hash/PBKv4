export type Ay0Mode = "single" | "swarm" | "team" | "cron"

export type Ay0SkillSummary = {
  name: string
  description: string
  source: "workspace" | "operator"
}

export type Ay0LoadedSkill = Ay0SkillSummary & {
  instructions: string
}

export type Ay0ToolStatus = {
  id: string
  label: string
  boundary: "apex-only"
  configured: boolean
  configuration: string
}
