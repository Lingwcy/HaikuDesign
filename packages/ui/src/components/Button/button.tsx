import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { Icon } from "@iconify/react";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-primary-700 dark:focus-visible:ring-offset-zinc-950",
  {
    variants: {
      variant: {
        primary: "shadow-sm",
        default: "border shadow-sm",
        dashed: "border-2 border-dashed shadow-sm",
        filled: "",
        text: "",
        link: "underline-offset-4 hover:underline",
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
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 px-6 has-[>svg]:px-4",
      },
      shape: {
        default: "rounded-md",
        rounded: "rounded-full",
        square: "rounded-none",
      }
    },
    compoundVariants: [
      // primary (solid)
      {
        variant: "primary",
        color: "default",
        className: "bg-default text-white hover:bg-default",
      },
      {
        variant: "primary",
        color: "primary",
        className: "bg-primary-900 text-primary-foreground hover:bg-primary-800",
      },
      {
        variant: "primary",
        color: "danger",
        className: "bg-danger text-white hover:bg-danger",
      },
      {
        variant: "primary",
        color: "info",
        className: "bg-info text-white hover:bg-info",
      },
      {
        variant: "primary",
        color: "success",
        className: "bg-success text-white hover:bg-success",
      },
      {
        variant: "primary",
        color: "warning",
        className: "bg-warning text-white hover:bg-warning",
      },

      // default (outline)
      {
        variant: "default",
        color: "default",
        className:
          "bg-white text-default border-default hover:bg-default-foreground hover:border-default",
      },
      {
        variant: "default",
        color: "primary",
        className:
          "bg-white text-primary-900 border-primary-300 hover:bg-primary-100/60 ",
      },
      {
        variant: "default",
        color: "danger",
        className:
          "bg-white text-danger border-danger-foreground hover:bg-danger-50 hover:bg-danger-foreground/6",
      },
      {
        variant: "default",
        color: "info",
        className:
          "bg-white text-info border-info-300 hover:bg-info-foreground/6 border-info-foreground",
      },
      {
        variant: "default",
        color: "success",
        className:
          "bg-white text-success border-success-300 hover:bg-success-foreground/6 border-success-foreground",
      },
      {
        variant: "default",
        color: "warning",
        className:
          "bg-white text-warning border-warning-300 hover:bg-warning-foreground/6 border-warning-foreground",
      },

      // dashed (dashed outline)
      {
        variant: "dashed",
        color: "default",
        className:
          "bg-white text-default border-default hover:bg-default-foreground hover:border-default",
      },
      {
        variant: "dashed",
        color: "primary",
        className:
          "bg-white text-primary-900 border-primary-300 hover:bg-primary-foreground hover:border-primary-400",
      },
      {
        variant: "dashed",
        color: "danger",
        className:
          "bg-white text-danger border-danger-foreground hover:bg-danger-50 hover:border-danger-foreground",
      },
      {
        variant: "dashed",
        color: "info",
        className:
          "bg-white text-blue-700 border-blue-300 hover:bg-blue-50 hover:border-blue-400",
      },
      {
        variant: "dashed",
        color: "success",
        className:
          "bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50 hover:border-emerald-400",
      },
      {
        variant: "dashed",
        color: "warning",
        className:
          "bg-white text-amber-800 border-amber-300 hover:bg-amber-50 hover:border-amber-400",
      },

      // filled (tinted)
      {
        variant: "filled",
        color: "default",
        className: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
      },
      {
        variant: "filled",
        color: "primary",
        className: "bg-primary-100 text-primary-900 hover:bg-primary-200",
      },
      {
        variant: "filled",
        color: "danger",
        className: "bg-red-50 text-red-700 hover:bg-red-100",
      },
      {
        variant: "filled",
        color: "info",
        className: "bg-blue-50 text-blue-700 hover:bg-blue-100",
      },
      {
        variant: "filled",
        color: "success",
        className: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
      },
      {
        variant: "filled",
        color: "warning",
        className: "bg-amber-50 text-amber-800 hover:bg-amber-100",
      },

      // text (no border/bg)
      {
        variant: "text",
        color: "default",
        className: "text-zinc-900 hover:bg-zinc-100",
      },
      {
        variant: "text",
        color: "primary",
        className: "text-primary-900 hover:bg-primary-100",
      },
      {
        variant: "text",
        color: "danger",
        className: "text-red-700 hover:bg-red-50",
      },
      {
        variant: "text",
        color: "info",
        className: "text-blue-700 hover:bg-blue-50",
      },
      {
        variant: "text",
        color: "success",
        className: "text-emerald-700 hover:bg-emerald-50",
      },
      {
        variant: "text",
        color: "warning",
        className: "text-amber-800 hover:bg-amber-50",
      },

      // link (no border/bg)
      {
        variant: "link",
        color: "default",
        className: "text-zinc-900 hover:text-zinc-700",
      },
      {
        variant: "link",
        color: "primary",
        className: "text-primary-900 hover:text-primary-800",
      },
      {
        variant: "link",
        color: "danger",
        className: "text-red-700 hover:text-red-600",
      },
      {
        variant: "link",
        color: "info",
        className: "text-blue-700 hover:text-blue-600",
      },
      {
        variant: "link",
        color: "success",
        className: "text-emerald-700 hover:text-emerald-600",
      },
      {
        variant: "link",
        color: "warning",
        className: "text-amber-800 hover:text-amber-700",
      },
    ],
    defaultVariants: {
      variant: "default",
      color: "default",
      size: "default",
      shape: "default",
    },
  }
)

interface ButtonOwnProps {
  color?: "default" | "primary" | "danger" | "info" | "success" | "warning";
  loading?: boolean;
  icon?: React.ReactNode | string;
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> &
  ButtonOwnProps


function Button({
  className,
  variant = "default",
  size = "default",
  color,
  shape = "default",
  loading = false,
  disabled,
  children,
  icon,
  ...props
}: ButtonProps) {
  const resolvedColor = color ?? (variant === "primary" ? "primary" : "default")
  return (
    <button
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-color={resolvedColor}
      data-loading={loading ? "" : undefined}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(
        buttonVariants({ color: resolvedColor, variant, size, shape, className }),
        loading && "disabled:cursor-wait opacity-70"
      )}
      {...props}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : icon ? (
        typeof icon === "string" ? (
          <Icon icon={icon} width="16" height="16" />
        ) : (
          icon
        )
      ) : null}
      {children}
    </button>
  )
}

export { Button, buttonVariants }
