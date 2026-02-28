# 第六章：运行测试

## 测试命令

```bash
# 进入 UI 包目录
cd packages/ui

# 开发模式 (watch mode - 文件变化自动重测)
pnpm test

# 一次性运行 (适合 CI)
pnpm test -- --run

# 打开可视化 UI
pnpm test:ui

# 生成覆盖率报告
pnpm test:coverage
```

---

## 运行结果解读

### 成功输出

```text
➜  pnpm test -- --run

  RUN  src/components/Button/button.test.tsx (11 tests | 297ms)

  ✓ src/components/Button/button.test.tsx (11 tests | 288ms)
    ✓ renders button with children        136ms
    ✓ renders with default variant         17ms
    ✓ renders with different variants     41ms
    ✓ renders with different sizes         23ms
    ✓ renders with different shapes       10ms
    ✓ handles click events                 14ms
    ✓ handles disabled state               12ms
    ✓ handles loading state                10ms
    ✓ renders with icon                    21ms
    ✓ renders as label when as="label"       2ms
    ✓ applies custom className              10ms

 ✓ Test Files  1 passed (1)
 ✓ Tests      11 passed (11)
```

### 解读

| 行 | 含义 |
|---|------|
| `RUN` | 正在运行的文件 |
| `✓` | 测试通过 |
| `(11 tests | 297ms)` | 11 个测试，总耗时 297ms |
| `Test Files 1 passed` | 1 个测试文件全部通过 |
| `Tests 11 passed` | 11 个测试全部通过 |

---

### 失败输出

```text
 FAIL  src/components/Button/button.test.tsx (1 test | 21ms)

  × renders with icon

    TestingLibraryElementError: Unable to find an accessible element

    <body>
      <div>
        <button>...</button>
      </div>
    </body>
```

**解读**：
- `×` 表示失败
- 显示具体哪个测试失败
- 显示错误类型和实际 DOM

---

## 覆盖率报告

```bash
pnpm test:coverage
```

输出：

```text
➜  Coverage report: html

 % Files        |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered |
----------------|----------|----------|----------|----------|-----------|
 All files      |   45.23  |   30.00  |   40.00  |   45.23  |           |
 src/           |   45.23  |   30.00  |   40.00  |   45.23  |           |
 components/    |   50.00  |   33.33  |   44.44  |   50.00  |           |
   Button/      |  100.00  |  100.00  |  100.00  |  100.00  |           |
 lib/           |    0.00  |    0.00  |    0.00  |    0.00  |           |
```

---

## 覆盖率指标

| 指标 | 含义 | 推荐值 |
|------|------|--------|
| **Stmts** | 语句执行率 | > 80% |
| **Branch** | if/else 分支覆盖 | > 75% |
| **Funcs** | 函数执行率 | > 80% |
| **Lines** | 代码行执行率 | > 80% |

---

## 可视化 UI (可选)

```bash
pnpm test:ui
```

启动一个本地网页：

```
  Vitest UI

  ┌─────────────────────────────────────────────────┐
  │  ✓ Button.test.tsx                              │
  │    ✓ renders...                                 │
  │    ✓ handles...                                 │
  │                                                 │
  │  11 tests passed                                │
  └─────────────────────────────────────────────────┘
  http://localhost:51204/__vitest__
```

---

## 在 CI 中运行

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install deps
        run: pnpm install

      - name: Run tests
        run: pnpm test -- --run
```

---

## 调试技巧

### 1. 只运行单个测试

```typescript
// 在测试中添加 .only
it.only('only this test runs', () => { ... })

// 或
test.only('only this test runs', () => { ... })
```

### 2. 跳过某个测试

```typescript
it.skip('this test is skipped', () => { ... })
```

### 3. 查看渲染的 HTML

```typescript
it('debug', () => {
  const { debug } = render(<Button>Hi</Button>)
  debug()  // 打印 HTML 到 console
})
```

### 4. 保持测试窗口打开

```bash
# 不要 --run，让它保持运行
pnpm test
# 然后修改文件会自动重测
```

---

## 小结

| 命令 | 场景 |
|------|------|
| `pnpm test` | 开发时实时测试 |
| `pnpm test -- --run` | CI / 一次性运行 |
| `pnpm test:ui` | 可视化界面 |
| `pnpm test:coverage` | 查看覆盖率 |

**开发流程建议**：
1. 开发时：`pnpm test` (watch 模式)
2. 提交前：`pnpm test -- --run` (确保全部通过)
3. 定期：`pnpm test:coverage` (检查覆盖率)

---

## 下一步

现在你已经掌握了：
- ✅ 为什么需要测试
- ✅ 测试依赖的作用
- ✅ 配置文件
- ✅ setup.ts
- ✅ 如何编写测试
- ✅ 如何运行测试

**建议练习**：
1. 为 Avatar 组件编写测试
2. 为 Upload 组件编写测试
3. 提高整体测试覆盖率

祝你在测试的道路上愉快前行！🎉
