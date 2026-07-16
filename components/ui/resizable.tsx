"use client"

import * as ResizablePrimitive from "react-resizable-panels"
import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
      {...props}
    />
  )
}

const ResizablePanel = ResizablePrimitive.Panel

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      className={cn(
        "relative flex items-center justify-center bg-transparent outline-none transition-colors",
        // vertical group (horizontal handle)
        "data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
        // horizontal group (vertical handle)
        "w-px",
        "after:absolute after:inset-0 after:z-10 after:bg-line",
        "data-[panel-group-direction=horizontal]:after:mx-[-3px] data-[panel-group-direction=horizontal]:after:w-[7px]",
        "data-[panel-group-direction=vertical]:after:my-[-3px] data-[panel-group-direction=vertical]:after:h-[7px]",
        "hover:after:bg-line-strong data-[resize-handle-state=drag]:after:bg-accent-soft",
        className,
      )}
      {...props}
    >
      {withHandle ? (
        <div className="z-20 flex h-8 w-[3px] items-center justify-center rounded-full bg-line-strong data-[panel-group-direction=vertical]:h-[3px] data-[panel-group-direction=vertical]:w-8" />
      ) : null}
    </ResizablePrimitive.PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
