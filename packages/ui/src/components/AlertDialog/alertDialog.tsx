import * as React from "react"
import type { AlertDialogProps, AlertDialogTriggerProps, AlertDialogVariant } from "./types"

interface AlertDialogContextValue {
  open: boolean
  variant: AlertDialogVariant
  onOpenChange: (open: boolean) => void
}

const AlertDialogContext = React.createContext<AlertDialogContextValue | null>(null)

function useAlertDialogContext() {
  const context = React.useContext(AlertDialogContext)
  if (!context) {
    throw new Error("AlertDialog components must be used within AlertDialog")
  }
  return context
}

export function AlertDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  defaultOpen = false,
  variant = "haiku",
  children,
}: AlertDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(newOpen)
      }
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

export function AlertDialogTrigger({ children }: AlertDialogTriggerProps) {
  const { onOpenChange } = useAlertDialogContext()

  return (
    <div
      onClick={() => onOpenChange(true)}
      className="cursor-pointer inline-flex"
    >
      {typeof children === "function" ? children({ open: false }) : children}
    </div>
  )
}

export { useAlertDialogContext }
