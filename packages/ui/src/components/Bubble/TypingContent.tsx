import * as React from "react"
import { cn } from "../../lib/utils"
import type { BubbleTypingConfig, BubbleTypingInput } from "./useTyping"
import { useTyping } from "./useTyping"

export type TypingContentProps = {
  content: string
  typing: BubbleTypingInput
  streaming: boolean
  className?: string
  cursor?: string
  cursorBlinkClassName?: string
  onTyping?: (renderedContent: string, currentContent: string) => void
  onTypingComplete?: (content: string) => void
}

export function TypingContent({
  content,
  typing,
  streaming,
  className,
  cursor = "|",
  cursorBlinkClassName = "animate-[haiku-bubble-cursor-blink_0.8s_linear_infinite]",
  onTyping,
  onTypingComplete,
}: TypingContentProps) {
  const { chunks, animating, config } = useTyping({
    streaming,
    content,
    typing,
    onTyping,
    onTypingComplete,
  })

  const effect: BubbleTypingConfig["effect"] = config.effect
  const isTypingEffect = typing !== true && effect === "typing"

  return (
    <div
      className={cn(
        "whitespace-pre-wrap break-words",
        className,
      )}
    >
      {chunks.map((chunk) =>
        config.effect === "fade-in" && !chunk.done ? (
          <span
            key={chunk.id}
            className="inline animate-[haiku-bubble-fade-in_0.1s_linear]"
          >
            {chunk.text}
          </span>
        ) : (
          <React.Fragment key={chunk.id}>{chunk.text}</React.Fragment>
        ),
      )}
      {isTypingEffect && animating ? (
        <span
          aria-hidden="true"
          className={cn("ml-1 select-none font-black", cursorBlinkClassName)}
        >
          {cursor}
        </span>
      ) : null}
    </div>
  )
}
