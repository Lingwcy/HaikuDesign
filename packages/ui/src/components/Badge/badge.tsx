import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import type { BadgeProps, BadgeVariant, BadgeColor, BadgeSize } from "./types"

/**
 * Badge 样式变体
 * 使用 class-variance-authority 定义 variant + color + size 组合样式
 */
const badgeVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300",
  {
    variants: {
      variant: {
        // primary: 实心阴影样式，主要强调
        primary: "shadow-sm",
        // default: 边框轮廓样式
        default: "border",
        // filled: 浅色填充样式
        filled: "",
        // text: 无边框文字样式
        text: "",
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
        sm: "h-5 px-1.5 text-xs gap-0.5",
        md: "h-6 px-2 text-sm gap-1",
        lg: "h-7 px-2.5 text-sm gap-1",
      },
    },
    compoundVariants: [
      // primary (实心阴影)
      {
        variant: "primary",
        color: "default",
        className: "bg-zinc-900 text-white shadow-sm hover:bg-zinc-800",
      },
      {
        variant: "primary",
        color: "primary",
        className: "bg-primary-900 text-primary-foreground shadow-sm hover:bg-primary-800",
      },
      {
        variant: "primary",
        color: "danger",
        className: "bg-danger text-white shadow-sm hover:bg-danger/90",
      },
      {
        variant: "primary",
        color: "info",
        className: "bg-info text-white shadow-sm hover:bg-info/90",
      },
      {
        variant: "primary",
        color: "success",
        className: "bg-success text-white shadow-sm hover:bg-success/90",
      },
      {
        variant: "primary",
        color: "warning",
        className: "bg-warning text-white shadow-sm hover:bg-warning/90",
      },

      // default (边框轮廓)
      {
        variant: "default",
        color: "default",
        className: "border-zinc-300 text-zinc-900 dark:border-zinc-600 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800",
      },
      {
        variant: "default",
        color: "primary",
        className: "border-primary-300 text-primary-900 dark:border-primary-700 dark:text-primary-100 hover:bg-primary-100 dark:hover:bg-primary-900/30",
      },
      {
        variant: "default",
        color: "danger",
        className: "border-danger-foreground/50 text-danger hover:bg-danger-50 dark:hover:bg-danger-foreground/10",
      },
      {
        variant: "default",
        color: "info",
        className: "border-info-foreground/50 text-info hover:bg-info-50 dark:hover:bg-info-foreground/10",
      },
      {
        variant: "default",
        color: "success",
        className: "border-success-foreground/50 text-success hover:bg-success-50 dark:hover:bg-success-foreground/10",
      },
      {
        variant: "default",
        color: "warning",
        className: "border-warning-foreground/50 text-warning hover:bg-warning-50 dark:hover:bg-warning-foreground/10",
      },

      // filled (浅色填充)
      {
        variant: "filled",
        color: "default",
        className: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
      },
      {
        variant: "filled",
        color: "primary",
        className: "bg-primary-100 text-primary-900 hover:bg-primary-200 dark:bg-primary-900/40 dark:text-primary-100 dark:hover:bg-primary-900/60",
      },
      {
        variant: "filled",
        color: "danger",
        className: "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50",
      },
      {
        variant: "filled",
        color: "info",
        className: "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50",
      },
      {
        variant: "filled",
        color: "success",
        className: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50",
      },
      {
        variant: "filled",
        color: "warning",
        className: "bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50",
      },

      // text (无边框文字)
      {
        variant: "text",
        color: "default",
        className: "text-zinc-900 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800",
      },
      {
        variant: "text",
        color: "primary",
        className: "text-primary-900 hover:bg-primary-100 dark:text-primary-100 dark:hover:bg-primary-900/30",
      },
      {
        variant: "text",
        color: "danger",
        className: "text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20",
      },
      {
        variant: "text",
        color: "info",
        className: "text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20",
      },
      {
        variant: "text",
        color: "success",
        className: "text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20",
      },
      {
        variant: "text",
        color: "warning",
        className: "text-amber-800 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20",
      },
    ],
    defaultVariants: {
      variant: "default",
      color: "default",
      size: "md",
    },
  }
)

/**
 * Badge 标签组件
 * 用于显示状态、计数、分类等小标签
 *
 * @example
 * // 基本用法
 * <Badge>标签</Badge>
 *
 * @example
 * // 带颜色
 * <Badge color="danger">危险</Badge>
 *
 * @example
 * // 带变体
 * <Badge variant="filled" color="success">成功</Badge>
 */
export function Badge({
  className,
  variant = "default",
  color = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, color, size }), className)}
      data-slot="badge"
      {...props}
    >
      {children}
    </span>
  )
}
