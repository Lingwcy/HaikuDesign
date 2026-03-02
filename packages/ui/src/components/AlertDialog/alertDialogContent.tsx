import * as React from "react"
import { cn } from "../../lib/utils"
import { Icon } from "@iconify/react"
import { useAlertDialogContext } from "./alertDialog"
import { AlertDialogPortal } from "./alertDialogPortal"
import { AlertDialogOverlay } from "./alertDialogOverlay"
import type { AlertDialogSize } from "./types"

/**
 * 内容区域尺寸样式
 */
const contentVariants = {
  shadcn: {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  },
  haiku: {
    sm: "max-w-xs",
    md: "max-w-sm",
    lg: "max-w-md",
  },
}

/**
 * 内容区域基础样式
 */
const contentBaseStyles = {
  // shadcn 风格
  shadcn: "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg",
  // haiku 风格
  haiku: "fixed left-[50%] top-[50%] z-50 w-full translate-x-[-50%] translate-y-[-50%] gap-3 rounded-xl border border-default bg-white p-5 shadow-xl dark:bg-zinc-900",
}

/**
 * AlertDialogContent 对话框内容区域组件
 * 包含对话框的主要内容和关闭按钮
 */
export function AlertDialogContent({
  className,
  children,
  showClose = true,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  onEscapeKeyDown,
  onPointerDownOutside,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  /** 是否显示右上角关闭按钮 */
  showClose?: boolean
  /** 对话框尺寸 */
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
  const { open, variant, onOpenChange } = useAlertDialogContext()
  // 引用对话框内容元素，用于判断点击是否在内容区域内
  const contentRef = React.useRef<HTMLDivElement>(null)

  // 处理 ESC 键关闭
  React.useEffect(() => {
    // 如果对话框未打开或不允许 ESC 关闭，则不添加监听
    if (!open || !closeOnEscape) return

    const handleEscape = (event: KeyboardEvent) => {
      // 先调用自定义回调
      onEscapeKeyDown?.(event)
      // 如果回调未阻止默认行为，则关闭对话框
      if (!event.defaultPrevented) {
        onOpenChange(false)
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [open, closeOnEscape, onOpenChange, onEscapeKeyDown])

  // 处理点击对话框外部关闭
  React.useEffect(() => {
    // 如果对话框未打开或不允许点击外部关闭，则不添加监听
    if (!open || !closeOnOverlayClick) return

    const handlePointerDownOutside = (event: MouseEvent) => {
      const target = event.target as Node
      // 检查点击是否在对话框内容区域内
      if (contentRef.current?.contains(target)) {
        return // 在内容区域内，不关闭
      }

      // 调用自定义回调
      onPointerDownOutside?.(event as unknown as PointerEvent)
      // 如果回调未阻止默认行为，则关闭对话框
      if (!event.defaultPrevented) {
        onOpenChange(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDownOutside)
    return () => document.removeEventListener("mousedown", handlePointerDownOutside)
  }, [open, closeOnOverlayClick, onOpenChange, onPointerDownOutside])

  // 如果对话框未打开，返回 null
  if (!open) return null

  return (
    <AlertDialogPortal>
      {/* 遮罩层 */}
      <AlertDialogOverlay />
      {/* 对话框内容 */}
      <div
        ref={contentRef}
        className={cn(
          contentBaseStyles[variant],
          contentVariants[variant][size],
          className
        )}
        role="alertdialog"
        aria-modal="true"
        {...props}
      >
        {children}
        {/* 关闭按钮 */}
        {showClose && (
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            aria-label="关闭"
          >
            <Icon icon="lucide:x" className="h-4 w-4" />
          </button>
        )}
      </div>
    </AlertDialogPortal>
  )
}
