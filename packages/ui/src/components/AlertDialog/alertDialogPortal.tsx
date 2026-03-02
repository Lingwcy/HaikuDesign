import * as React from "react"
import * as ReactDOM from "react-dom"

/**
 * AlertDialogPortal 属性
 */
interface AlertDialogPortalProps {
  /** 子元素 */
  children: React.ReactNode
}

/**
 * AlertDialogPortal 组件
 * 使用 React Portal 将子元素渲染到 document.body
 * 避免对话框被父元素的 overflow、z-index 等样式影响
 *
 * 注意：在 SSR 环境下或组件挂载前返回 null，避免闪烁
 */
export function AlertDialogPortal({ children }: AlertDialogPortalProps) {
  // 组件是否已挂载（客户端）
  const [mounted, setMounted] = React.useState(false)

  // 在客户端挂载后设置为 true
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // SSR 或未挂载时返回 null，避免位置闪烁
  if (!mounted || typeof document === "undefined") {
    return null
  }

  // 使用 Portal 渲染到 document.body
  return ReactDOM.createPortal(children, document.body)
}
