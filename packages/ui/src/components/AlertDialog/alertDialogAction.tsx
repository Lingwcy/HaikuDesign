import * as React from "react"
import { Button } from "../Button"
import { useAlertDialogContext } from "./alertDialog"

// 继承 Button 的属性，排除 color 属性（因为按钮样式由 variant 决定）
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AlertDialogActionProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {}

/**
 * AlertDialogAction 确认按钮组件
 * 点击后执行确认操作并关闭对话框
 *
 * @example
 * <AlertDialogAction color="danger">确认删除</AlertDialogAction>
 */
export function AlertDialogAction({ className, onClick, ...props }: AlertDialogActionProps) {
  const { variant, onOpenChange } = useAlertDialogContext()

  // 处理点击事件：先执行自定义回调，然后关闭对话框
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    onOpenChange(false)
  }

  // 根据样式变体选择不同的按钮样式
  if (variant === "shadcn") {
    return (
      <Button variant="default" className={className} onClick={handleClick} {...props} />
    )
  }

  // haiku 风格：主按钮样式
  return (
    <Button variant="primary" color="primary" className={className} onClick={handleClick} {...props} />
  )
}
