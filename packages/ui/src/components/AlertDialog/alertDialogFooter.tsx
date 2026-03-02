import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * AlertDialogFooter 底部区域组件
 * 布局组件，用于包裹取消和确认按钮
 * - 移动端：按钮垂直排列，取消按钮在下方
 * - 桌面端：按钮水平排列，确认按钮在右侧
 */
export function AlertDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2", className)}
      {...props}
    />
  )
}
