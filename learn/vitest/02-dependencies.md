# 第二章：测试依赖详解

## 我们安装了哪些包？

```bash
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

## 每个包的作用

### 1. vitest

> **测试运行器 (Test Runner)**

```javascript
// vitest 做的事情：
// 1. 扫描测试文件 (*.test.tsx)
// 2. 执行每个测试用例 (it, test)
// 3. 报告测试结果 (通过/失败)
```

**类比**：vitest 就像监考老师，负责运行考试并打分。

```javascript
// 一个简单的 vitest 测试
import { it, expect } from 'vitest'

it('1 + 1 = 2', () => {
  expect(1 + 1).toBe(2)
})
```

---

### 2. @vitejs/plugin-react

> **Vite 的 React 插件**

```javascript
// 这个插件让 Vite (vitest 底层使用 Vite) 能够：
// 1. 理解 JSX 语法
// 2. 支持 React 的 Fast Refresh
// 3. 处理 React 特定的文件
```

**为什么需要它？**
- 我们的组件使用 JSX 编写
- 没有这个插件，vitest 无法解析 `.tsx` 文件

---

### 3. @testing-library/react

> **React 组件测试库**

```javascript
// @testing-library/react 做的事情：
// 1. 渲染 React 组件到虚拟 DOM
// 2. 提供查询方法 (getByRole, getByText...)
// 3. 模拟用户交互 (点击、输入...)
```

**核心原则**：
> "The more your tests resemble the way your software is used, the more confidence they can give you."

测试应该像真实用户一样使用组件，而不是直接调用内部方法。

```javascript
// ❌ 不好：直接测试内部状态
const wrapper = shallow(<Button />)
expect(wrapper.state('loading')).toBe(true)

// ✅ 好：像用户一样测试
render(<Button loading>Loading</Button>)
expect(screen.getByRole('button')).toBeDisabled()
```

---

### 4. @testing-library/jest-dom

> **DOM 断言扩展**

```javascript
// 这个包提供了一堆实用的 expect 匹配器：

expect(element).toBeInTheDocument()     // 元素存在
expect(element).toHaveTextContent('hi') // 包含文本
expect(element).toBeDisabled()           // 已禁用
expect(element).toHaveClass('active')    // 有这个 class
expect(element).toHaveAttribute('data-x')// 有这个属性
```

**原来我们要这样写**：
```javascript
// 没有 jest-dom
expect(document.querySelector('button')).not.toBeNull()
expect(document.querySelector('button').getAttribute('disabled')).toBe('')
```

**现在可以这样写**：
```javascript
// 有 jest-dom
expect(screen.getByRole('button')).toBeDisabled()
```

---

### 5. jsdom

> **JavaScript 的 DOM 实现**

```javascript
// jsdom 在 Node.js 环境中模拟浏览器 DOM：
// - document, window, HTMLElement
// - 事件系统 (click, input...)
// - CSS 计算
```

**为什么需要它？**
- 浏览器有 DOM，但 Node.js 没有
- jsdom 让测试可以在命令行运行，不需要真实浏览器

```javascript
// 在 Node.js 中，jsdom 让这段代码可以工作：
document.createElement('div')
window.location.href = 'http://test.com'
```

---

## 依赖关系图

```
                    ┌─────────────┐
                    │   vitest    │  ← 测试运行器 (监考老师)
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
   ┌─────────────┐  ┌─────────────┐  ┌───────────┐
   │vite-plugin- │  │testing-lib  │  │  jsdom    │
   │   react     │  │  -react     │  │           │
   │(JSX解析)    │  │(渲染+查询)  │  │(DOM模拟)  │
   └─────────────┘  └──────┬──────┘  └───────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ jest-dom    │
                    │ (断言扩展)   │
                    └─────────────┘
```

## 小结

| 包 | 作用 | 类比 |
|---|------|------|
| vitest | 运行测试 | 监考老师 |
| @vitejs/plugin-react | 解析 JSX | 翻译官 |
| @testing-library/react | 渲染+查询组件 | 用户代理 |
| @testing-library/jest-dom | 更好的断言 | 更好的检查标准 |
| jsdom | 模拟浏览器 | 虚拟浏览器 |

下一章，我们创建配置文件，把这些工具组合起来。
