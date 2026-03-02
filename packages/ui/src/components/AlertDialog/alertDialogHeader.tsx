import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * AlertDialogHeader 头部区域组件
 * 布局组件，用于包裹标题和描述
 * - 移动端：居中显示
 * - 桌面端：左对齐显示
 */
export function AlertDialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
}
