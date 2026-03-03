import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { useAlertDialogContext } from "./alertDialog"

/**
 * 标题样式变体
 */
const titleVariants = cva("font-semibold", {
  variants: {
    variant: {
      primary: "text-lg",
      default: "text-base",
      filled: "text-base",
      text: "text-base",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

/**
 * AlertDialogTitle 对话框标题组件
 * 显示对话框的主标题
 */
export function AlertDialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  const { variant } = useAlertDialogContext()

  return <h2 className={cn(titleVariants({ variant }), className)} {...props} />
}
