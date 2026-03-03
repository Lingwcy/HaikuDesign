import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"
import { Icon } from "@iconify/react"
import type { Toast, ToastOptions, ToastType, ToastId, ToastPosition } from "./types"

// 全局 toast 管理器
type ToastHandler = (message: React.ReactNode, options?: ToastOptions) => void

interface ToastManager {
  addToast: (message: React.ReactNode, options?: ToastOptions) => ToastId
  dismiss: (id?: ToastId) => void
  remove: (id: ToastId) => void
  subscribe: (handler: ToastHandler) => () => void
}

const toastManager: ToastManager = (() => {
  let handlers: Set<ToastHandler> = new Set()

  return {
    addToast: (message: React.ReactNode, options?: ToastOptions) => {
      const id = generateId()
      handlers.forEach((handler) => handler(message, { ...options, __intId__: id }))
      return id
    },
    dismiss: (id?: ToastId) => {
      handlers.forEach((handler) => handler("", { __intDismiss__: true, __intId__: id } as ToastOptions))
    },
    remove: (id: ToastId) => {
      handlers.forEach((handler) => handler("", { __intRemove__: id } as ToastOptions))
    },
    subscribe: (handler: ToastHandler) => {
      handlers.add(handler)
      return () => handlers.delete(handler)
    },
  }
})()

let toastId = 0
function generateId(): ToastId {
  return ++toastId
}

/**
 * Toast 样式变体
 */
const toastVariants = cva(
  "pointer-events-auto relative flex w-full items-center justify-between gap-2 overflow-hidden rounded-lg p-4 shadow-lg transition-all",
  {
    variants: {
      variant: {
        primary: "shadow-md",
        default: "border",
        filled: "",
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
    },
    compoundVariants: [
      // primary (实心阴影)
      { variant: "primary", color: "default", className: "bg-zinc-900 text-white" },
      { variant: "primary", color: "primary", className: "bg-primary-900 text-primary-foreground" },
      { variant: "primary", color: "danger", className: "bg-danger text-white" },
      { variant: "primary", color: "info", className: "bg-info text-white" },
      { variant: "primary", color: "success", className: "bg-success text-white" },
      { variant: "primary", color: "warning", className: "bg-warning text-white" },

      // default (边框轮廓)
      { variant: "default", color: "default", className: "bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800" },
      { variant: "default", color: "primary", className: "bg-white border-primary-200 dark:bg-zinc-900 dark:border-primary-800" },
      { variant: "default", color: "danger", className: "bg-white border-danger/30 dark:bg-zinc-900" },
      { variant: "default", color: "info", className: "bg-white border-info/30 dark:bg-zinc-900" },
      { variant: "default", color: "success", className: "bg-white border-success/30 dark:bg-zinc-900" },
      { variant: "default", color: "warning", className: "bg-white border-warning/30 dark:bg-zinc-900" },

      // filled (浅色填充)
      { variant: "filled", color: "default", className: "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100" },
      { variant: "filled", color: "primary", className: "bg-primary-100 text-primary-900 dark:bg-primary-900/40 dark:text-primary-100" },
      { variant: "filled", color: "danger", className: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
      { variant: "filled", color: "info", className: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
      { variant: "filled", color: "success", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
      { variant: "filled", color: "warning", className: "bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },

      // text (无边框文字)
      { variant: "text", color: "default", className: "bg-transparent text-zinc-900 dark:text-zinc-100" },
      { variant: "text", color: "primary", className: "bg-transparent text-primary-900 dark:text-primary-100" },
      { variant: "text", color: "danger", className: "bg-transparent text-red-700 dark:text-red-400" },
      { variant: "text", color: "info", className: "bg-transparent text-blue-700 dark:text-blue-400" },
      { variant: "text", color: "success", className: "bg-transparent text-emerald-700 dark:text-emerald-400" },
      { variant: "text", color: "warning", className: "bg-transparent text-amber-800 dark:text-amber-400" },
    ],
    defaultVariants: {
      variant: "default",
      color: "default",
    },
  }
)

// 扩展 ToastOptions 以支持内部使用
interface InternalToastOptions extends ToastOptions {
  __intId__?: ToastId
  __intDismiss__?: boolean
  __intRemove__?: ToastId
}

/**
 * Toast 类型到颜色的映射
 */
const toastTypeToColor: Record<ToastType, "default" | "primary" | "danger" | "info" | "success" | "warning"> = {
  default: "default",
  success: "success",
  info: "info",
  warning: "warning",
  error: "danger",
}

/**
 * Toast 类型到图标的映射
 */
const toastTypeToIcon: Record<ToastType, string> = {
  default: "lucide:info",
  success: "lucide:check-circle",
  info: "lucide:info",
  warning: "lucide:alert-triangle",
  error: "lucide:x-circle",
}

/**
 * 单个 Toast 项组件
 */
function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast
  onDismiss: () => void
}) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [isLeaving, setIsLeaving] = React.useState(false)

  React.useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))
  }, [])

  React.useEffect(() => {
    if (toast.duration <= 0) return
    const timer = setTimeout(() => {
      setIsLeaving(true)
      setTimeout(onDismiss, 300)
    }, toast.duration)
    return () => clearTimeout(timer)
  }, [toast.duration, onDismiss])

  const handleDismiss = () => {
    setIsLeaving(true)
    setTimeout(onDismiss, 300)
  }

  const color = toastTypeToColor[toast.type]
  const icon = toastTypeToIcon[toast.type]

  return (
    <div
      className={cn(
        toastVariants({ variant: "default", color }),
        isVisible && !isLeaving && "animate-in slide-in-from-bottom-full",
        isLeaving && "animate-out fade-out",
        "max-w-sm z-[100]"
      )}
      role="alert"
    >
      {icon && (
        <Icon
          icon={icon}
          className={cn(
            "h-5 w-5 shrink-0",
            color === "default" && "text-zinc-500",
            color === "primary" && "text-primary-500",
            color === "danger" && "text-red-500",
            color === "info" && "text-blue-500",
            color === "success" && "text-emerald-500",
            color === "warning" && "text-amber-500"
          )}
        />
      )}
      <div className="flex-1 min-w-0">
        {toast.title && <div className="font-medium">{toast.title}</div>}
        {toast.description && (
          <div className={cn("text-sm opacity-90", toast.title && "mt-1")}>
            {toast.description}
          </div>
        )}
      </div>
      {toast.action && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            toast.action?.onClick()
          }}
          className="text-sm font-medium underline-offset-4 hover:underline shrink-0"
        >
          {toast.action.label}
        </button>
      )}
      <button
        onClick={handleDismiss}
        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="关闭"
      >
        <Icon icon="lucide:x" className="h-4 w-4" />
      </button>
    </div>
  )
}

// 默认位置
const DEFAULT_POSITION: ToastPosition = "bottom-right"

/**
 * Toast 内部 Provider
 */
function ToastInnerProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])
  const defaultPosition = DEFAULT_POSITION

  // 订阅 toast 事件
  React.useEffect(() => {
    const handler = (message: React.ReactNode, options?: InternalToastOptions) => {
      // 处理 dismiss
      if (options?.__intDismiss__) {
        if (options.__intId__ === 0) {
          setToasts([])
        } else {
          setToasts((prev) => prev.filter((t) => t.id !== options.__intId__))
        }
        return
      }

      // 处理 remove
      if (options?.__intRemove__ !== undefined) {
        setToasts((prev) => prev.filter((t) => t.id !== options.__intRemove__))
        return
      }

      // 添加新 toast
      const id = options?.__intId__ || generateId()
      const newToast: Toast = {
        id,
        type: options?.type || "default",
        title: options?.title || message,
        description: options?.description,
        action: options?.action,
        onClose: options?.onClose,
        duration: options?.duration ?? 4000,
        position: options?.position || defaultPosition,
      }

      setToasts((prev) => [...prev, newToast])
    }

    const unsubscribe = toastManager.subscribe(handler)
    return unsubscribe
  }, [])

  const remove = React.useCallback((id: ToastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // 按位置分组渲染
  const positions: ToastPosition[] = ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"]

  return (
    <>
      {children}
      {positions.map((position) => {
        const positionToasts = toasts.filter((t) => t.position === position)
        if (positionToasts.length === 0) return null

        const isTop = position.includes("top")
        const isLeft = position.includes("left")
        const isRight = position.includes("right")
        const isCenter = position.includes("center")

        return (
          <div
            key={position}
            className={cn(
              "fixed flex flex-col gap-2",
              isTop ? "top-4" : "bottom-4",
              isLeft && "left-4",
              isRight && "right-4",
              isCenter && "left-1/2 -translate-x-1/2"
            )}
          >
            {positionToasts.map((t) => (
              <ToastItem key={t.id} toast={t} onDismiss={() => remove(t.id)} />
            ))}
          </div>
        )
      })}
    </>
  )
}

/**
 * ToastProvider 组件
 * 需要在应用根组件中包裹
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <ToastInnerProvider>{children}</ToastInnerProvider>
}

/**
 * toast 函数
 */
function createToast() {
  return (message: React.ReactNode, options?: ToastOptions): ToastId => {
    return toastManager.addToast(message, options)
  }
}

export const toast = Object.assign(createToast(), {
  success: (message: React.ReactNode, options?: ToastOptions): ToastId => {
    return toastManager.addToast(message, { ...options, type: "success" })
  },
  info: (message: React.ReactNode, options?: ToastOptions): ToastId => {
    return toastManager.addToast(message, { ...options, type: "info" })
  },
  warning: (message: React.ReactNode, options?: ToastOptions): ToastId => {
    return toastManager.addToast(message, { ...options, type: "warning" })
  },
  error: (message: React.ReactNode, options?: ToastOptions): ToastId => {
    return toastManager.addToast(message, { ...options, type: "error" })
  },
  promise: <T,>(promise: Promise<T>, options: {
    loading: string
    success: string | ((data: T) => string)
    error: string | ((error: unknown) => string)
  }): Promise<T> => {
    toast(options.loading, { type: "default", duration: Infinity })
    return promise
      .then((data) => {
        const msg = typeof options.success === "function" ? options.success(data) : options.success
        toast.success(msg)
        return data
      })
      .catch((error) => {
        const msg = typeof options.error === "function" ? options.error(error) : options.error
        toast.error(msg)
        throw error
      })
  },
  dismiss: (id?: ToastId) => {
    toastManager.dismiss(id ?? 0)
  },
  remove: (id: ToastId) => {
    toastManager.remove(id)
  },
})
