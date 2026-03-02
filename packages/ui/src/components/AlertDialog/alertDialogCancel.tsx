import * as React from "react"
import { Button } from "../Button"
import { useAlertDialogContext } from "./alertDialog"

interface AlertDialogCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function AlertDialogCancel({ className, onClick, ...props }: AlertDialogCancelProps) {
  const { variant, onOpenChange } = useAlertDialogContext()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    onOpenChange(false)
  }

  if (variant === "shadcn") {
    return (
      <Button variant="outline" className={className} onClick={handleClick} {...props} />
    )
  }

  // haiku style
  return (
    <Button variant="default" color="default" className={className} onClick={handleClick} {...props} />
  )
}
