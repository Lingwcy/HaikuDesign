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

export interface AlertDialogOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  // Additional overlay-specific props can be added here
}

export interface AlertDialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  showClose?: boolean
  size?: AlertDialogSize
  onEscapeKeyDown?: (event: KeyboardEvent) => void
  onPointerDownOutside?: (event: PointerEvent) => void
}

export interface AlertDialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  // Additional header-specific props can be added here
}

export interface AlertDialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  // Additional footer-specific props can be added here
}

export interface AlertDialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  // Additional title-specific props can be added here
}

export interface AlertDialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  // Additional description-specific props can be added here
}

export interface AlertDialogActionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Additional action-specific props can be added here
}

export interface AlertDialogCancelProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Additional cancel-specific props can be added here
}
