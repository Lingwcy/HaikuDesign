# @ant-design/x `Actions`（x-2.1.1）技术分析报告（用于 HaikuDesign 复现）

> 源码位置：`D:\UI-design\x-2.1.1\packages\x\components\actions`  
> 目标：解释该组件的实现原理、交互细节、样式与动画机制，并给出在 **不使用 Tooltip** 的前提下的复现建议。

## 1. 组件定位与能力边界

`Actions` 的本质是一个“**水平排列的图标操作条**”，用于在 AI/内容场景里快速提供一组轻量操作（重试、编辑、复制、反馈、更多菜单等）。

核心能力：

- 渲染一个 `items` 列表，按顺序输出操作项（默认是“图标按钮”外观）。
- 每个操作项支持三种形态（互斥，按优先级匹配）：
  1) `actionRender`：完全自定义渲染（ReactNode 或函数），用于塞入分页器、复合控件、预设组件等  
  2) `subItems`：下拉菜单（更多操作）  
  3) 普通图标项：点击触发回调，支持 `danger`（危险态）
- 变体 `variant`: `borderless | outlined | filled`（影响容器/项的背景、边框与内边距）
- 进入动画：`fadeIn` / `fadeInLeft`（基于 `rc-motion` + antd motion token）
- “复合组件”导出：`Actions.Feedback / Actions.Copy / Actions.Audio / Actions.Item`

不包含/不负责的能力：

- 不做“溢出折叠”（overflow 管理）；多了就横向撑开/换行由外部决定。
- 默认项不是 `<button>`，也没有键盘交互与可访问性增强（复现时建议补齐）。
- Tooltip 只是 label 展示手段，不影响业务逻辑（本报告后面给出不使用 Tooltip 的复现方式）。

## 2. 文件结构与职责拆分

主入口与渲染：

- `index.tsx`：`Actions` 容器与列表渲染；动画挂载；Context 下发样式语义信息；ref 代理
- `Item.tsx`：单个列表项的默认渲染（普通图标项 / subItems 菜单项 / actionRender）
- `ActionsMenu.tsx`：`subItems` 的下拉菜单实现 + `findItem`（通过 `keyPath` 找到被点击的子项）

预设/扩展项（作为 `Actions.*` 暴露，通常通过 `actionRender` 嵌入到 `Actions` 列表里）：

- `ActionsItem.tsx`：独立的“状态图标按钮”（`default/running/loading/error`），用于“可切换状态”的动作
- `ActionsAudio.tsx`：基于 `ActionsItem` 的音频动作预设（`MutedOutlined` + 录音中 icon）
- `ActionsCopy.tsx`：基于 `antd` 的 `Typography.Text copyable` 的复制动作预设
- `ActionsFeedback.tsx`：like/dislike 反馈预设（带 locale 文案）

样式与动画 token：

- `style/index.ts`：Actions 样式、变体样式、通用 item/list 样式；同时注入 `fade`/`fade-left` motion
- `style/*`：Copy/Feedback/Audio 的局部补充样式

## 3. 对外 API（数据模型 + 事件模型）

### 3.1 `ActionsProps`（主组件）

定义见：`interface.ts`

- `items: ItemType[]`
- `onClick?: ({ item, key, keyPath, domEvent }) => void`
- `dropdownProps?: DropdownProps`（透传到 antd `Dropdown`）
- `variant?: 'borderless' | 'filled' | 'outlined'`
- `fadeIn?: boolean`、`fadeInLeft?: boolean`
- `classNames/styles/rootClassName`：语义化样式覆盖（并可被 `XProvider` 全局注入）

### 3.2 `ItemType`（每个 action）

关键字段：

- `key?: string`：标识（用于回调 `key` 与 `keyPath`）
- `label?: string`：动作文案（源码默认通过 Tooltip 展示）
- `icon?: ReactNode`：动作图标（普通项/菜单触发器使用）
- `danger?: boolean`：危险态（变红）
- `onItemClick?: (info?: ItemType) => void`：**优先级高于** `ActionsProps.onClick`
- `subItems?: ItemType[]（去掉 subItems/triggerSubMenuAction/actionRender）`：启用下拉菜单
- `triggerSubMenuAction?: 'hover' | 'click'`：下拉触发方式
- `actionRender?: ReactNode | (item) => ReactNode`：完全接管该项渲染

### 3.3 事件优先级与回调语义

普通项点击（`Item.tsx`）：

1. 若 `item.onItemClick` 存在：只调用它，并 **return**（不会触发 `ActionsProps.onClick`）
2. 否则调用 `ActionsProps.onClick`，传参：
   - `key`: `item.key`（缺省时为内部生成的 `useId()`）
   - `keyPath`: `[key]`
   - `item`: 原 item
   - `domEvent`: 点击事件

菜单项点击（`ActionsMenu.tsx`）：

- 先通过 `findItem(keyPath, subItems)` 找到真实被点的子 item
- 若该子 item 有 `onItemClick`：只调用它（并 return）
- 否则调用 `ActionsProps.onClick`，其中：
  - `key`：被点击子项的 key
  - `keyPath`：`[...keyPath, parentKey]`（把父项 key 追加到末尾）
  - `item`：被点击子 item

注意：antd `Menu` 的 `keyPath` 顺序是“从当前到父级”的数组；该实现选择“再把当前 Actions 的 parentKey 追加到最后”。如果你在 HaikuDesign 复现时不使用 antd Menu，可直接定义更直观的 `keyPath`（例如 `['parent', 'child']`）但要确保与业务消费一致。

## 4. 渲染流程（核心原理）

### 4.1 `Actions` 容器与列表

源码：`index.tsx`

关键点：

- 通过 `useXProviderContext()` 获取：
  - `getPrefixCls('actions')` -> `prefixCls`（默认类似 `ant-actions`）
  - `direction`（用于 RTL class）
- 通过 `useXComponentConfig('actions')` 合并全局配置（来自 `XProvider`），再与本地 `classNames/styles` 合并后下发到 `ActionsContext`
- 通过 `CSSMotion`（`rc-motion`）把“进入动画 className”注入到列表容器（`${prefixCls}-list`）

最终 DOM（简化）：

```html
<div class="ant-actions ...">
  <div class="ant-actions-list ant-actions-variant-xxx ant-x-fade-appear ...">
    <!-- items -->
  </div>
</div>
```

### 4.2 单项渲染分支（`Item.tsx`）

对每个 `item`，依次匹配：

1. `actionRender`：直接渲染（函数则调用 `actionRender(item)`）
2. `subItems`：渲染 `ActionsMenu`（下拉）
3. 否则渲染普通图标项：
   - 容器：`<div class="${prefixCls}-item">`
   - 内部：`<div class="${prefixCls}-icon">{item.icon}</div>`
   - 点击逻辑：见上面的事件模型

此处源码用了 `Tooltip title={item.label}` 包住 icon（复现时可移除，见第 7 节）。

## 5. 动画机制（fadeIn / fadeInLeft）

源码：`index.tsx` + `style/index.ts` + `components/style/motion/fade.ts`

- `Actions` 根据 `fadeIn/fadeInLeft` 生成 `motionName`：
  - `fadeIn` -> `${rootPrefixCls}-x-fade`（通常为 `ant-x-fade`）
  - `fadeInLeft` -> `${rootPrefixCls}-x-fade-left`
- `style/index.ts` 调用 `initFadeMotion` / `initFadeLeftMotion`，把对应的 `@keyframes` 与 enter/leave 状态样式注入

效果差异：

- `fadeIn`：纯 opacity 从 0 -> 1（时长约 1.2s）
- `fadeInLeft`：利用 `mask-image + mask-position` 做“从左到右显现”的擦除效果（时长约 1s）

复现要点（不依赖 antd/rc-motion 也可做）：

- 把动画 class 挂在 list 容器上（进入时添加 `*-appear`/`*-enter`）
- `fadeInLeft` 的关键在于 mask 的渐变与 `mask-position` 动画（在部分浏览器/渲染环境可能需要降级为普通 fade）

## 6. 样式体系（布局、尺寸、变体、危险态）

源码：`style/index.ts`

### 6.1 布局与基础 item 形态

- list：`inline-flex` 横向排列、`gap: token.paddingXS`、垂直居中
- item：`inline-flex` + 居中，固定高度 `token.controlHeightSM`，左右/上下 padding 为 `token.paddingXXS`（并做了 +1 的微调），hover 背景 `token.colorBgTextHover`
- icon：继承 `token.fontSize`，容器也是 `inline-flex` 居中

### 6.2 变体（`variant-*`）

- `borderless`：默认，仅使用基础 item hover
- `outlined`：给 list 容器加 padding + 边框 + 圆角
- `filled`：给 list 容器加 padding + 背景色（用的是 `colorBorderSecondary`），同时 item 的 hover 改为“透明背景，仅变色”

### 6.3 危险态（`danger`）

普通 item 若 `danger: true`：

- 会在 item 上追加 class：`${prefixCls}-list-danger`
- 样式把文字/图标颜色切到 `token.colorError`

### 6.4 与 Pagination 的兼容细节

样式里包含：

- `${antCls}-pagination-item-link { width: token.controlHeightSM }`

目的是当你用 `actionRender` 塞入 `Pagination simple` 时，让翻页按钮更“方形/紧凑”，视觉上融入 action bar。

## 7. 复现建议（HaikuDesign，且不使用 Tooltip）

源码中 Tooltip 的作用只有一个：**hover 时展示 `label` 文案**。不使用 Tooltip 后，必须补齐两件事：

1) **信息可达性**：用户如何知道每个 icon 的含义  
2) **可访问性**：屏幕阅读器/键盘用户如何理解与操作

建议的替代方案（按侵入程度从低到高）：

### 7.1 最低成本：使用 `title` + `aria-label`

- 普通项：在可点击节点上设置 `title={label}` 与 `aria-label={label}`
- 状态项（`Actions.Item` / `Actions.Audio` / `Actions.Feedback`）：同样在根节点补 `aria-label`

优点：实现最小；缺点：title 的展示由浏览器控制，样式不可控（但你已明确“不使用 tooltip”，这通常是可接受的）。

### 7.2 在 UI 中“常显文案/辅助文案”

- icon 右侧显示短 label（例如仅在 `outlined/filled` 模式下显示）
- 或在 hover/focus 时显示一行轻量文本（非浮层，不算 tooltip），例如：
  - item 下方出现 1 行 caption（用 CSS 控制显隐）

### 7.3 可访问性推荐（强烈建议在复现时做）

源码默认用 `<div onClick>`，建议复现时改为：

- `<button type="button">` 或 `<div role="button" tabIndex=0>`（并处理 `Enter/Space`）
- `aria-label`：来自 `label` 或者由外部传入
- `aria-disabled/disabled`：如果未来要支持禁用态

这不改变视觉，但会显著提升可用性与一致性。

## 8. 复现实现清单（最小可用到完整）

### 8.1 最小可用（复刻 80% 体验）

- 水平 `inline-flex` action bar（支持 `gap`）
- 单项：icon + hover 背景（或 filled 模式下的 hover 变色）
- `variant` 三态：`borderless/outlined/filled`
- `danger`：危险色
- 点击回调：实现 `onItemClick` 优先级 + `onClick({key,keyPath,item,domEvent})`

### 8.2 进阶（完整复刻）

- `subItems` 下拉菜单：
  - 触发器 icon（默认 `…`）
  - `hover/click` 两种触发方式
  - menu 点击回调要能返回“被点子项 + keyPath（包含父 key）”
- `fadeIn/fadeInLeft` 进入动画（可按环境对 `fadeInLeft` 做降级）
- 预设项：
  - Copy：剪贴板复制（Web 可用 `navigator.clipboard.writeText`）
  - Feedback：`default/like/dislike` 三态，default 显示双按钮，选中后只显示单侧按钮
  - Audio：`default/loading/running/error` 状态映射（图标与 label）

## 9. 可能的坑与实现细节（复现时注意）

- `actionRender` 的优先级最高：一旦使用，你要自己处理点击、禁用、aria 等所有行为。
- `key` 缺省时：源码会用 `React.useId()` 生成；如果你的实现不具备类似机制，建议强制要求 key，避免回调里出现不稳定标识。
- `subItems` 的数据结构在 antd Menu 中要求 `items` 形状；源码直接把 `subItems` cast 到 `MenuProps['items']`，因此“子项字段命名/结构”会受 antd 约束。你复现时可以重新定义更干净的 schema。
- 该组件的样式体系依赖 antd token（尺寸/颜色/动效曲线）。在 HaikuDesign 复现时建议把这些抽成你们自己的 design tokens（如：`actionHeight`, `actionPadding`, `actionHoverBg`, `dangerColor`）。

## 10. 依赖项梳理（便于替换/裁剪）

渲染/工具：

- `classnames`
- `rc-motion`（进入动画 class 管理）
- `rc-util/lib/pickAttrs`（只透传 `attr/aria/data`）
- `rc-util/lib/ref`（composeRef）

antd（可替换）：

- `Tooltip`：仅用于 hover 展示 label（你们不使用，可移除/替代）
- `Dropdown` + `MenuProps`：用于 `subItems` 下拉菜单
- `Typography.Text copyable`：用于复制能力
- `@ant-design/icons`：默认图标（可用你们的 icon 系统替换）

