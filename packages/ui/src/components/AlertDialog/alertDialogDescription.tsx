import * as React from "react"
import { cn } from "../../lib/utils"
import { useAlertDialogContext } from "./alertDialog"

const descriptionVariants = {
  shadcn: "text-sm text-muted-foreground",
  haiku: "text-sm text-zinc-500 dark:text-zinc-400",
}

export function AlertDialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { variant } = useAlertDialogContext()

  return <p className={cn(descriptionVariants[variant], className)} {...props} />
}
