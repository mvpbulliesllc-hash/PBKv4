import {
  MessagesSquare,
  Bot,
  FolderGit2,
  Palette,
  Terminal,
  Sparkles,
  Plug,
  Cable,
  Webhook,
  Boxes,
  Settings,
  Home,
  Briefcase,
  Landmark,
  Share2,
  Mail,
  MessageCircle,
  Phone,
  Contact,
  NotebookPen,
  HardDrive,
  Inbox,
  Video,
  Users,
  Workflow,
  ScanSearch,
  Archive,
  Sheet,
  FileText,
  BookOpen,
  type LucideIcon,
} from "lucide-react"
import type { ModuleId } from "./module-registry"
import type { BrandSlug } from "./brand-icon"

export type NavItem = {
  id: string
  label: string
  icon: LucideIcon
  badge?: string
  /** If set, selecting this item opens the module in the main surface. */
  module?: ModuleId
  /** If set, the rail renders the real brand logo instead of the lucide icon. */
  brand?: BrandSlug
}

export type NavSection = {
  id: string
  title?: string
  items: NavItem[]
}

/** Fixed hubs — the switcher lives in the left rail, directly below Search. */
export type Hub = {
  id: string
  label: string
  icon: LucideIcon
  /** Quick-glance rail shown in the left pane while this hub is active. */
  rail: NavSection[]
}

export const HUBS: Hub[] = [
  {
    id: "workspace",
    label: "Work Space",
    icon: Briefcase,
    rail: [
      {
        id: "pipeline",
        title: "Pipeline",
        items: [
          { id: "ws-pipeline", label: "CRM · Inbound · Outbound", icon: Workflow, module: "pipeline", badge: "79" },
        ],
      },
      {
        id: "comms",
        title: "Comms",
        items: [
          { id: "ws-gmail", label: "Gmail", icon: Mail, module: "gmail", badge: "12", brand: "gmail" },
          { id: "ws-gchat", label: "Google Chat", icon: MessageCircle, module: "gchat", brand: "google-chat" },
          { id: "ws-gvoice", label: "Google Voice", icon: Phone, module: "gvoice", brand: "google-voice" },
          { id: "ws-messages", label: "Message Hub", icon: Inbox, module: "messages", badge: "5" },
        ],
      },
      {
        id: "office",
        title: "Virtual Office",
        items: [
          { id: "ws-office", label: "Office / Rooms", icon: Users, module: "office" },
          { id: "ws-meet", label: "Meet & Zoom", icon: Video, module: "meet", brand: "google-meet" },
        ],
      },
      {
        id: "knowledge",
        title: "Knowledge",
        items: [
          { id: "ws-contacts", label: "Contacts / CRM", icon: Contact, module: "contacts" },
          { id: "ws-notion", label: "NotebookLM", icon: NotebookPen, module: "notion", brand: "notion" },
          { id: "ws-drive", label: "Drive", icon: HardDrive, module: "drive", brand: "google-drive" },
        ],
      },
    ],
  },
  {
    id: "financial",
    label: "Financial",
    icon: Landmark,
    rail: [
      {
        id: "fin",
        title: "Ledger",
        items: [
          { id: "fin-dash", label: "Dashboard", icon: Landmark, module: "analytics" },
          { id: "fin-receipts", label: "Receipt Intake", icon: Inbox, module: "files" },
        ],
      },
    ],
  },
  {
    id: "research",
    label: "Research",
    icon: ScanSearch,
    rail: [
      {
        id: "res-tools",
        title: "Brief & Scrape",
        items: [
          { id: "res-brief", label: "Research Brief", icon: ScanSearch, module: "brief" },
          { id: "res-assets", label: "Asset Vault", icon: Archive, module: "assets" },
        ],
      },
      {
        id: "res-docs",
        title: "Sheets & Docs",
        items: [
          { id: "res-sheets", label: "Sheets", icon: Sheet, module: "sheets", brand: "google-sheets" },
          { id: "res-docs", label: "Docs", icon: FileText, module: "docs", brand: "google-docs" },
          { id: "res-nb", label: "NotebookLM", icon: BookOpen, module: "notion", brand: "notion" },
          { id: "res-drive", label: "Drive", icon: HardDrive, module: "drive", brand: "google-drive" },
        ],
      },
    ],
  },
  {
    id: "social",
    label: "Social",
    icon: Share2,
    rail: [
      {
        id: "soc",
        title: "Channels",
        items: [{ id: "soc-feed", label: "Feeds", icon: Share2, module: "social" }],
      },
    ],
  },
  {
    id: "creative",
    label: "Creative",
    icon: Sparkles,
    rail: [
      {
        id: "cre",
        title: "Studio",
        items: [{ id: "cre-image", label: "Image Gen", icon: Sparkles, module: "image" }],
      },
    ],
  },
  {
    id: "dev",
    label: "Dev",
    icon: Terminal,
    rail: [
      {
        id: "dev",
        title: "Toolchain",
        items: [
          { id: "dev-term", label: "Terminal", icon: Terminal, module: "terminal" },
          { id: "dev-files", label: "Files", icon: FolderGit2, module: "files" },
        ],
      },
    ],
  },
]

/** Global nav shown under every hub's rail. */
export const NAV_SECTIONS: NavSection[] = [
  {
    id: "primary",
    title: "Platform",
    items: [
      { id: "home", label: "Home", icon: Home },
      { id: "projects", label: "Projects", icon: FolderGit2, module: "files" },
      { id: "chats", label: "Chats", icon: MessagesSquare, module: "messages" },
      { id: "agents", label: "Agents", icon: Bot, module: "connectors" },
      { id: "design", label: "Design System", icon: Palette, module: "config" },
    ],
  },
  {
    id: "platform",
    title: "System",
    items: [
      { id: "integrations", label: "Integrations", icon: Plug, module: "connectors" },
      { id: "connectors", label: "Connectors", icon: Cable, module: "connectors" },
      { id: "api", label: "API & Webhooks", icon: Webhook, module: "webhooks" },
      { id: "skills", label: "Skills Hub", icon: Boxes, module: "env" },
    ],
  },
]

export const NAV_FOOTER: NavItem[] = [{ id: "settings", label: "Settings", icon: Settings, module: "config" }]
