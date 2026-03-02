import * as React from "react"
import type { AlertDialogProps, AlertDialogTriggerProps, AlertDialogVariant } from "./types"

/**
 * AlertDialog 上下文值
 * 用于在子组件间共享状态
 */
interface AlertDialogContextValue {
  /** 对话框是否打开 */
  open: boolean
  /** 当前样式变体 */
  variant: AlertDialogVariant
  /** 打开状态变化回调 */
  onOpenChange: (open: boolean) => void
}

/**
 * AlertDialog 上下文
 * 提供给子组件访问对话框状态
 */
const AlertDialogContext = React.createContext<AlertDialogContextValue | null>(null)

/**
 * 使用 AlertDialog 上下文的 Hook
 * @throws 如果不在 AlertDialog 组件内使用，抛出错误
 */
function useAlertDialogContext() {
  const context = React.useContext(AlertDialogContext)
  if (!context) {
    throw new Error("AlertDialog components must be used within AlertDialog")
  }
  return context
}

/**
 * AlertDialog 根组件
 * 支持受控模式（open + onOpenChange）和非受控模式（defaultOpen）
 *
 * @example
 * // 受控模式
 * <AlertDialog open={open} onOpenChange={setOpen}>
 *   <AlertDialogContent>...</AlertDialogContent>
 * </AlertDialog>
 *
 * @example
 * // 非受控模式
 * <AlertDialog defaultOpen>
 *   <AlertDialogContent>...</AlertDialogContent>
 * </AlertDialog>
 */
export function AlertDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  defaultOpen = false,
  variant = "haiku",
  children,
}: AlertDialogProps) {
  // 非受控模式的内部状态
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)

  // 判断是否为受控模式
  const isControlled = controlledOpen !== undefined
  // 根据模式选择使用受控或非受控状态
  const open = isControlled ? controlledOpen : uncontrolledOpen

  // 处理状态变化的回调函数
  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      // 非受控模式时更新内部状态
      if (!isControlled) {
        setUncontrolledOpen(newOpen)
      }
      // 受控模式时调用外部回调
      controlledOnOpenChange?.(newOpen)
    },
    [isControlled, controlledOnOpenChange]
  )

  return (
    <AlertDialogContext.Provider value={{ open, variant, onOpenChange: handleOpenChange }}>
      {children}
    </AlertDialogContext.Provider>
  )
}

/**
 * AlertDialogTrigger 触发器组件
 * 点击后打开对话框
 *
 * @example
 * <AlertDialogTrigger>
 *   <Button>打开对话框</Button>
 * </AlertDialogTrigger>
 */
export function AlertDialogTrigger({ children }: AlertDialogTriggerProps) {
  const { onOpenChange } = useAlertDialogContext()

  return (
    <div
      onClick={() => onOpenChange(true)}
      className="cursor-pointer inline-flex"
    >
      {/* 支持 render props 模式或普通子元素 */}
      {typeof children === "function" ? children({ open: false }) : children}
    </div>
  )
}

/**
 * 导出上下文 Hook 供其他组件使用
 */
export { useAlertDialogContext }
