"use client";

import * as React from "react";
import { GripVerticalIcon } from "lucide-react";

import { cn } from "./utils";

const ResizablePanelGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="resizable-panel-group"
    className={cn("flex h-full w-full", className)}
    {...props}
  />
));
ResizablePanelGroup.displayName = "ResizablePanelGroup";

const ResizablePanel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => (
  <div ref={ref} data-slot="resizable-panel" {...props} />
));
ResizablePanel.displayName = "ResizablePanel";

const ResizableHandle = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    withHandle?: boolean;
  }
>(({ withHandle, className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="resizable-handle"
    className={cn(
      "bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden",
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
        <GripVerticalIcon className="size-2.5" />
      </div>
    )}
  </div>
));
ResizableHandle.displayName = "ResizableHandle";

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
