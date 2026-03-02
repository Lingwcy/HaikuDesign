import * as React from "react"
import * as ReactDOM from "react-dom"

interface AlertDialogPortalProps {
  children: React.ReactNode
}

export function AlertDialogPortal({ children }: AlertDialogPortalProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return ReactDOM.createPortal(children, document.body)
}
