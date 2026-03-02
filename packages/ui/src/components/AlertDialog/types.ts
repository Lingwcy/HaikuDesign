import * as React from "react"

export type AlertDialogVariant = "shadcn" | "haiku"
export type AlertDialogSize = "sm" | "md" | "lg"

export interface AlertDialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
  variant?: AlertDialogVariant
  children?: React.ReactNode
}

export interface AlertDialogTriggerProps extends Omit<React.HTMLAttributes<HTMLButtonElement>, "children"> {
  asChild?: boolean
  children?: React.ReactNode | ((props: { open: boolean }) => React.ReactNode)
}

export interface AlertDialogPortalProps {
  children?: React.ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type AlertDialogOverlayProps = React.HTMLAttributes<HTMLDivElement>

export interface AlertDialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  showClose?: boolean
  size?: AlertDialogSize
  onEscapeKeyDown?: (event: KeyboardEvent) => void
  onPointerDownOutside?: (event: PointerEvent) => void
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type AlertDialogHeaderProps = React.HTMLAttributes<HTMLDivElement>

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type AlertDialogFooterProps = React.HTMLAttributes<HTMLDivElement>

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type AlertDialogTitleProps = React.HTMLAttributes<HTMLHeadingElement>

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type AlertDialogDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type AlertDialogActionProps = React.ButtonHTMLAttributes<HTMLButtonElement>

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type AlertDialogCancelProps = React.ButtonHTMLAttributes<HTMLButtonElement>
