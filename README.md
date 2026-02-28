# HaikuDesign

> 一个现代化的 React UI 组件库，包含完整的设计系统和文档

> A modern React UI component library with complete design system and documentation

---

## 特性 Features

### 核心 Core

- **React 19** + **TypeScript** - 现代化的技术栈
- **Tailwind CSS v4** - 基于 Utility-first 的 CSS 框架
- **pnpm Workspaces** - 高效的 monorepo 包管理
- **Vitest** - 快速可靠的单元测试

### 组件 Components

- **Button** - 按钮组件
- **Bubble** - 聊天气泡组件
- **Upload** - 文件上传组件（支持按钮/图片/拖拽模式）
- 更多组件开发中...

### 文档 Documentation

- **Rspress** - 高性能的文档框架
- **PlayBoard** - 交互式组件演示
- 中英双语文档

---

## 项目结构 Project Structure

```
HaikuDesign/
├── apps/
│   ├── backend/       # Python Flask 后端 (文件上传服务)
│   ├── docs/          # Rspress 文档站点
│   └── shop/          # 商店应用 (预留)
├── packages/
│   ├── cli/           # CLI 工具包 (预留)
│   └── ui/            # React UI 组件库
└── learn/             # 学习资料 (Vitest 教程等)
```

---

## 快速开始 Quick Start

### 安装 Install

```bash
# 安装依赖
pnpm install
```

### 开发 Development

```bash
# UI 包开发 (watch 模式)
cd packages/ui && pnpm dev

# 文档开发
cd apps/docs && pnpm dev

# 后端开发
cd apps/backend && python app.py
```

### 构建 Build

```bash
# 构建 UI 包
cd packages/ui && pnpm build

# 构建文档
cd apps/docs && pnpm build
```

### 测试 Testing

```bash
# 运行测试
cd packages/ui && pnpm test

# 测试覆盖
cd packages/ui && pnpm test:coverage
```

---

## 使用 Usage

### 安装 UI 包

```bash
pnpm add haiku-ui
```

### 在项目中使用

```tsx
import { Button, Upload } from 'haiku-ui';
import 'haiku-ui/styles.css';

function App() {
  return (
    <div>
      <Button>点击我</Button>
      <Upload action="/api/upload" />
    </div>
  );
}
```

---

## 技术栈 Tech Stack

| 类别 | 技术 |
|------|------|
| UI 框架 | React 19 |
| 语言 | TypeScript 5.9 |
| 样式 | Tailwind CSS v4 |
| 构建 | tsup |
| 测试 | Vitest + React Testing Library |
| 文档 | Rspress |
| 包管理 | pnpm |
| 后端 | Python Flask |

---

## 贡献 Contributing

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/xxx`)
3. 提交更改 (`git commit -m 'Add xxx'`)
4. 推送分支 (`git push origin feature/xxx`)
5. 创建 Pull Request

---

## 许可证 License

MIT License - see [LICENSE](./LICENSE) for details

---

## 联系方式 Contact

- GitHub: [https://github.com/Lingwcy/HaikuDesign](https://github.com/Lingwcy/HaikuDesign)
