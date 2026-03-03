import * as React from "react"
import { Button } from "../Button"
import { useAlertDialogContext } from "./alertDialog"
import type { AlertDialogVariant } from "./types"

// 继承 Button 的属性，排除 color 和 variant（因为按钮样式由 AlertDialog 样式变体决定）
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AlertDialogCancelProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color" | "variant"> {}

/**
 * AlertDialogCancel 取消按钮组件
 * 点击后取消操作并关闭对话框
 * 使用 variant 继承 AlertDialog 的样式变体，color 默认为 default
 *
 * @example
 * <AlertDialogCancel>取消</AlertDialogCancel>
 */
export function AlertDialogCancel({ className, onClick, ...props }: AlertDialogCancelProps) {
  const { variant, onOpenChange } = useAlertDialogContext()

  // 处理点击事件：先执行自定义回调，然后关闭对话框
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    onOpenChange(false)
  }

  // 取消按钮的样式映射：
  // primary/filled variant -> 使用 filled 样式的 default 颜色（次要操作）
  // default/text variant -> 使用 default 样式的 default 颜色（边框轮廓）
  const getCancelVariant = (): AlertDialogVariant => {
    switch (variant) {
      case "primary":
      case "filled":
        return "filled"
      default:
        return "default"
    }
  }

  return (
    <Button
      variant={getCancelVariant()}
      color="default"
      className={className}
      onClick={handleClick}
      {...props}
    />
  )
}
