# Vitest 测试教程

> 从零开始学习组件库测试

## 目录

| 章节 | 标题 | 内容 |
|------|------|------|
| 01 | [为什么需要测试？](01-why-test.md) | 测试的概念、收益、测试金字塔 |
| 02 | [测试依赖详解](02-dependencies.md) | vitest, testing-library, jsdom |
| 03 | [配置文件详解](03-config.md) | vitest.config.ts 每一项的作用 |
| 04 | [setup.ts 详解](04-setup.md) | 测试环境初始化和 Mock |
| 05 | [编写测试](05-write-test.md) | 如何测试：写render, screen, expect |
| 06 | [运行测试](06-run-test.md) | 命令行使用和 CI 集成 |

## 快速开始

```bash
# 运行测试
cd packages/ui
pnpm test

# 运行测试 (一次性)
pnpm test -- --run

# 生成覆盖率
pnpm test:coverage
```

## 相关资源

- [Vitest 官方文档](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [VitestMatchers](https://github.com/testing-library/jest-dom)
