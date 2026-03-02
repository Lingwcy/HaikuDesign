import * as React from "react"

/**
 * AlertDialog 样式变体
 * - shadcn: 现代简洁风格，类似 shadcn/ui
 * - haiku: HaikuDesign 设计系统风格
 */
export type AlertDialogVariant = "shadcn" | "haiku"

/**
 * AlertDialog 尺寸
 * - sm: 小尺寸
 * - md: 中等尺寸（默认）
 * - lg: 大尺寸
 */
export type AlertDialogSize = "sm" | "md" | "lg"

/**
 * AlertDialog 根组件属性
 */
export interface AlertDialogProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 受控模式：控制对话框是否打开 */
  open?: boolean
  /** 受控模式：对话框打开状态变化回调 */
  onOpenChange?: (open: boolean) => void
  /** 非受控模式：默认是否打开 */
  defaultOpen?: boolean
  /** 样式变体：shadcn 或 haiku */
  variant?: AlertDialogVariant
  /** 子组件 */
  children?: React.ReactNode
}

/**
 * AlertDialogTrigger 触发器属性
 */
export interface AlertDialogTriggerProps extends Omit<React.HTMLAttributes<HTMLButtonElement>, "children"> {
  /** 是否将子元素合并到触发器中 */
  asChild?: boolean
  /** 子元素，可以是普通节点或函数（render props 模式） */
  children?: React.ReactNode | ((props: { open: boolean }) => React.ReactNode)
}

/**
 * AlertDialogPortal 属性
 */
export interface AlertDialogPortalProps {
  /** 子元素 */
  children?: React.ReactNode
}

/**
 * AlertDialogOverlay 遮罩层属性
 */
export type AlertDialogOverlayProps = React.HTMLAttributes<HTMLDivElement>

/**
 * AlertDialogContent 内容区域属性
 */
export interface AlertDialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 对话框尺寸 */
  size?: AlertDialogSize
  /** 按下 Escape 键时的回调 */
  onEscapeKeyDown?: (event: KeyboardEvent) => void
  /** 点击遮罩层外部时的回调 */
  onPointerDownOutside?: (event: PointerEvent) => void
}

/**
 * AlertDialogHeader 头部区域属性
 */
export type AlertDialogHeaderProps = React.HTMLAttributes<HTMLDivElement>

/**
 * AlertDialogFooter 底部区域属性
 */
export type AlertDialogFooterProps = React.HTMLAttributes<HTMLDivElement>

/**
 * AlertDialogTitle 标题属性
 */
export type AlertDialogTitleProps = React.HTMLAttributes<HTMLHeadingElement>

/**
 * AlertDialogDescription 描述属性
 */
export type AlertDialogDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

/**
 * AlertDialogAction 确认按钮属性
 */
export type AlertDialogActionProps = React.ButtonHTMLAttributes<HTMLButtonElement>

/**
 * AlertDialogCancel 取消按钮属性
 */
export type AlertDialogCancelProps = React.ButtonHTMLAttributes<HTMLButtonElement>
