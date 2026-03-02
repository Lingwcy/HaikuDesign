import * as React from "react"
import { cn } from "../../lib/utils"
import { Icon } from "@iconify/react"
import { useAlertDialogContext } from "./alertDialog"
import { AlertDialogPortal } from "./alertDialogPortal"
import { AlertDialogOverlay } from "./alertDialogOverlay"
import type { AlertDialogSize } from "./types"

const contentVariants = {
  shadcn: {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  },
  haiku: {
    sm: "max-w-xs",
    md: "max-w-sm",
    lg: "max-w-md",
  },
}

const shadcnAnimation = "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"

const contentBaseStyles = {
  shadcn: "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
  haiku: "fixed left-[50%] top-[50%] z-50 w-full translate-x-[-50%] translate-y-[-50%] gap-3 rounded-xl border border-default bg-white p-5 shadow-xl duration-200 dark:bg-zinc-900",
}

export function AlertDialogContent({
  className,
  children,
  showClose = true,
  size = "md",
  onEscapeKeyDown,
  onPointerDownOutside,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  showClose?: boolean
  size?: AlertDialogSize
  onEscapeKeyDown?: (event: KeyboardEvent) => void
  onPointerDownOutside?: (event: PointerEvent) => void
}) {
  const { open, variant, onOpenChange } = useAlertDialogContext()

  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (open) {
        onEscapeKeyDown?.(event)
        if (!event.defaultPrevented) {
          onOpenChange(false)
        }
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [open, onOpenChange, onEscapeKeyDown])

  React.useEffect(() => {
    const handlePointerDownOutside = (event: PointerEvent) => {
      onPointerDownOutside?.(event)
      if (!event.defaultPrevented) {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener("pointerdown", handlePointerDownOutside)
      return () => document.removeEventListener("pointerdown", handlePointerDownOutside)
    }
  }, [open, onOpenChange, onPointerDownOutside])

  if (!open) return null

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <div
        className={cn(
          contentBaseStyles[variant],
          contentVariants[variant][size],
          variant === "shadcn" && shadcnAnimation,
          className
        )}
        role="alertdialog"
        aria-modal="true"
        {...props}
      >
        {children}
        {showClose && variant === "haiku" && (
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            aria-label="Close"
          >
            <Icon icon="lucide:x" className="h-4 w-4" />
          </button>
        )}
      </div>
    </AlertDialogPortal>
  )
}
