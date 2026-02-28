# HaikuDesign 项目架构分析

## 背景

本文档对 HaikuDesign 这个现代 React UI 组件库的架构设计进行分析，并针对长期迭代提出改进建议。

---

## 一、当前架构概览

```
HaikuDesign/
├── apps/
│   ├── backend/       # Python Flask (简单上传后端)
│   ├── docs/          # Rspress 文档站点
│   └── shop/         # 空目录(预留)
├── packages/
│   ├── cli/          # 空占位符
│   └── ui/           # React UI 组件库(核心)
├── package.json      # 根配置
├── pnpm-workspace.yaml
├── tsconfig.json
└── eslint.config.ts
```

### 技术栈

| 类别 | 技术 |
|------|------|
| UI 框架 | React 19 |
| 语言 | TypeScript 5.9 |
| 样式 | Tailwind CSS v4 |
| 构建工具 | tsup |
| 文档 | Rspress |
| 包管理 | pnpm workspaces |
| 代码规范 | ESLint |

### 组件库结构 (packages/ui)

```
src/
├── components/
│   ├── Button/
│   ├── Avatar/
│   ├── Bubble/
│   ├── Upload/
│   └── PlayBoard/    # 文档演示组件
├── lib/
│   └── utils.ts      # cn() 工具函数
├── styles/
│   ├── library.css
│   ├── preset.css    # 设计令牌
│   └── safelist.ts
└── index.ts
```

---

## 二、设计良好的部分

### 1. 构建流程

- tsup 双格式输出(ESM + CJS)
- 自动生成 `.d.ts` 类型声明
- Tree-shaking 优化
- React/React-DOM 作为 peerDependencies 外置

### 2. 设计系统

- Tailwind v4 自定义主题令牌
- OKLCH 色彩空间(更好的色彩混色)
- 自定义工具类 (haiku-focus-ring, haiku-upload-shine)

### 3. 组件模式

- 统一使用 `class-variance-authority` (CVA) 处理变体
- TypeScript 严格模式
- 数据属性用于样式钩子 (data-slot, data-variant)

### 4. 文档

- Rspress (基于 Rspack)
- PlayBoard 组件实现实时演示
- MDX 支持交互式演示

### 5. Workspace 配置

- pnpm workspaces 清晰配置
- 使用 `catalog:` 集中管理依赖版本(React/React-DOM)

---

## 三、需要改进的方面

### 关键缺失 (生产环境必备)

| 类别 | 现状 | 建议方案 |
|------|------|----------|
| **测试** | 无测试框架 | 引入 Vitest + React Testing Library |
| **视觉测试** | 无 | 添加 Chromatic 或本地视觉回归 |
| **Storybook** | 无 | 为组件开发添加 Storybook |
| **版本管理** | 手动 | 使用 @changesets/cli |
| **发布流程** | 手动 | GitHub Actions 自动化 |
| **Bundle 分析** | 无 | 添加 bundle 大小监控 |
| **无障碍测试** | 无 | 添加 jest-axe |

### 次要缺失

1. **CLI 包**: 空占位符 - 需要实现或移除
2. **PlayBoard**: 仅内部使用的演示组件，未文档化
3. **CI/CD**: 无 GitHub Actions 流水线
4. **Prettier**: 无代码格式化配置
5. **Husky**: 无 git hooks
6. **组件索引**: 无自动生成入口

---

## 四、长期迭代建议

### 高优先级 (立即实施)

#### 1. 添加测试基础设施

```bash
# 安装依赖
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom

# 配置 vitest
# vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

#### 2. 引入 Changesets

```bash
# 安装
pnpm add -D @changesets/cli

# 初始化
pnpm changeset init

# 使用流程
pnpm changeset add    # 添加变更
pnpm changeset version # 更新版本
pnpm changeset publish # 发布
```

#### 3. 创建 GitHub Actions CI

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: pnpm/action-setup@v2
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm build

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: pnpm/action-setup@v2
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm test
```

---

### 中优先级 (3-6个月内)

#### 1. 添加 Storybook

```bash
pnpm dlx storybook@latest init
```

Storybook 带来的价值:
- 组件独立开发环境
- 更好的团队协作
- 自动生成的组件文档

#### 2. 添加 Bundle 大小跟踪

```bash
pnpm add -D bundlesize
```

或在 PR 中添加 size bot 评论。

#### 3. 添加 Prettier

```bash
pnpm add -D prettier
```

创建 `.prettierrc` 配置文件，并更新 ESLint 与 Prettier 集成。

---

### 长期规划 (6-12个月)

#### 1. 设计令牌迁移

考虑从当前 OKLCH 色彩迁移到 CSS 变量，以便:
- 运行时主题切换
- 更灵活的深色模式
- SSR 友好

#### 2. 组件 API 稳定性策略

制定文档:
- 语义化版本控制策略
- Breaking Change 处理流程
- 弃用周期

#### 3. 贡献指南

创建 `CONTRIBUTING.md`:
- 开发环境设置
- 组件开发规范
- PR 提交流程

#### 4. 维护公开 CHANGELOG

使用 Changesets 自动生成或手动维护。

---

## 五、总结

HaikuDesign 是一个**坚实基础的** React UI 组件库，具备:

- 现代工具链 (tsup, Tailwind v4, Rspress)
- 良好的组件模式 (CVA 变体)
- 清晰的目录结构
- TypeScript 严格模式

### 主要差距

1. **缺少测试基础设施** - 这是最关键的缺失
2. **无自动化发布流程** - 手动版本管理易出错
3. **无 CI/CD** - 无法保证代码质量

### 建议优先级

1. 首先添加 Vitest 测试框架
2. 然后添加 Changesets 版本管理
3. 最后搭建 GitHub Actions CI

遵循以上改进，HaikuDesign 可以成为一个生产级别的 UI 组件库。
