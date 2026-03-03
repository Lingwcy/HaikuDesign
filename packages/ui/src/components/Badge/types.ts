import * as React from "react"

/**
 * Badge 样式变体
 * - primary: 实心阴影样式（主要强调）
 * - default: 边框轮廓样式（默认）
 * - filled: 浅色填充样式（次要信息）
 * - text: 无边框文字样式（轻量标签）
 */
export type BadgeVariant = "primary" | "default" | "filled" | "text"

/**
 * Badge 颜色
 * - default: 默认灰色
 * - primary: 主色（品牌色）
 * - danger: 危险色（错误、删除）
 * - info: 信息色（提示）
 * - success: 成功色
 * - warning: 警告色
 */
export type BadgeColor = "default" | "primary" | "danger" | "info" | "success" | "warning"

/**
 * Badge 尺寸
 * - sm: 小尺寸
 * - md: 中等尺寸（默认）
 * - lg: 大尺寸
 */
export type BadgeSize = "sm" | "md" | "lg"

/**
 * Badge 组件属性
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 样式变体 */
  variant?: BadgeVariant
  /** 颜色主题 */
  color?: BadgeColor
  /** 尺寸 */
  size?: BadgeSize
  /** 子元素 */
  children?: React.ReactNode
}
