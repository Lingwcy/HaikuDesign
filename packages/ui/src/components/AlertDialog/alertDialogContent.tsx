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

const contentBaseStyles = {
  shadcn: "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg",
  haiku: "fixed left-[50%] top-[50%] z-50 w-full translate-x-[-50%] translate-y-[-50%] gap-3 rounded-xl border border-default bg-white p-5 shadow-xl dark:bg-zinc-900",
}

export function AlertDialogContent({
  className,
  children,
  showClose = true,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  onEscapeKeyDown,
  onPointerDownOutside,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  showClose?: boolean
  size?: AlertDialogSize
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  onEscapeKeyDown?: (event: KeyboardEvent) => void
  onPointerDownOutside?: (event: PointerEvent) => void
}) {
  const { open, variant, onOpenChange } = useAlertDialogContext()
  const contentRef = React.useRef<HTMLDivElement>(null)

  // Handle escape key
  React.useEffect(() => {
    if (!open || !closeOnEscape) return

    const handleEscape = (event: KeyboardEvent) => {
      onEscapeKeyDown?.(event)
      if (!event.defaultPrevented) {
        onOpenChange(false)
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [open, closeOnEscape, onOpenChange, onEscapeKeyDown])

  // Handle click outside
  React.useEffect(() => {
    if (!open || !closeOnOverlayClick) return

    const handlePointerDownOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (contentRef.current?.contains(target)) {
        return
      }

      onPointerDownOutside?.(event as unknown as PointerEvent)
      if (!event.defaultPrevented) {
        onOpenChange(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDownOutside)
    return () => document.removeEventListener("mousedown", handlePointerDownOutside)
  }, [open, closeOnOverlayClick, onOpenChange, onPointerDownOutside])

  if (!open) return null

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <div
        ref={contentRef}
        className={cn(
          contentBaseStyles[variant],
          contentVariants[variant][size],
          className
        )}
        role="alertdialog"
        aria-modal="true"
        {...props}
      >
        {children}
        {showClose && (
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            aria-label="Close"
          >
            <Icon icon="lucide:x" className="h-4 w-4" />
          </button>
        )}
      </div>
    </AlertDialogPortal>
  )
}
