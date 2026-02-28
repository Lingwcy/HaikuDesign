import * as React from "react"

//定义打字配置对象的结构（效果、步长、间隔、是否保留前缀）。
export type BubbleTypingConfig = {
  effect?: "typing" | "fade-in"
  step?: number | [number, number]
  interval?: number
  keepPrefix?: boolean
}
// typing 参数既可布尔也可配置对象
export type BubbleTypingInput = boolean | BubbleTypingConfig

//定义渲染分片的数据结构（id、文本、是否完成、任务 id）。
export type BubbleTypingChunk = {
  id: string
  text: string
  done: boolean
  taskId: number
}

//计算一组字符串的最长公共前缀，用于“保留已有前缀”。
//这样如果 content 发生更新但前缀相同（比如流式追加、或内容替换但开头一致），就保留这段已打出的部分，避免从头重打。
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
  /**
   * 这条分支只在“没有 requestAnimationFrame”的环境下会走到，也就是：
    非浏览器环境（SSR/Node.js/测试环境）
    或浏览器被裁剪/禁用 RAF 的场景
    此时用 setTimeout 模拟一帧（约 16ms），返回它的 id，并把 Date.now() 作为时间戳传给回调，保证后续逻辑仍能工作。
   */
  return setTimeout(() => callback(Date.now()), 16) as unknown as number
}
//停止当前 rafId 对应的下一次 tick 执行，从而中断动画循环.
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

  const rafId = React.useRef(-1) // 保存最近一次requestFrame返回的id，用于停止frame循环
  const currentTaskId = React.useRef(1) //保存“当前吐字任务”的版本号
  const animatingRef = React.useRef(false) //在 useEffect 里它被用来决定是否启动 execute：只有 false 才会启动；一旦被设为 true，就避免重复重启动画。
  const renderedRef = React.useRef("") // 当前已经渲染出来的完整文本（拼接结果）
  const streamingRef = React.useRef(streaming) //是否还在流式
  streamingRef.current = streaming

  // 检查合并typing配置
  // 把外部 typing 配置和默认配置合并，同时做强校验”，只在 typing 变化时重新计算
  // 这里用 Required<BubbleTypingConfig> 的目的就是“把可选字段变成必选”，让 TypeScript 认为最终配置一定完整
  const mergedConfig = React.useMemo<Required<BubbleTypingConfig>>(() => {
    const base: Required<BubbleTypingConfig> = {
      effect: "fade-in",
      interval: 100,
      step: 6,
      keepPrefix: true,
    }
    //如果 typing 是布尔值（true/false），直接用默认配置（等价于“使用默认打字配置”）
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

  // 获取当前的typing配置
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

      // 放置一个起始块！
      setChunks(
        renderedRef.current
          ? [{ text: renderedRef.current, id: getUid(), taskId, done: true }]
          : [],
      )
      // 定义每一个tick我们具体要做些什么
      const tick = () => {
        // tick 是异步循环里的闭包，taskId 是启动时的快照。
        // 当有这些情况发生时，会递增 currentTaskId.current
        // 动画完成时：currentTaskId.current += 1
        // 中途被打断重启时：execute((currentTaskId.current += 1))
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
          //用 streamingRef.current 是为了让不重启动画的情况下，tick 每次都能读到最新的流式状态
          //如果不用ref那么闭包内部只是拿到streaming的第一次快照
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


        animatingRef.current = true
        lastFrameTime = now //更新上次吐字时间戳（用于下一轮 interval 节流）。
        rafId.current = requestFrame(tick) //安排下一帧继续吐字。
        onTyping?.(renderedRef.current, fullContent)
      }

      tick()
    },
    [mergedConfig.keepPrefix, onTyping, onTypingComplete],
  )

  React.useEffect(() => {
    // content 为空（""、null/undefined 等被判 falsy）时进入。场景：刚初始化或外部清空内容。
    if (!content) return reset() 
    // 新的 content 与已渲染文本完全一致时进入。场景：重复设置相同内容、或流式更新没有新增字符。
    if (content === renderedRef.current) return

    //正在动画中，但新 content 不是已渲染文本的前缀时进入。
    //场景：外部content被替换/截断/回退（比如从“Hello wor”变成“Hi”或“Hello!”）。
    if (animatingRef.current && !content.startsWith(renderedRef.current)) {
      // 取消当前帧、递增任务id重新打字
      cancelFrame(rafId.current)
      animatingRef.current = false
      rafId.current = requestFrame(() => execute((currentTaskId.current += 1)))
      return
    }

    //初次收到内容
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

