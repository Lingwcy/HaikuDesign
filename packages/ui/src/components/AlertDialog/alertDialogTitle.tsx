import * as React from "react"
import { cn } from "../../lib/utils"
import { useAlertDialogContext } from "./alertDialog"

/**
 * 标题样式变体
 */
const titleVariants = {
  // shadcn 风格：较大字号
  shadcn: "text-lg font-semibold",
  // haiku 风格：默认字号
  haiku: "text-base font-semibold text-default",
}

/**
 * AlertDialogTitle 对话框标题组件
 * 显示对话框的主标题
 */
export function AlertDialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  const { variant } = useAlertDialogContext()

  return <h2 className={cn(titleVariants[variant], className)} {...props} />
}
