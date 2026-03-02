import * as React from "react"
import { cn } from "../../lib/utils"
import { useAlertDialogContext } from "./alertDialog"

const overlayVariants = {
  shadcn: "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  haiku: "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm",
}

export function AlertDialogOverlay({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { variant } = useAlertDialogContext()

  return (
    <div
      className={cn(overlayVariants[variant], className)}
      data-slot="alert-dialog-overlay"
      {...props}
    />
  )
}
