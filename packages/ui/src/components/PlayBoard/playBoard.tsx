
import * as React from "react"

import { cn } from "../../lib/utils"

export type PlayBoardProps = React.HTMLAttributes<HTMLDivElement> & {
  icon?: React.ReactNode
  heading?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  code?: string
  defaultExpanded?: boolean
  previewClassName?: string
}

function PlayBoard({
  icon,
  heading,
  description,
  actions,
  code,
  defaultExpanded = false,
  previewClassName,
  className,
  children,
  ...props
}: PlayBoardProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded)
  const codeId = React.useId()
  const hasCode = typeof code === "string" && code.trim().length > 0

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-zinc-200/70 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950",
        className
      )}
      {...props}
    >
      {(heading || description || actions) && (
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200/70 px-5 py-4 dark:border-zinc-800">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="flex size-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                  {icon}
                </div>
              )}
              {heading && (
                <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {heading}
                </div>
              )}
            </div>
            {description && (
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {description}
              </div>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}

      <div className={cn("px-5 py-6", previewClassName)}>
        <div className="rounded-lg bg-zinc-50 p-5 dark:bg-zinc-900/40">
          {children}
        </div>
      </div>

      {hasCode && (
        <div className="border-t border-zinc-200/70 dark:border-zinc-800">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 px-5 py-3 text-sm text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900/30"
            aria-expanded={expanded}
            aria-controls={codeId}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "收起代码" : "展开代码"}
          </button>
          {expanded && (
            <pre
              id={codeId}
              className="overflow-x-auto border-t border-zinc-200/70 bg-zinc-950 px-5 py-4 text-xs leading-relaxed text-zinc-50 dark:border-zinc-800"
            >
              <code>{code}</code>
            </pre>
          )}
        </div>
      )}
    </section>
  )
}

export default PlayBoard
