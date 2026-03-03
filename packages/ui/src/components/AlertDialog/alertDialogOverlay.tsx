import * as React from "react"
import { cn } from "../../lib/utils"
import { useAlertDialogContext } from "./alertDialog"


/**
 * AlertDialogOverlay 遮罩层组件
 * 覆盖在对话框下方，背景变暗，点击可关闭对话框
 */
export function AlertDialogOverlay({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { color = "default" } = useAlertDialogContext()

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 backdrop-blur-sm",
        "bg-black/50",
        className
      )}
      data-slot="alert-dialog-overlay"
      {...props}
    />
  )
}
