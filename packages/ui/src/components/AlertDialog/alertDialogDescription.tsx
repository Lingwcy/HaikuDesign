import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { useAlertDialogContext } from "./alertDialog"

/**
 * 描述文字样式变体
 * 根据 AlertDialog 的 variant 和 color 主题显示不同的样式
 */
const descriptionVariants = cva("text-sm", {
  variants: {
    variant: {
      primary: "text-zinc-600 dark:text-zinc-300",
      default: "text-zinc-500 dark:text-zinc-400",
      filled: "text-zinc-600 dark:text-zinc-300",
      text: "text-zinc-500 dark:text-zinc-400",
    },
    color: {
      default: "",
      primary: "text-primary-700 dark:text-primary-300",
      danger: "text-danger dark:text-danger",
      info: "text-info dark:text-info",
      success: "text-success dark:text-success",
      warning: "text-warning dark:text-warning",
    },
  },
  defaultVariants: {
    variant: "default",
    color: "default",
  },
})

/**
 * AlertDialogDescription 对话框描述组件
 * 显示对话框的详细描述信息
 */
export function AlertDialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { variant, color } = useAlertDialogContext()

  return <p className={cn(descriptionVariants({ variant, color }), className)} {...props} />
}
