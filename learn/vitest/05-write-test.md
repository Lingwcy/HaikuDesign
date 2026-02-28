# 第五章：编写测试

## 测试文件结构

```typescript
// src/components/Button/button.test.tsx
import { describe, it, expect, vi } from 'vitest'  // ①
import { render, screen, fireEvent } from '@testing-library/react'  // ②

describe('Button', () => {  // ③
  it('renders button with children', () => {  // ④
    render(<Button>Click me</Button>)  // ⑤
    expect(screen.getByRole('button')).toHaveTextContent('Click me')  // ⑥
  })
})
```

---

## 逐项解释

### ① 导入

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
```

| 导入 | 来源 | 作用 |
|------|------|------|
| `describe` | vitest | 分组测试 |
| `it` / `test` | vitest | 定义单个测试 |
| `expect` | vitest | 断言 |
| `vi` | vitest | 工具函数 (mock, fn) |
| `render` | testing-library | 渲染组件 |
| `screen` | testing-library | 查询 DOM 元素 |
| `fireEvent` | testing-library | 模拟事件 |

---

### ② describe - 测试分组

```typescript
describe('Button', () => {
  // 属于 Button 组件的测试
})
```

**作用**：
- 把相关的测试组织在一起
- 生成更清晰的测试报告

```text
✓ Button
  ✓ renders button with children
  ✓ handles click events
  ✓ handles disabled state
```

---

### ③ it / test - 定义测试

```typescript
// 这两种写法等价
it('renders button with children', () => { ... })
test('renders button with children', () => { ... })
```

**命名规范**：
```typescript
// ✅ 描述性名称
it('renders button with children')
it('handles click events')
it('disables when loading')

// ❌ 太笼统
it('test1')
it('works')
```

---

### ④ render - 渲染组件

```typescript
render(<Button>Click me</Button>)
```

**render 返回什么？**

```typescript
const { container, debug, unmount, rerender } = render(<Button />)

container     // 最外层 DOM 元素
debug()       // 打印 HTML 到 console (调试用)
unmount()     // 卸载组件 (类似 cleanup)
rerender()    // 重新渲染组件 (重要！)
```

---

##### rerender - 重新渲染

**什么时候用？**

当你需要测试同一组件的**不同 props** 时，不需要重新创建整个组件：

```typescript
// ❌ 不好的方式：每次都重新 render
const { rerender } = render(<Button variant="primary">Primary</Button>)
expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'primary')

rerender(<Button variant="dashed">Dashed</Button>)  // ← 用 rerender
expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'dashed')

// ✅ 好的方式：同一个组件，只换 props
```

**完整例子**：

```typescript
it('renders with different variants', () => {
  const { rerender } = render(<Button variant="primary">Primary</Button>)
  expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'primary')

  // 重新渲染，换成不同的 props
  rerender(<Button variant="dashed">Dashed</Button>)
  expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'dashed')

  // 再换成 text
  rerender(<Button variant="text">Text</Button>)
  expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'text')
})
```

**为什么不用 render？**

```typescript
// ❌ 每次 render 会创建新的 DOM 结构，可能影响测试隔离
render(<Button variant="primary" />)
render(<Button variant="dashed" />)  // 新建 DOM，旧的还在

// ✅ rerender 复用同一个 DOM，只更新内容
rerender(<Button variant="dashed" />)  // 更新现有 DOM
```

---

### ⑤ screen - 查询元素

```typescript
// screen 提供很多查询方法：
screen.getByRole('button')       // 通过 ARIA role
screen.getByText('Click me')     // 通过文本内容
screen.getByLabelText('Name')    // 通过 label
screen.getByPlaceholderText('...')// 通过占位符
screen.getByTestId('custom')     // 通过 data-testid
screen.queryByRole('button')     // 查询不报错，返回 null
```

**优先级** (按推荐顺序)：

```
1. getByRole        ← 最好！最接近用户感知
2. getByLabelText   ← 表单元素
3. getByPlaceholderText
4. getByText        ← 非交互元素
5. getByTestId      ← 最后手段
```

---

### ⑥ expect - 断言

```typescript
expect(screen.getByRole('button')).toHaveTextContent('Click me')
```

**常用断言**：

```typescript
// 存在性
expect(element).toBeInTheDocument()
expect(element).not.toBeInTheDocument()

// 文本内容
expect(element).toHaveTextContent('Hello')
expect(element).toContainHTML('<span>Hello</span>')

// 状态
expect(button).toBeDisabled()
expect(input).toBeEnabled()
expect(checkbox).toBeChecked()

// 属性
expect(img).toHaveAttribute('src', 'image.png')
expect(element).toHaveClass('active')

// 数量
expect(list.children).toHaveLength(3)
```

---

## 完整测试示例

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  // 1. 渲染测试
  it('renders button with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  // 2. 属性测试
  it('renders with default variant', () => {
    render(<Button>Default</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-variant', 'default')
  })

  // 3. 变体测试 (多次渲染)
  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'primary')

    rerender(<Button variant="dashed">Dashed</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'dashed')
  })

  // 4. 事件测试
  it('handles click events', () => {
    const handleClick = vi.fn()  // 创建 mock 函数
    render(<Button onClick={handleClick}>Click</Button>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)  // 被调用 1 次
  })

  // 5. 状态测试
  it('handles disabled state', () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Disabled</Button>)

    expect(screen.getByRole('button')).toBeDisabled()
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()  // 没有被调用
  })

  // 6. 加载状态测试
  it('handles loading state', () => {
    render(<Button loading>Loading</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })
})
```

---

## 常见测试模式

### 模式 1：渲染 + 查询 + 断言

```typescript
it('renders correctly', () => {
  render(<Component />)
  expect(screen.getByRole('button')).toBeInTheDocument()
})
```

### 模式 2：模拟交互

```typescript
it('responds to click', () => {
  const onClick = vi.fn()
  render(<Button onClick={onClick} />)

  fireEvent.click(screen.getByRole('button'))
  expect(onClick).toHaveBeenCalled()
})
```

### 模式 3：模拟表单输入

```typescript
it('handles input change', () => {
  const onChange = vi.fn()
  render(<Input onChange={onChange} />)

  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'hello' }
  })

  expect(onChange).toHaveBeenCalled()
  expect(screen.getByRole('textbox')).toHaveValue('hello')
})
```

### 模式 4：异步测试

```typescript
it('loads data asynchronously', async () => {
  render(<UserList />)

  // 等待加载完成
  await screen.findByText('User Name')

  expect(screen.getByText('User Name')).toBeInTheDocument()
})
```

---

## 测试命名约定

```
描述格式：[组件名] [行为/场景]

✓ it('Button renders with children')
✓ it('Button handles click when enabled')
✓ it('Button is disabled when loading')

✗ it('test')
✗ it('works')
```

---

## 小结

| 步骤 | 代码 | 说明 |
|------|------|------|
| 导入 | `import { it, expect } from 'vitest'` | 导入测试工具 |
| 分组 | `describe('Button', ...)` | 组织测试 |
| 测试 | `it('description', () => {...})` | 定义单个测试 |
| 渲染 | `render(<Component />)` | 渲染组件 |
| 查询 | `screen.getByRole('button')` | 找到元素 |
| 断言 | `expect(...).toBeInTheDocument()` | 验证结果 |

下一章，我们运行测试并查看结果！
