import * as React from "react"
import { Button } from "../Button"
import { useAlertDialogContext } from "./alertDialog"

interface AlertDialogActionProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {}

export function AlertDialogAction({ className, onClick, ...props }: AlertDialogActionProps) {
  const { variant, onOpenChange } = useAlertDialogContext()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    onOpenChange(false)
  }

  if (variant === "shadcn") {
    return (
      <Button variant="default" className={className} onClick={handleClick} {...props} />
    )
  }

  // haiku style
  return (
    <Button variant="primary" color="primary" className={className} onClick={handleClick} {...props} />
  )
}
