import * as React from "react"

export type BubbleTypingEffect = "typing" | "fade-in"

export type BubbleTypingConfig = {
  effect?: BubbleTypingEffect
  step?: number | [number, number]
  interval?: number
  keepPrefix?: boolean
}

export type BubbleTypingInput = boolean | BubbleTypingConfig

export type BubbleTypingChunk = {
  id: string
  text: string
  done: boolean
  taskId: number
}

function getLongestCommonPrefix(strings: string[]) {
  if (!strings.length) return ""
  return strings.reduce((prefix, current) => {
    let index = 0
    while (
      index < prefix.length &&
      index < current.length &&
      prefix[index] === current[index]
    ) {
      index += 1
    }
    return prefix.slice(0, index)
  })
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function getUid() {
  return Math.random().toString(16).slice(2)
}

function requestFrame(callback: FrameRequestCallback) {
  if (typeof requestAnimationFrame !== "undefined") {
    return requestAnimationFrame(callback)
  }
  return setTimeout(() => callback(Date.now()), 16) as unknown as number
}

function cancelFrame(id: number) {
  if (typeof cancelAnimationFrame !== "undefined") {
    cancelAnimationFrame(id)
    return
  }
  clearTimeout(id)
}

export function useTyping({
  streaming,
  content,
  typing,
  onTyping,
  onTypingComplete,
}: {
  streaming: boolean
  content: string
  typing: BubbleTypingInput
  onTyping?: (renderedContent: string, currentContent: string) => void
  onTypingComplete?: (content: string) => void
}) {
  const [chunks, setChunks] = React.useState<BubbleTypingChunk[]>([])

  const rafId = React.useRef(-1)
  const currentTaskId = React.useRef(1)
  const animatingRef = React.useRef(false) //表示是否正在动画中
  const renderedRef = React.useRef("") // 当前已经渲染出来的完整文本（拼接结果）
  const streamingRef = React.useRef(streaming)
  streamingRef.current = streaming

  const mergedConfig = React.useMemo<Required<BubbleTypingConfig>>(() => {
    const base: Required<BubbleTypingConfig> = {
      effect: "fade-in",
      interval: 100,
      step: 6,
      keepPrefix: true,
    }

    if (typing === false) return base
    if (typing === true) return base

    const interval = typing.interval ?? base.interval
    const step = typing.step ?? base.step
    const effect = typing.effect ?? base.effect
    const keepPrefix = typing.keepPrefix ?? base.keepPrefix

    if (!isNumber(interval) || interval <= 0) {
      throw new Error("[Bubble] invalid typing.interval, expect positive number.")
    }

    const stepIsNumber = isNumber(step)
    if (!stepIsNumber && !Array.isArray(step)) {
      throw new Error("[Bubble] invalid typing.step, expect number or [min,max].")
    }
    if (stepIsNumber && step <= 0) {
      throw new Error("[Bubble] invalid typing.step, expect positive number.")
    }
    if (Array.isArray(step)) {
      if (!isNumber(step[0]) || step[0] <= 0) {
        throw new Error("[Bubble] invalid typing.step[0], expect positive number.")
      }
      if (!isNumber(step[1]) || step[1] <= 0) {
        throw new Error("[Bubble] invalid typing.step[1], expect positive number.")
      }
      if (step[0] > step[1]) {
        throw new Error("[Bubble] invalid typing.step, step[0] should <= step[1].")
      }
    }

    return { effect, interval, step, keepPrefix }
  }, [typing])

  const typingSourceRef = React.useRef({
    content,
    interval: mergedConfig.interval,
    step: mergedConfig.step,
  })
  typingSourceRef.current = {
    content,
    interval: mergedConfig.interval,
    step: mergedConfig.step,
  }

  const reset = React.useCallback(() => {
    cancelFrame(rafId.current)
    rafId.current = -1
    setChunks([])
    renderedRef.current = ""
    animatingRef.current = false
  }, [])

  const execute = React.useCallback(
    (taskId: number) => {
      let lastFrameTime = 0 //记录上一次“真正吐字”的时间戳；用于做 interval 节流（不是每一帧都吐字）。

      renderedRef.current = mergedConfig.keepPrefix
        ? getLongestCommonPrefix([typingSourceRef.current.content, renderedRef.current])
        : ""

      setChunks(
        renderedRef.current
          ? [{ text: renderedRef.current, id: getUid(), taskId, done: true }]
          : [],
      )

      const tick = () => {
        if (taskId !== currentTaskId.current) return

        //计算当前时间戳。 优先用 performance.now()（更精细），否则退化用 Date.now()。
        const now =
          typeof performance !== "undefined" && typeof performance.now === "function"
            ? performance.now()
            : Date.now()

        const { content: fullContent, interval, step } = typingSourceRef.current
        if (now - lastFrameTime < interval) {
          rafId.current = requestFrame(tick) //排一帧继续检查（把 id 存起来，方便取消）。
          return //这次不吐字
        }

        const currentLen = renderedRef.current.length //当前已经渲染到多少字符。
        const resolvedStep = isNumber(step) //决定本次前进步长。
          ? step
          : Math.floor(Math.random() * (step[1] - step[0] + 1)) + step[0]

        const nextText = fullContent.slice(currentLen, currentLen + resolvedStep) //从完整内容中切出“下一段要追加的文本”。

        if (!nextText) { //如果切出来为空，说明“已经追上当前 fullContent 的末尾”。
          if (streamingRef.current) { //但如果外部还在流式（后面还会继续追加 content）
            rafId.current = requestFrame(tick) //不要宣布完成，继续等下一帧（等外部把 content 变长）。
            return
          }
          // 走到这里说明：不在 streaming，且已经追到末尾，要“收尾”。
          setChunks([
            {
              text: renderedRef.current,
              id: getUid(),
              taskId,
              done: true,
            },
          ])

          onTypingComplete?.(fullContent) //触发完成回调（可选），通知外部“这一轮打字完成了”。
          animatingRef.current = false //标记动画结束
          currentTaskId.current += 1 //把全局任务 id 加 1，让当前任务立刻失效
          return
        }

        renderedRef.current += nextText //正常情况（还有内容可吐）就把 nextText 追加到“已渲染全文本”里。
        setChunks((prev) => //把这段 nextText 作为一个新 chunk 追加到数组尾部（触发 UI 更新）。
          prev.concat({
            id: getUid(),
            text: nextText,
            taskId,
            done: false,
          }),
        )

        if (!animatingRef.current) {
          animatingRef.current = true
        }

        lastFrameTime = now //更新上次吐字时间戳（用于下一轮 interval 节流）。
        rafId.current = requestFrame(tick) //安排下一帧继续吐字。
        onTyping?.(renderedRef.current, fullContent)
      }

      tick()
    },
    [mergedConfig.keepPrefix, onTyping, onTypingComplete],
  )

  React.useEffect(() => {
    if (!content) return reset()
    if (content === renderedRef.current) return

    if (animatingRef.current && !content.startsWith(renderedRef.current)) {
      cancelFrame(rafId.current)
      animatingRef.current = false
      rafId.current = requestFrame(() => execute((currentTaskId.current += 1)))
      return
    }

    if (!animatingRef.current) {
      execute(currentTaskId.current)
    }
  }, [content, execute, reset])

  React.useEffect(() => () => cancelFrame(rafId.current), [])

  return {
    chunks,
    animating: animatingRef.current,
    config: mergedConfig,
    renderedText: renderedRef.current,
  }
}

