import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"
import type { BubbleTypingConfig, BubbleTypingInput } from "./useTyping"
import { TypingContent } from "./TypingContent"

export type BubblePlacement = "start" | "end"
export type BubbleVariant = "filled" | "outlined" | "shadow" | "borderless"
export type BubbleShape = "default" | "round" | "corner"
 
export type BubbleInfo = {
  key?: string | number
  status?: string
  extraInfo?: Record<string, unknown>
}
//泛型 ContentType 的好处是：当传入 content="hello" 时，
//插槽函数的 content 参数会被推断成 string，就不需要手动收窄了。
//当传入 content={<div />} 时，插槽函数的 content 参数会被推断成 React.ReactNode。
//其余的插槽类型会跟着 content 类型变化。
export type BubbleSlot<ContentType extends React.ReactNode> =
  | React.ReactNode
  | ((content: ContentType, info: BubbleInfo) => React.ReactNode)

export type BubbleProps<ContentType extends React.ReactNode = React.ReactNode> = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "content"
> & {
  content: ContentType
  info?: BubbleInfo
  placement?: BubblePlacement
  variant?: BubbleVariant
  shape?: BubbleShape
  header?: BubbleSlot<ContentType>
  footer?: BubbleSlot<ContentType>
  avatar?: BubbleSlot<ContentType>
  extra?: BubbleSlot<ContentType>
  contentRender?: (content: ContentType, info: BubbleInfo) => React.ReactNode
  typing?:
    | boolean
    | BubbleTypingConfig
    | ((content: ContentType, info: BubbleInfo) => boolean | BubbleTypingConfig)
  typingCursor?: string
  streaming?: boolean
  loading?: boolean
  loadingRender?: () => React.ReactNode
  onTyping?: (renderedContent: string, currentContent: string) => void
  onTypingComplete?: (content: string) => void
}

const bubbleRootVariants = cva("flex gap-3", {
  variants: {
    placement: {
      start: "flex-row",
      end: "flex-row-reverse",
    },
  },
  defaultVariants: {
    placement: "start",
  },
})

const bubbleContentVariants = cva(
  "max-w-full min-w-0 px-4 py-3 text-sm leading-6 text-default break-words",
  {
    variants: {
      variant: {
        filled: "bg-zinc-100 text-zinc-900 dark:bg-zinc-900/60 dark:text-zinc-50",
        outlined:
          "border border-zinc-200/70 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50",
        shadow:
          "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-50",
        borderless: "bg-transparent p-0",
      },
      shape: {
        default: "rounded-xl",
        round: "rounded-full",
        corner: "rounded-xl",
      },
      placement: {
        start: "",
        end: "",
      },
    },
    compoundVariants: [
      { shape: "corner", placement: "start", className: "rounded-tl-sm" },
      { shape: "corner", placement: "end", className: "rounded-tr-sm" },
    ],
    defaultVariants: {
      variant: "filled",
      shape: "default",
      placement: "start",
    },
  },
)

function renderSlot<ContentType extends React.ReactNode>(
  slot: BubbleSlot<ContentType> | undefined,
  content: ContentType,
  info: BubbleInfo,
) {
  if (!slot) return null
  return typeof slot === "function" ? slot(content, info) : slot
}

function DefaultLoading() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="size-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.2s] dark:bg-zinc-500" />
      <span className="size-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.1s] dark:bg-zinc-500" />
      <span className="size-1.5 animate-bounce rounded-full bg-zinc-400 dark:bg-zinc-500" />
    </div>
  )
}

export function Bubble<ContentType extends React.ReactNode = React.ReactNode>({
  content,
  info,
  placement = "start",
  variant = "filled",
  shape = "default",
  header,
  footer,
  avatar,
  extra,
  contentRender,
  typing,
  typingCursor,
  streaming = false,
  loading = false,
  loadingRender,
  onTyping,
  onTypingComplete,
  className,
  ...props
}: BubbleProps<ContentType> & VariantProps<typeof bubbleContentVariants>) {
  const mergedInfo = info ?? {}
  const rendered = contentRender ? contentRender(content, mergedInfo) : content

  const mergedTyping =
    typeof typing === "function" ? typing(content, mergedInfo) : typing

  const useInnerAnimation = Boolean(mergedTyping) && typeof rendered === "string"

  React.useEffect(() => {
    if (useInnerAnimation) return
    if (streaming) return
    if (typeof rendered === "string" && rendered) {
      onTypingComplete?.(rendered)
    }
  }, [rendered, streaming, useInnerAnimation, onTypingComplete])

  const contentNode = (() => {
    if (loading) {
      return loadingRender ? loadingRender() : <DefaultLoading />
    }

    if (useInnerAnimation) {
      return (
        <TypingContent
          content={rendered as string}
          streaming={streaming}
          typing={mergedTyping as BubbleTypingInput}
          cursor={typingCursor}
          onTyping={onTyping}
          onTypingComplete={onTypingComplete}
        />
      )
    }

    return typeof rendered === "string" ? (
      <div className="whitespace-pre-wrap break-words">{rendered}</div>
    ) : (
      rendered
    )
  })()

  const avatarNode = renderSlot(avatar, content, mergedInfo)
  const headerNode = renderSlot(header, content, mergedInfo)
  const footerNode = renderSlot(footer, content, mergedInfo)
  const extraNode = renderSlot(extra, content, mergedInfo)

  return (
    <div
      className={cn(bubbleRootVariants({ placement }), className)}
      data-slot="bubble"
      data-placement={placement}
      data-variant={variant}
      data-shape={shape}
      data-loading={loading ? "" : undefined}
      {...props}
    >
      {avatarNode ? <div className="shrink-0">{avatarNode}</div> : null}

      <div className="flex min-w-0 max-w-full flex-col">
        {headerNode ? (
          <div className={cn("mb-1 text-xs text-zinc-500 dark:text-zinc-400")}>
            {headerNode}
          </div>
        ) : null}

        <div
          className={cn(
            bubbleContentVariants({ variant, shape, placement }),
            typeof rendered === "string" && "whitespace-pre-wrap",
          )}
        >
          {contentNode}
        </div>

        {footerNode ? (
          <div
            className={cn(
              "mt-2 text-xs text-zinc-500 dark:text-zinc-400",
              placement === "end" && "text-right",
            )}
          >
            {footerNode}
          </div>
        ) : null}
      </div>

      {extraNode && !loading ? <div className="shrink-0">{extraNode}</div> : null}
    </div>
  )
}
