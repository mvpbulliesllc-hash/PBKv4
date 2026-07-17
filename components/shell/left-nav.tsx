"use client"

import { useState } from "react"
import { ChevronsUpDown, PanelLeftClose, Plus, Search, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { HUBS, NAV_SECTIONS, NAV_FOOTER, type NavItem } from "./nav-config"
import type { ModuleId } from "./module-registry"
import { BrandIcon } from "./brand-icon"

const TENANTS = ["EcoMVP LLC", "Skal Ventures", "Paragon Group", "MVP Management"]

export function LeftNav({
  active,
  onSelect,
  onCollapse,
  hubId,
  onHubChange,
  onOpenModule,
}: {
  active: string
  onSelect: (id: string) => void
  onCollapse: () => void
  hubId: string
  onHubChange: (id: string) => void
  onOpenModule: (id: ModuleId) => void
}) {
  const [tenant, setTenant] = useState(TENANTS[0])
  const [tenantOpen, setTenantOpen] = useState(false)
  const [hubOpen, setHubOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [workspaceDraft, setWorkspaceDraft] = useState("")
  const [chatCount, setChatCount] = useState(1)

  const hub = HUBS.find((h) => h.id === hubId) ?? HUBS[0]
  const HubIcon = hub.icon

  function handleRailClick(item: NavItem) {
    onSelect(item.id)
    if (item.module) onOpenModule(item.module)
  }

  return (
    <div className="gloss flex h-full flex-col border-r border-line">
      {/* Tenant switcher */}
      <div className="relative shrink-0 p-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTenantOpen((v) => !v)}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-2 text-left transition-colors hover:bg-hover"
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-md bg-accent text-[11px] font-semibold text-void">
              {tenant.slice(0, 2).toUpperCase()}
            </span>
            <span className="truncate text-sm font-medium text-text">{tenant}</span>
            <ChevronsUpDown className="ml-auto size-3.5 shrink-0 text-text-faint" />
          </button>
          <button
            onClick={onCollapse}
            title="Collapse sidebar"
            className="grid size-8 shrink-0 place-items-center rounded-md text-text-muted transition-colors hover:bg-hover hover:text-text"
          >
            <PanelLeftClose className="size-4" />
          </button>
        </div>

        {tenantOpen ? (
          <div className="absolute inset-x-2 top-full z-30 mt-1 overflow-hidden rounded-lg border border-line-strong bg-elevated p-1 shadow-2xl shadow-black/60">
            {TENANTS.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTenant(t)
                  setTenantOpen(false)
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-text-muted transition-colors hover:bg-hover hover:text-text"
              >
                <span className="grid size-5 shrink-0 place-items-center rounded bg-hover text-[9px] font-semibold text-text">
                  {t.slice(0, 2).toUpperCase()}
                </span>
                <span className="truncate">{t}</span>
                {t === tenant ? <Check className="ml-auto size-3.5 text-accent" /> : null}
              </button>
            ))}
            <div className="my-1 h-px bg-line" />
            <button
              onClick={() => {
                const label = workspaceDraft.trim()
                if (label) setTenant(label)
                setWorkspaceDraft("")
                setTenantOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-text-muted transition-colors hover:bg-hover hover:text-text"
            >
              <Plus className="size-3.5" />
              New workspace
            </button>
            <input
              value={workspaceDraft}
              onChange={(event) => setWorkspaceDraft(event.target.value)}
              placeholder="Workspace name"
              className="mt-1 w-full rounded-md border border-line bg-void px-2 py-1 text-xs text-text placeholder:text-text-faint focus:outline-none"
            />
          </div>
        ) : null}
      </div>

      {/* New chat + search */}
      <div className="shrink-0 space-y-1.5 px-2 pb-2">
        <button
          onClick={() => {
            setChatCount((count) => count + 1)
            onSelect(`chat-${chatCount + 1}`)
          }}
          className="gloss-elevated flex w-full items-center gap-2 rounded-md border border-line px-2.5 py-2 text-sm font-medium text-text transition-colors hover:border-line-strong"
        >
          <Plus className="size-4" />
          New Chat
        </button>
        <button
          onClick={() => setSearchOpen((value) => !value)}
          className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-text-muted transition-colors hover:bg-hover hover:text-text"
        >
          <Search className="size-4" />
          Search
        </button>
        {searchOpen ? (
          <input
            autoFocus
            placeholder="Search workspace..."
            className="w-full rounded-md border border-line bg-void px-2.5 py-1.5 text-xs text-text placeholder:text-text-faint focus:outline-none"
          />
        ) : null}
      </div>

      {/* HUB switcher — fixed tabs, directly below search */}
      <div className="relative shrink-0 px-2 pb-2">
        <button
          onClick={() => setHubOpen((v) => !v)}
          className="flex w-full items-center gap-2 rounded-md border border-line bg-void px-2.5 py-2 text-left transition-colors hover:border-line-strong"
        >
          <HubIcon className="size-4 shrink-0 text-accent" />
          <span className="flex-1 truncate text-sm font-medium text-text">{hub.label}</span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-text-faint" />
        </button>

        {hubOpen ? (
          <div className="absolute inset-x-2 top-full z-30 mt-1 overflow-hidden rounded-lg border border-line-strong bg-elevated p-1 shadow-2xl shadow-black/60">
            {HUBS.map((h) => {
              const Icon = h.icon
              return (
                <button
                  key={h.id}
                  onClick={() => {
                    onHubChange(h.id)
                    setHubOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                    h.id === hubId ? "bg-hover text-text" : "text-text-muted hover:bg-hover hover:text-text",
                  )}
                >
                  <Icon className={cn("size-4", h.id === hubId ? "text-accent" : "text-text-faint")} />
                  <span className="flex-1 truncate">{h.label}</span>
                  {h.id === hubId ? <Check className="size-3.5 text-accent" /> : null}
                </button>
              )
            })}
          </div>
        ) : null}
      </div>

      {/* Scroll region: hub rail + global nav */}
      <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {/* Active hub's quick-glance rail */}
        {hub.rail.map((section) => (
          <div key={section.id} className="mb-3">
            {section.title ? (
              <p className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-widest text-text-faint">
                {section.title}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = active === item.id
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleRailClick(item)}
                      className={cn(
                        "group flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                        isActive ? "bg-hover text-text" : "text-text-muted hover:bg-hover/60 hover:text-text",
                      )}
                    >
                      {item.brand ? (
                        <BrandIcon slug={item.brand} size={16} className="shrink-0" />
                      ) : (
                        <Icon
                          className={cn(
                            "size-4 shrink-0",
                            isActive ? "text-accent" : "text-text-faint group-hover:text-text-muted",
                          )}
                        />
                      )}
                      <span className="truncate">{item.label}</span>
                      {item.badge ? (
                        <span className="ml-auto rounded bg-elevated px-1.5 py-0.5 text-[10px] text-text-muted">
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

        <div className="my-2 h-px bg-line" />

        {/* Global platform nav */}
        {NAV_SECTIONS.map((section) => (
          <div key={section.id} className="mb-3">
            {section.title ? (
              <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-text-faint">
                {section.title}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = active === item.id
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleRailClick(item)}
                      className={cn(
                        "group flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                        isActive ? "bg-hover text-text" : "text-text-muted hover:bg-hover/60 hover:text-text",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          isActive ? "text-accent" : "text-text-faint group-hover:text-text-muted",
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-line p-2">
        {NAV_FOOTER.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => handleRailClick(item)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                active === item.id ? "bg-hover text-text" : "text-text-muted hover:bg-hover hover:text-text",
              )}
            >
              <Icon className="size-4 text-text-faint" />
              {item.label}
            </button>
          )
        })}
        <div className="mt-2 flex items-center gap-2 rounded-md px-2 py-1.5">
          <span className="size-6 shrink-0 rounded-full bg-elevated" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-text">ecoaisolutions</p>
            <p className="truncate text-[10px] text-text-faint">Operator</p>
          </div>
          <span className="rounded bg-elevated px-1.5 py-0.5 text-[10px] text-text-muted">$14</span>
        </div>
      </div>
    </div>
  )
}
