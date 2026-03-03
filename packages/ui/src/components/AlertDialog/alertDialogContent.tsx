import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { Icon } from "@iconify/react"
import { useAlertDialogContext } from "./alertDialog"
import { AlertDialogPortal } from "./alertDialogPortal"
import { AlertDialogOverlay } from "./alertDialogOverlay"
import type { AlertDialogSize } from "./types"
import { Button } from "../Button"

/**
 * 对话框内容样式变体
 */
const alertDialogContentVariants = cva("", {
  variants: {
    variant: {
      primary: "bg-white dark:bg-zinc-900 border border-primary-200 dark:border-primary-800",
      default: "bg-white dark:bg-zinc-900 border border-default",
      filled: "bg-zinc-100 dark:bg-zinc-800 border-transparent",
      text: "bg-transparent border-transparent shadow-none",
    },
    color: {
      default: "",
      primary: "",
      danger: "",
      info: "",
      success: "",
      warning: "",
    },
    size: {
      sm: "max-w-xs",
      md: "max-w-sm",
      lg: "max-w-md",
    },
  },
  defaultVariants: {
    variant: "default",
    color: "default",
    size: "md",
  },
})

/**
 * AlertDialogContent 对话框内容区域组件
 * 包含对话框的主要内容和关闭按钮
 */
export function AlertDialogContent({
  className,
  children,
  showClose = true,
  size,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  onEscapeKeyDown,
  onPointerDownOutside,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  /** 是否显示右上角关闭按钮 */
  showClose?: boolean
  /** 对话框尺寸（覆盖 AlertDialog 的 size） */
  size?: AlertDialogSize
  /** 点击遮罩层是否关闭对话框 */
  closeOnOverlayClick?: boolean
  /** 按 ESC 是否关闭对话框 */
  closeOnEscape?: boolean
  /** 按下 ESC 键时的回调 */
  onEscapeKeyDown?: (event: KeyboardEvent) => void
  /** 点击对话框外部时的回调 */
  onPointerDownOutside?: (event: PointerEvent) => void
}) {
  const { open, variant, color, size: contextSize, onOpenChange } = useAlertDialogContext()
  // 使用传入的 size 或继承父组件的 size
  const finalSize = size ?? contextSize ?? "md"
  // 引用对话框内容元素，用于判断点击是否在内容区域内
  const contentRef = React.useRef<HTMLDivElement>(null)

  // 处理 ESC 键关闭
  React.useEffect(() => {
    if (!open || !closeOnEscape) return

    const handleEscape = (event: KeyboardEvent) => {
      onEscapeKeyDown?.(event)
      if (!event.defaultPrevented) {
        onOpenChange(false)
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [open, closeOnEscape, onOpenChange, onEscapeKeyDown])

  // 处理点击对话框外部关闭
  React.useEffect(() => {
    if (!open || !closeOnOverlayClick) return

    const handlePointerDownOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (contentRef.current?.contains(target)) {
        return
      }

      onPointerDownOutside?.(event as unknown as PointerEvent)
      if (!event.defaultPrevented) {
        onOpenChange(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDownOutside)
    return () => document.removeEventListener("mousedown", handlePointerDownOutside)
  }, [open, closeOnOverlayClick, onOpenChange, onPointerDownOutside])

  if (!open) return null

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <div
        ref={contentRef}
        className={cn(
          // 定位样式
          "fixed left-[50%] top-[50%] z-50 w-full translate-x-[-50%] translate-y-[-50%] p-5 shadow-xl",
          // 变体样式
          alertDialogContentVariants({ variant, color, size: finalSize }),
          // 响应式圆角
          "rounded-xl sm:rounded-2xl",
          className
        )}
        role="alertdialog"
        aria-modal="true"
        {...props}
      >
        {children}
        {/* 关闭按钮 */}
        {showClose && (
          <Button
            variant="text"
            size="sm"
            className="absolute right-3 top-3"
            onClick={() => onOpenChange(false)}
            aria-label="关闭"
          >
            <Icon icon="lucide:x" className="h-4 w-4" />
          </Button>
        )}
      </div>
    </AlertDialogPortal>
  )
}
