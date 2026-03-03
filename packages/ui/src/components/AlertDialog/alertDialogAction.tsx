import * as React from "react"
import { Button } from "../Button"
import { useAlertDialogContext } from "./alertDialog"

// 继承 Button 的属性，排除 color 属性（因为按钮颜色由 AlertDialog 主题决定）
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AlertDialogActionProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {}

/**
 * AlertDialogAction 确认按钮组件
 * 点击后执行确认操作并关闭对话框
 * 使用 primary variant 样式，颜色继承 AlertDialog 的 color 主题
 *
 * @example
 * <AlertDialogAction>确认删除</AlertDialogAction>
 */
export function AlertDialogAction({ className, onClick, ...props }: AlertDialogActionProps) {
  const { color, onOpenChange } = useAlertDialogContext()

  // 处理点击事件：先执行自定义回调，然后关闭对话框
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    onOpenChange(false)
  }

  // 使用 primary variant，颜色继承 AlertDialog 的 color 主题
  // 如果 color 为 default，则使用 primary 作为默认颜色（表示主要操作）
  return (
    <Button
      variant="primary"
      color={color === "default" ? "primary" : color}
      className={className}
      onClick={handleClick}
      {...props}
    />
  )
}
