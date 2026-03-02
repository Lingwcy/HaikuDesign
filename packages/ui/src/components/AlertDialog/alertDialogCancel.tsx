import * as React from "react"
import { Button } from "../Button"
import { useAlertDialogContext } from "./alertDialog"

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AlertDialogCancelProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color" | "variant"> {}

export function AlertDialogCancel({ className, onClick, ...props }: AlertDialogCancelProps) {
  const { variant, onOpenChange } = useAlertDialogContext()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    onOpenChange(false)
  }

  if (variant === "shadcn") {
    return (
      <Button variant="text" className={className} onClick={handleClick} {...props} />
    )
  }

  // haiku style
  return (
    <Button variant="default" color="default" className={className} onClick={handleClick} {...props} />
  )
}
