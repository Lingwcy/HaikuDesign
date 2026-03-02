# AlertDialog Component Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 创建一个支持 shadcn/ui 和 Haiku 两种风格的可访问警告对话框组件，包含 Trigger、Content、Header、Footer、Action、Cancel 等子组件

**Architecture:** 采用复合组件模式（Compound Components），使用 React Portal 渲染，支持受控/非受控模式，包含动画效果

**Tech Stack:** React, TypeScript, Tailwind CSS, class-variance-authority

---

### Task 1: Create AlertDialog Component Directory and Types

**Files:**
- Create: `packages/ui/src/components/AlertDialog/types.ts`

**Step 1: Create the types file**

```typescript
// packages/ui/src/components/AlertDialog/types.ts

export type AlertDialogVariant = "shadcn" | "haiku"
export type AlertDialogSize = "sm" | "md" | "lg"

export interface AlertDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
  variant?: AlertDialogVariant
  children: React.ReactNode
}

export interface AlertDialogTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

export interface AlertDialogPortalProps {
  children: React.ReactNode
}

export interface AlertDialogOverlayProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface AlertDialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  showClose?: boolean
  size?: AlertDialogSize
  onEscapeKeyDown?: (event: KeyboardEvent) => void
  onPointerDownOutside?: (event: PointerEvent) => void
}

export interface AlertDialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface AlertDialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface AlertDialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export interface AlertDialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export interface AlertDialogCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
```

**Step 2: Commit**

```bash
git add packages/ui/src/components/AlertDialog/types.ts
git commit -m "feat: add AlertDialog types"
```

---

### Task 2: Create AlertDialog Root Component

**Files:**
- Create: `packages/ui/src/components/AlertDialog/alertDialog.tsx`
- Create: `packages/ui/src/components/AlertDialog/index.ts`

**Step 1: Create the AlertDialog root component**

```typescript
// packages/ui/src/components/AlertDialog/alertDialog.tsx
import * as React from "react"
import { cn } from "../../lib/utils"
import type { AlertDialogProps, AlertDialogVariant } from "./types"
import { AlertDialogContent } from "./alertDialogContent"
import { AlertDialogTrigger } from "./alertDialogTrigger"

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

export function AlertDialogTrigger({ children }: { children: React.ReactNode }) {
  const { open, onOpenChange } = useAlertDialogContext()

  return (
    <div
      onClick={() => onOpenChange(true)}
      className="cursor-pointer inline-flex"
    >
      {typeof children === "function" ? children({ open }) : children}
    </div>
  )
}

export { AlertDialogContent, useAlertDialogContext }
```

**Step 2: Create index.ts**

```typescript
// packages/ui/src/components/AlertDialog/index.ts
export { AlertDialog } from "./alertDialog"
export { AlertDialogTrigger } from "./alertDialog"
export { AlertDialogContent } from "./alertDialogContent"
export { AlertDialogPortal } from "./alertDialogPortal"
export { AlertDialogOverlay } from "./alertDialogOverlay"
export { AlertDialogHeader } from "./alertDialogHeader"
export { AlertDialogFooter } from "./alertDialogFooter"
export { AlertDialogTitle } from "./alertDialogTitle"
export { AlertDialogDescription } from "./alertDialogDescription"
export { AlertDialogAction } from "./alertDialogAction"
export { AlertDialogCancel } from "./alertDialogCancel"
export * from "./types"
```

**Step 3: Commit**

```bash
git add packages/ui/src/components/AlertDialog/
git commit -m "feat: create AlertDialog root component"
```

---

### Task 3: Create AlertDialog Portal, Overlay, and Content

**Files:**
- Create: `packages/ui/src/components/AlertDialog/alertDialogPortal.tsx`
- Create: `packages/ui/src/components/AlertDialog/alertDialogOverlay.tsx`
- Create: `packages/ui/src/components/AlertDialog/alertDialogContent.tsx`

**Step 1: Create AlertDialogPortal**

```typescript
// packages/ui/src/components/AlertDialog/alertDialogPortal.tsx
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
```

**Step 2: Create AlertDialogOverlay**

```typescript
// packages/ui/src/components/AlertDialog/alertDialogOverlay.tsx
import * as React from "react"
import { cn } from "../../lib/utils"
import { useAlertDialogContext } from "./alertDialog"

const overlayVariants = {
  shadcn: "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  haiku: "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm",
}

export function AlertDialogOverlay({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { variant } = useAlertDialogContext()

  return (
    <div
      className={cn(overlayVariants[variant], className)}
      data-slot="alert-dialog-overlay"
      {...props}
    />
  )
}
```

**Step 3: Create AlertDialogContent**

```typescript
// packages/ui/src/components/AlertDialog/alertDialogContent.tsx
import * as React from "react"
import { cn } from "../../lib/utils"
import { Icon } from "@iconify/react"
import { useAlertDialogContext } from "./alertDialog"
import { AlertDialogPortal } from "./alertDialogPortal"
import { AlertDialogOverlay } from "./alertDialogOverlay"
import type { AlertDialogSize } from "./types"

const contentVariants = {
  shadcn: {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  },
  haiku: {
    sm: "max-w-xs",
    md: "max-w-sm",
    lg: "max-w-md",
  },
}

const shadcnAnimation = "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"

const contentBaseStyles = {
  shadcn: "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
  haiku: "fixed left-[50%] top-[50%] z-50 w-full translate-x-[-50%] translate-y-[-50%] gap-3 rounded-xl border border-default bg-white p-5 shadow-xl duration-200 dark:bg-zinc-900",
}

export function AlertDialogContent({
  className,
  children,
  showClose = true,
  size = "md",
  onEscapeKeyDown,
  onPointerDownOutside,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  showClose?: boolean
  size?: AlertDialogSize
  onEscapeKeyDown?: (event: KeyboardEvent) => void
  onPointerDownOutside?: (event: PointerEvent) => void
}) {
  const { open, variant, onOpenChange } = useAlertDialogContext()

  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (open) {
        onEscapeKeyDown?.(event)
        if (!event.defaultPrevented) {
          onOpenChange(false)
        }
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [open, onOpenChange, onEscapeKeyDown])

  React.useEffect(() => {
    const handlePointerDownOutside = (event: PointerEvent) => {
      onPointerDownOutside?.(event)
      if (!event.defaultPrevented) {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener("pointerdown", handlePointerDownOutside)
      return () => document.removeEventListener("pointerdown", handlePointerDownOutside)
    }
  }, [open, onOpenChange, onPointerDownOutside])

  if (!open) return null

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <div
        className={cn(
          contentBaseStyles[variant],
          contentVariants[variant][size],
          variant === "shadcn" && shadcnAnimation,
          className
        )}
        role="alertdialog"
        aria-modal="true"
        {...props}
      >
        {children}
        {showClose && variant === "haiku" && (
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            aria-label="Close"
          >
            <Icon icon="lucide:x" className="h-4 w-4" />
          </button>
        )}
      </div>
    </AlertDialogPortal>
  )
}
```

**Step 4: Commit**

```bash
git add packages/ui/src/components/AlertDialog/
git commit -m "feat: add AlertDialog Portal, Overlay, and Content components"
```

---

### Task 4: Create AlertDialog Header, Footer, Title, Description

**Files:**
- Create: `packages/ui/src/components/AlertDialog/alertDialogHeader.tsx`
- Create: `packages/ui/src/components/AlertDialog/alertDialogFooter.tsx`
- Create: `packages/ui/src/components/AlertDialog/alertDialogTitle.tsx`
- Create: `packages/ui/src/components/AlertDialog/alertDialogDescription.tsx`

**Step 1: Create AlertDialogHeader**

```typescript
// packages/ui/src/components/AlertDialog/alertDialogHeader.tsx
import * as React from "react"
import { cn } from "../../lib/utils"

export function AlertDialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
}
```

**Step 2: Create AlertDialogFooter**

```typescript
// packages/ui/src/components/AlertDialog/alertDialogFooter.tsx
import * as React from "react"
import { cn } from "../../lib/utils"

export function AlertDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2", className)}
      {...props}
    />
  )
}
```

**Step 3: Create AlertDialogTitle**

```typescript
// packages/ui/src/components/AlertDialog/alertDialogTitle.tsx
import * as React from "react"
import { cn } from "../../lib/utils"
import { useAlertDialogContext } from "./alertDialog"

const titleVariants = {
  shadcn: "text-lg font-semibold",
  haiku: "text-base font-semibold text-default",
}

export function AlertDialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  const { variant } = useAlertDialogContext()

  return <h2 className={cn(titleVariants[variant], className)} {...props} />
}
```

**Step 4: Create AlertDialogDescription**

```typescript
// packages/ui/src/components/AlertDialog/alertDialogDescription.tsx
import * as React from "react"
import { cn } from "../../lib/utils"
import { useAlertDialogContext } from "./alertDialog"

const descriptionVariants = {
  shadcn: "text-sm text-muted-foreground",
  haiku: "text-sm text-zinc-500 dark:text-zinc-400",
}

export function AlertDialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { variant } = useAlertDialogContext()

  return <p className={cn(descriptionVariants[variant], className)} {...props} />
}
```

**Step 5: Commit**

```bash
git add packages/ui/src/components/AlertDialog/
git commit -m "feat: add AlertDialog Header, Footer, Title, Description components"
```

---

### Task 5: Create AlertDialog Action and Cancel Buttons

**Files:**
- Create: `packages/ui/src/components/AlertDialog/alertDialogAction.tsx`
- Create: `packages/ui/src/components/AlertDialog/alertDialogCancel.tsx`

**Step 1: Create AlertDialogAction**

```typescript
// packages/ui/src/components/AlertDialog/alertDialogAction.tsx
import * as React from "react"
import { Button } from "../Button"
import { useAlertDialogContext } from "./alertDialog"

interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

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
```

**Step 2: Create AlertDialogCancel**

```typescript
// packages/ui/src/components/AlertDialog/alertDialogCancel.tsx
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
```

**Step 3: Commit**

```bash
git add packages/ui/src/components/AlertDialog/
git commit -m "feat: add AlertDialog Action and Cancel buttons"
```

---

### Task 6: Update Main Export

**Files:**
- Modify: `packages/ui/src/index.ts`

**Step 1: Add AlertDialog export**

```typescript
// packages/ui/src/index.ts - add this import
import { AlertDialog } from "./components/AlertDialog"
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./components/AlertDialog"

// Add to exports
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
```

**Step 2: Commit**

```bash
git add packages/ui/src/index.ts
git commit -m "feat: export AlertDialog components"
```

---

### Task 7: Add Dialog Animations to CSS

**Files:**
- Modify: `packages/ui/src/styles/preset.css`

**Step 1: Add dialog animations**

```css
/* Add to @layer base */
@keyframes haiku-dialog-fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes haiku-dialog-fade-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes haiku-dialog-scale-in {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes haiku-dialog-scale-out {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
}
```

**Step 2: Commit**

```bash
git add packages/ui/src/styles/preset.css
git commit -m "feat: add dialog animations to CSS"
```

---

### Task 8: Build and Verify

**Files:**
- Build verification

**Step 1: Build the UI package**

```bash
cd packages/ui && pnpm build
```

Expected: Build should complete without errors

**Step 2: Run type check**

```bash
cd packages/ui && pnpm typecheck
```

Expected: No type errors

**Step 3: Commit**

```bash
git add .
git commit -m "feat: build and verify AlertDialog component"
```

---

### Task 9: Create Documentation

**Files:**
- Create: `apps/docs/docs/components/alert-dialog.mdx`
- Modify: `packages/ui/src/components/AlertDialog/advice/README.md` (create if not exists)

**Step 1: Create alert-dialog.mdx**

```mdx
---
title: AlertDialog
---

import { AlertDialog, Button, PlayBoard } from "haiku-react-ui"
import * as React from "react"

# AlertDialog 警告对话框

:::note
警告对话框用于需要用户确认的重要操作。
:::

## 何时使用

- 用户执行不可逆操作前的确认
- 需要用户明确知悉风险的场景
- 关键操作的二次确认

## 代码演示

<div className='flex flex-col gap-8'>

<PlayBoard
  heading="Haiku 风格"
  description="与 HaikuDesign 设计系统一致的样式"
  code={`import { AlertDialog, Button } from "haiku-react-ui"

export default function Demo() {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button>删除文件</Button>} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除</AlertDialogTitle>
          <AlertDialogDescription>
            此操作不可撤销，确定要删除该文件吗？
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction color="danger">确认删除</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}`}
>
  <AlertDialog>
    <AlertDialogTrigger render={<Button>删除文件</Button>} />
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>确认删除</AlertDialogTitle>
        <AlertDialogDescription>
          此操作不可撤销，确定要删除该文件吗？
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>取消</AlertDialogCancel>
        <AlertDialogAction color="danger">确认删除</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</PlayBoard>

<PlayBoard
  heading="shadcn/ui 风格"
  description="现代简洁风格"
  code={`import { AlertDialog, Button } from "haiku-react-ui"

export default function Demo() {
  return (
    <AlertDialog variant="shadcn">
      <AlertDialogTrigger render={<Button variant="outline">Show Dialog</Button>} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}`}
>
  <AlertDialog variant="shadcn">
    <AlertDialogTrigger render={<Button variant="outline">Show Dialog</Button>} />
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete your account.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction>Continue</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</PlayBoard>

<PlayBoard
  heading="不同尺寸"
  description="支持 sm, md, lg 三种尺寸"
  code={`import { AlertDialog, Button } from "haiku-react-ui"

export default function Demo() {
  return (
    <div className="flex gap-2">
      <AlertDialog>
        <AlertDialogTrigger render={<Button size="sm">Small</Button>} />
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Small Dialog</AlertDialogTitle>
            <AlertDialogDescription>
              This is a small dialog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}`}
>
  <div className="flex gap-2">
    <AlertDialog>
      <AlertDialogTrigger render={<Button size="sm">Small</Button>} />
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Small Dialog</AlertDialogTitle>
          <AlertDialogDescription>
            This is a small dialog.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</PlayBoard>

</div>

## API 参考

### AlertDialog

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| open | `boolean` | - | 受控打开状态 |
| onOpenChange | `(open: boolean) => void` | - | 状态变化回调 |
| defaultOpen | `boolean` | `false` | 非受控模式默认状态 |
| variant | `"shadcn" \| "haiku"` | `"haiku"` | 样式变体 |
| children | `ReactNode` | - | 子组件 |

### AlertDialogTrigger

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| children | `ReactNode` | - | 触发器内容 |

### AlertDialogContent

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| showClose | `boolean` | `true` | 是否显示关闭按钮 |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 对话框尺寸 |

### AlertDialogHeader

布局组件，包含标题和描述的容器。

### AlertDialogFooter

布局组件，包含取消和确认按钮的容器。

### AlertDialogTitle

对话框标题。

### AlertDialogDescription

对话框描述文字。

### AlertDialogAction

确认按钮，点击后自动关闭对话框。

### AlertDialogCancel

取消按钮，点击后自动关闭对话框。
```

**Step 2: Commit**

```bash
git add apps/docs/docs/components/alert-dialog.mdx
git commit -m "docs: add AlertDialog documentation"
```

---

### Task 10: Final Verification

**Step 1: Run lint**

```bash
pnpm lint
```

Expected: No lint errors

**Step 2: Commit all changes**

```bash
git add .
git commit -m "feat: complete AlertDialog component with documentation"
```
