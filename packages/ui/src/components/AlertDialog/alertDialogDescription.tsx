import * as React from "react"
import { cn } from "../../lib/utils"
import { useAlertDialogContext } from "./alertDialog"

/**
 * 描述文字样式变体
 */
const descriptionVariants = {
  // shadcn 风格：使用 muted 前景色
  shadcn: "text-sm text-muted-foreground",
  // haiku 风格：灰色文字，支持暗色模式
  haiku: "text-sm text-zinc-500 dark:text-zinc-400",
}

/**
 * AlertDialogDescription 对话框描述组件
 * 显示对话框的详细描述信息
 */
export function AlertDialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { variant } = useAlertDialogContext()

  return <p className={cn(descriptionVariants[variant], className)} {...props} />
}
