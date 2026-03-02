import * as React from "react"
import { cn } from "../../lib/utils"
import { useAlertDialogContext } from "./alertDialog"

/**
 * 遮罩层样式变体
 */
const overlayVariants = {
  // shadcn 风格：半透明黑色背景，带动画
  shadcn: "fixed inset-0 z-50 bg-black/80",
  // haiku 风格：半透明黑色背景 + 背景模糊效果
  haiku: "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm",
}

/**
 * AlertDialogOverlay 遮罩层组件
 * 覆盖在对话框下方，背景变暗，点击可关闭对话框
 */
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
