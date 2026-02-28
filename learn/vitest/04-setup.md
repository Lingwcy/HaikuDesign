# 第四章：setup.ts 详解

## setup.ts 的全貌

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest'  // ①
import { cleanup } from '@testing-library/react'  // ②
import { afterEach, vi } from 'vitest'  // ③

// 每个测试后清理 DOM
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
```

---

## 逐行解释

### ① 导入 jest-dom 匹配器

```typescript
import '@testing-library/jest-dom/vitest'
```

**作用**：让 `toBeInTheDocument()`, `toBeDisabled()` 等匹配器生效

**注意**：这个导入必须在最前面！

```typescript
// ❌ 错误顺序
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// ✅ 正确顺序
import '@testing-library/jest-dom/vitest'  // 先导入
import { render } from '@testing-library/react'
```

---

### ② 导入 cleanup 和 afterEach

```typescript
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// 每个测试后清理 DOM
afterEach(() => {
  cleanup()
})
```

**为什么要清理？**

```
测试 A: render(<Button />) → 添加 button 到 DOM
测试 B: render(<Avatar />) → 添加 avatar 到 DOM
          ↓
    如果不清理，DOM 会累积：
    <div>
      <button>...</button>    ← 测试 A
      <img>...</img>         ← 测试 B
    </div>
```

**cleanup() 做什么？**
- 移除测试渲染的 DOM 元素
- 清理任何全局事件监听器
- 重置 React Testing Library 的内部状态

---

### ③ vi.fn() - 创建模拟函数

```typescript
import { vi } from 'vitest'
```

**vi** 是 vitest 的测试工具命名空间 (类似 Jest 的 `jest`)

#### vi.fn() - 创建空函数

```javascript
const mockFn = vi.fn()
mockFn() // 什么都不做
mockFn('a', 'b') // 接受参数但忽略
```

#### vi.fn().mockImplementation()

```javascript
// 自定义实现
const mockFn = vi.fn().mockImplementation((x) => x * 2)

mockFn(3) // 返回 6
mockFn(5) // 返回 10
```

---

## Mock 解释

### 什么是 Mock？

> Mock 就是"假的东西"，用来代替真实的功能

```typescript
// 真实函数 (可能很慢、有副作用、依赖外部)
function fetchUser() {
  return fetch('/api/user').then(r => r.json())
}

// Mock 函数 (假的，但行为类似)
const fetchUser = vi.fn().mockResolvedValue({ name: 'John' })
```

### 为什么要 Mock？

```
1. 速度：真实 API 可能很慢 → Mock 立即返回
2. 稳定性：不依赖外部服务 → 不会因为网络问题失败
3. 隔离性：只测试你的代码，不测试第三方库
```

---

## 我们的 Mock 配置

> 💡 提前剧透：为什么有两种不同的写法？

```
┌─────────────────────────────────────────────────────────────┐
│                     JavaScript 全局对象                       │
│                                                             │
│   浏览器环境:                                                │
│   ┌──────────────┐                                          │
│   │    window    │ ← 包含 matchMedia, document, localStorage │
│   └──────────────┘                                          │
│                                                             │
│   Node.js 环境:                                              │
│   ┌──────────────┐                                          │
│   │   global     │ ← Node.js 的"全局"                        │
│   └──────────────┘                                          │
│                                                             │
│   jsdom 环境 (我们用的):                                      │
│   ┌──────────────┐  ┌──────────────┐                       │
│   │    window    │  │   global     │ ← jsdom 同时提供两者     │
│   └──────────────┘  └──────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

简单来说：
- `matchMedia` 是 **window 上的方法** → 用 `Object.defineProperty`
- `ResizeObserver` 是 **构造函数(类)** → 直接赋值给 `global`

详细解释在后面 👇

---

### 1. window.matchMedia

```typescript
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
```

**什么是 matchMedia？**

```javascript
// 浏览器 API：检测媒体查询
window.matchMedia('(min-width: 768px)')
// 返回：{ matches: true/false, media: '(min-width: 768px)', ... }
```

**为什么需要 Mock？**
- jsdom 没有实现 matchMedia
- 很多 UI 库 (包括一些 Tailwind 内部) 用它检测响应式
- 没有这个 mock，可能会报错

---

### 2. ResizeObserver

```typescript
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
```

**什么是 ResizeObserver？**

```javascript
// 浏览器 API：监听元素尺寸变化
const observer = new ResizeObserver((entries) => {
  entries.forEach(entry => console.log(entry.contentRect))
})
observer.observe(document.querySelector('div'))
```

**为什么需要 Mock？**
- jsdom 没有 ResizeObserver
- 一些响应式组件可能用到
- 避免报错

---

##### 为什么两种写法不同？

| API | 是什么 | 怎么写 | 为什么 |
|-----|--------|--------|--------|
| `matchMedia` | **函数**，调用方式 `window.matchMedia(query)` | `Object.defineProperty(window, ...)` | matchMedia 是 `window` 上的**方法**，用 defineProperty 可以精确控制 |
| `ResizeObserver` | **类/构造函数**，使用方式 `new ResizeObserver(...)` | `global.ResizeObserver = ...` | ResizeObserver 是**构造函数**，直接赋值给 global 即可 |

**简单理解**：

```javascript
// matchMedia 是 window 上的方法
window.matchMedia('(min-width: 768px)')
//       ↑ 对象的方法

// ResizeObserver 是构造函数（类）
new ResizeObserver(callback)
// ^^^^^^ 需要 new，所以是构造函数
```

**为什么 ResizeObserver 不用 Object.defineProperty？**

因为 ResizeObserver 是一个**类**，不是普通的属性：

```typescript
// 如果用 defineProperty 会很麻烦
Object.defineProperty(global, 'ResizeObserver', {
  writable: true,
  value: class ResizeObserver { ... }  // 要写一整个类
})

// 直接赋值更简单
global.ResizeObserver = vi.fn().mockImplementation(() => ({...}))
```

---

## setup.ts 的执行流程

```
┌─────────────────────────────────────────────┐
│           vitest 启动                        │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│         运行 setup.ts                        │
│  1. 导入 jest-dom 匹配器                     │
│  2. 定义 afterEach 清理函数                  │
│  3. 配置全局 mock                           │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│         执行第一个测试文件                     │
│  beforeEach → it → afterEach                │
│  beforeEach → it → afterEach                │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│         执行第二个测试文件                     │
│  ...                                         │
└─────────────────────────────────────────────┘
```

---

## 小结

代码 | 作用
------|------
`import '@testing-library/jest-dom/vitest'` | 启用 `toBeInTheDocument()` 等断言
`afterEach(cleanup)` | 每个测试后清理 DOM，防止测试间污染
`vi.fn()` | 创建可追踪的模拟函数
`vi.fn().mockImplementation()` | 自定义模拟函数行为
`window.matchMedia` mock | 模拟媒体查询 API
`ResizeObserver` mock | 模拟尺寸观察 API

**记住**：setup.ts 会在**每个测试文件**运行前执行，是测试环境的基础。

下一章，我们来写真正的测试！
