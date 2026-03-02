import * as React from "react"
import { cn } from "../../lib/utils"
import { useAlertDialogContext } from "./alertDialog"

const titleVariants = {
  shadcn: "text-lg font-semibold",
  haiku: "text-base font-semibold text-default",
}

export function AlertDialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  const { variant } = useAlertDialogContext()

  return <h2 className={cn(titleVariants[variant], className)} {...props} />
}
