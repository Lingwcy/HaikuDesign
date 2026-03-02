import * as React from "react"
import { Button } from "../Button"
import { useAlertDialogContext } from "./alertDialog"

// 继承 Button 的属性，排除 color 和 variant（因为按钮样式由 AlertDialog 样式变体决定）
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AlertDialogCancelProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color" | "variant"> {}

/**
 * AlertDialogCancel 取消按钮组件
 * 点击后取消操作并关闭对话框
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

  // 根据样式变体选择不同的按钮样式
  if (variant === "shadcn") {
    return (
      <Button variant="text" className={className} onClick={handleClick} {...props} />
    )
  }

  // haiku 风格：默认按钮样式
  return (
    <Button variant="default" color="default" className={className} onClick={handleClick} {...props} />
  )
}
