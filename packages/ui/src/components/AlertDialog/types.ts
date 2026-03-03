import * as React from "react"

/**
 * AlertDialog 样式变体
 * - primary: 主要样式（实心背景）
 * - default: 默认样式（边框轮廓）
 * - filled: 填充样式（浅色背景）
 * - text: 文字样式（无边框）
 */
export type AlertDialogVariant = "primary" | "default" | "filled" | "text"

/**
 * AlertDialog 颜色
 * - default: 默认灰色
 * - primary: 主色（品牌色）
 * - danger: 危险色（删除操作）
 * - info: 信息色
 * - success: 成功色
 * - warning: 警告色
 */
export type AlertDialogColor = "default" | "primary" | "danger" | "info" | "success" | "warning"

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
  /** 样式变体 */
  variant?: AlertDialogVariant
  /** 颜色主题 */
  color?: AlertDialogColor
  /** 尺寸 */
  size?: AlertDialogSize
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
