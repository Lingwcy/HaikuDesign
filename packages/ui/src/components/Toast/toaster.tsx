import { ToastProvider } from "./toast"
import type { ToastPosition } from "./types"

/**
 * Toaster 组件
 * 在应用根组件中使用，用于渲染 toast 容器
 * 必须放在 ToastProvider 内部或本身就是 ToastProvider
 *
 * @example
 * // app/layout.tsx
 * import { Toaster } from "haiku-react-ui"
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html lang="en">
 *       <body>
 *         {children}
 *         <Toaster />
 *       </body>
 *     </html>
 *   )
 * }
 *
 * // 使用 toast
 * import { toast } from "haiku-react-ui"
 * toast.success("操作成功")
 */
export function Toaster({ position = "bottom-right" }: { position?: ToastPosition }) {
  // Toaster 本质上是 ToastProvider 的简写形式
  // 它会自动渲染 toast 列表
  return <ToastProvider>{null}</ToastProvider>
}
