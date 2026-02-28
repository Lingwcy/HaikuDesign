# 第三章：配置文件详解

## vitest.config.ts 做了什么？

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],           // ①
  test: {                       // ②
    environment: 'jsdom',       // ②.1
    globals: true,              // ②.2
    setupFiles: ['./src/test/setup.ts'], // ②.3
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'], // ②.4
    exclude: ['node_modules', 'dist'], // ②.5
    coverage: {                 // ②.6
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/components/**/*', 'src/lib/**/*'],
      exclude: ['src/test/**/*', '**/*.d.ts'],
    },
  },
  resolve: {                   // ③
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

---

## 逐项解释

### ① plugins: [react()]

```typescript
// 告诉 vitest 使用 React 插件
// 作用：让 vitest 能处理 JSX 语法
plugins: [react()],
```

**效果**：
- vitest 现在可以解析 `<Button />` 这样的 JSX 代码
- 支持 React 的 Hooks (useState, useEffect 等)

---

### ② test: { ... }

这是 vitest 特有的配置块，专门用于测试设置。

#### ②.1 environment: 'jsdom'

```typescript
// 告诉 vitest 用什么环境运行测试
environment: 'jsdom',
```

**可选值**：
- `'jsdom'` - 模拟浏览器 DOM (我们用这个)
- `'node'` - Node.js 环境
- `'happy-dom'` - 更快的 DOM 替代品
- `'edge'` - 模拟 Edge 浏览器

---

#### ②.2 globals: true

```typescript
// 开启全局变量
globals: true,
```

**效果**：
- 开启后，可以直接使用 `it()`, `expect()`, `describe()` 而不需要导入
- 不开启则需要 `import { it, expect } from 'vitest'`

```typescript
// globals: true ✓
// ❌ 不需要导入
it('test', () => { ... })

// globals: false
// ❌ 需要导入
import { it } from 'vitest'
it('test', () => { ... })
```

---

#### ②.3 setupFiles

```typescript
// 测试运行前执行的脚本
setupFiles: ['./src/test/setup.ts'],
```

**作用**：
- 在每个测试文件运行**之前**执行
- 通常用于：
  - 导入 jest-dom 匹配器
  - 设置全局 mock
  - 清理环境

---

#### ②.4 include

```typescript
// 哪些文件被识别为测试文件
include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
```

**模式解释**：
```
src/**/*.{test,spec}.tsx
│   │  │    │        │
│   │  │    │        └── 文件后缀
│   │  │    └─────────── 或 .spec.tsx
│   │  └────────────── 任意目录
│   └───────────────── 任何文件名
└───────────────────── 只在 src 目录
```

**常见的测试文件命名**：
- `button.test.tsx` ← 我们用的
- `button.spec.tsx`
- `button.test.js`

---

#### ②.5 exclude

```typescript
// 排除哪些文件
exclude: ['node_modules', 'dist'],
```

**作用**：不扫描 node_modules 和 dist 目录，加快测试速度

---

#### ②.6 coverage - 代码覆盖率

```typescript
// 代码覆盖率配置
coverage: {
  provider: 'v8',              // 覆盖率引擎
  reporter: ['text', 'json', 'html'],  // 输出格式
  include: ['src/components/**/*', 'src/lib/**/*'], // 检查哪些文件
  exclude: ['src/test/**/*', '**/*.d.ts'], // 排除哪些文件
},
```

---

##### 覆盖率到底是什么？

**简单理解**：覆盖率 = "你的代码有多少被测试执行了？"

想象一下，你有一本习题集：

```
覆盖率 0%   → 根本没做题
覆盖率 50%  → 做了一半的题
覆盖率 100% → 全部题目都做了
```

代码也是一样的道理：

```javascript
// 假设你有这样一段代码
function greet(name) {
  if (name) {                    // ← 分支 A
    return `Hello, ${name}`      // ← 语句 1
  }
  return 'Hello, stranger'        // ← 语句 2 (分支 B)
}
```

**覆盖情况分析**：

| 覆盖类型 | 什么是"被覆盖" | 例子 |
|----------|----------------|------|
| **语句覆盖** | 这行代码执行了吗？ | `return 'Hello, stranger'` 执行了吗？ |
| **分支覆盖** | if/else 两个分支都执行了吗？ | `name` 为空时，else 分支执行了吗？ |
| **函数覆盖** | 这个函数被调用了吗？ | `greet()` 被调用了吗？ |

---

##### 举例说明

```javascript
// 只有测试调用 greet('John')
greet('John')  // → 返回 "Hello, John"
```

这会导致：

```
语句覆盖: 50%
  ✓ return `Hello, ${name}` 执行了
  ✗ return 'Hello, stranger' 没执行

分支覆盖: 50%
  ✓ if (name) 分支执行了
  ✗ else 分支没执行
```

如果我们再测一次 `greet()` 不传参数：

```
语句覆盖: 100% ✓
分支覆盖: 100% ✓
```

---

##### 覆盖率报告怎么看？

运行 `pnpm test:coverage` 后：

```
 % Files        |  % Stmts |  % Branch |  % Funcs |  % Lines | Uncovered |
----------------|----------|----------|----------|----------|-----------|
 All files      |   45.23  |   30.00  |   40.00  |   45.23  |           |
 components/    |   50.00  |   33.33  |   44.44  |   50.00  |           |
   Button/      |  100.00  |  100.00  |  100.00  |  100.00  |           │ ← 全部覆盖
 lib/           |    0.00  |    0.00  |    0.00  |    0.00  |           │ ← 零覆盖
```

- **Button/** = 100% = 测试完善
- **lib/** = 0% = 完全没有测试

---

##### 覆盖率要达到多少？

| 目标 | 说明 |
|------|------|
| 50-60% | 最低保障 |
| 70-80% | 良好目标 (推荐) |
| 90%+ | 很难达到，收益递减 |

**重要提醒**：
> 覆盖率 100% ≠ 代码没有 bug！

覆盖率只是说明"代码被执行过"，不能证明"代码逻辑正确"。

---

### ③ resolve.alias

```typescript
// 路径别名配置
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
```

**作用**：让 `@/` 可以代替 `./src/`

```typescript
// 之前
import { Button } from '../../components/Button'

// 配置 alias 后
import { Button } from '@/components/Button'
```

---

## package.json 中的测试脚本

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

| 命令 | 作用 |
|------|------|
| `pnpm test` | 运行测试 (带 watch 模式) |
| `pnpm test -- --run` | 运行一次测试 (CI 用) |
| `pnpm test:ui` | 打开可视化测试界面 |
| `pnpm test:coverage` | 生成覆盖率报告 |

---

## 小结

配置项 | 作用 | 重要程度
--------|------|----------
plugins: [react()] | 支持 JSX | ⭐⭐⭐
environment: 'jsdom' | 模拟浏览器 | ⭐⭐⭐
globals: true | 简化导入 | ⭐
setupFiles | 初始化环境 | ⭐⭐⭐
include/exclude | 控制测试范围 | ⭐⭐
coverage | 覆盖率报告 | ⭐⭐

下一章，我们看 setup.ts 里面做了什么。
