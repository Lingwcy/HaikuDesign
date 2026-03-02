import { Toaster } from "haiku-react-ui"
import * as React from "react"

/**
 * 全局 Toaster 组件
 * 在文档站点中全局渲染，用于接收 toast 调用
 */
export function GlobalToaster() {
  return <Toaster position="bottom-right" />
}
