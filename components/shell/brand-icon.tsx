"use client"

import { cn } from "@/lib/utils"

/** Slugs must match a file in /public/brands/{slug}.svg */
export type BrandSlug =
  | "gmail"
  | "google-chat"
  | "google-voice"
  | "google-drive"
  | "google-meet"
  | "google-sheets"
  | "google-docs"
  | "zoom"
  | "notion"
  | "slack"
  | "telegram"
  | "whatsapp"
  | "instagram"
  | "linkedin"
  | "stripe"
  | "hubspot"

/** Brands whose marks are dark/monochrome and need a light chip to stay visible on obsidian. */
const NEEDS_CHIP = new Set<BrandSlug>(["notion"])

export function BrandIcon({
  slug,
  size = 16,
  className,
  chip,
}: {
  slug: BrandSlug
  size?: number
  className?: string
  /** Force the light chip background. Auto-enabled for dark marks. */
  chip?: boolean
}) {
  const useChip = chip ?? NEEDS_CHIP.has(slug)
  return (
    <span
      className={cn(
        "inline-grid shrink-0 place-items-center overflow-hidden",
        useChip && "rounded-[4px] bg-text/90 p-0.5",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/brands/${slug}.svg`}
        alt=""
        width={useChip ? size - 4 : size}
        height={useChip ? size - 4 : size}
        className="block"
        draggable={false}
      />
    </span>
  )
}
