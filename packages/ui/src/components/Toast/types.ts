import * as React from "react"

/**
 * Toast 样式变体
 * - primary: 实心阴影样式（主要强调）
 * - default: 边框轮廓样式（默认）
 * - filled: 浅色填充样式（次要信息）
 * - text: 无边框文字样式（轻量提示）
 */
export type ToastVariant = "primary" | "default" | "filled" | "text"

/**
 * Toast 颜色
 * - default: 默认灰色
 * - primary: 主色（品牌色）
 * - danger: 危险色（错误）
 * - info: 信息色（提示）
 * - success: 成功色
 * - warning: 警告色
 */
export type ToastColor = "default" | "primary" | "danger" | "info" | "success" | "warning"

/**
 * Toast 位置
 */
export type ToastPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"

/**
 * Toast 类型
 */
export type ToastType = "default" | "success" | "info" | "warning" | "error"

/**
 * Toast 唯一标识
 */
export type ToastId = string | number

/**
 * Toast 加载状态（用于 promise toast）
 */
export type ToastLoadingState = "loading" | "success" | "error"

/**
 * Toast 配置选项
 */
export interface ToastOptions {
  /** Toast 类型 */
  type?: ToastType
  /** 标题 */
  title?: React.ReactNode
  /** 描述文字 */
  description?: React.ReactNode
  /** 操作按钮 */
  action?: {
    label: string
    onClick: () => void
  }
  /** 关闭按钮回调 */
  onClose?: () => void
  /** 显示时长（毫秒），默认 4000 */
  duration?: number
  /** 位置 */
  position?: ToastPosition
  /** 内部使用的 ID */
  __intId__?: ToastId
  /** 内部使用的 dismiss 标记 */
  __intDismiss__?: boolean
  /** 内部使用的 remove 标记 */
  __intRemove__?: ToastId
}

/**
 * Toast 实例
 */
export interface Toast {
  id: ToastId
  type: ToastType
  title?: React.ReactNode
  description?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  onClose?: () => void
  duration: number
  position: ToastPosition
  loadingState?: ToastLoadingState
}

/**
 * Toaster 组件属性
 */
export interface ToasterProps {
  /** toast 位置，与 toast() 中的 position 配合使用 */
  position?: ToastPosition
  /** 主题 */
  theme?: "light" | "dark" | "system"
}

/**
 * toast 函数类型
 */
export interface ToastFunction {
  (message: React.ReactNode, options?: ToastOptions): ToastId
  success(message: React.ReactNode, options?: ToastOptions): ToastId
  info(message: React.ReactNode, options?: ToastOptions): ToastId
  warning(message: React.ReactNode, options?: ToastOptions): ToastId
  error(message: React.ReactNode, options?: ToastOptions): ToastId
  promise<T>(promise: Promise<T>, options: {
    loading: string
    success: string | ((data: T) => string)
    error: string | ((error: unknown) => string)
  }): Promise<T>
  dismiss(id?: ToastId): void
  remove(id: ToastId): void
}
