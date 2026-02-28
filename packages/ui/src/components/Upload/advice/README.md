# Upload 组件优化建议

> 本文档记录 Upload 组件的优化建议和技术方案，供持续迭代参考。

---

## 一、当前架构分析

### 1.1 现有结构

```
Upload/
├── index.tsx          # 主组件，处理核心逻辑 (统一 API)
├── types.ts           # 类型定义和 CVA 变体
├── utils.ts           # XHR 上传工具函数
├── advice/           # 本文档目录
└── components/
    ├── FileList.tsx       # 文件列表组件 (新增)
    ├── ButtonUpload.tsx   # 按钮样式
    ├── DraggerUpload.tsx  # 拖拽样式
    ├── ImageUpload.tsx    # 图片样式
```

### 1.2 当前能力

| 能力 | 状态 |
|------|------|
| 三种上传模式 (button/image/dragger) | ✅ |
| 文件选择 | ✅ |
| 拖拽上传 | ✅ |
| 上传进度 (每文件) | ✅ |
| 取消上传 | ✅ |
| 重置上传 | ✅ |
| 图片预览 | ✅ |
| 多文件上传 | ✅ |
| 文件列表显示 | ✅ |
| 文件类型验证 (accept) | ✅ |
| 文件大小验证 (maxSize/minSize) | ✅ |
| 文件数量验证 (maxCount) | ✅ |
| 手动上传模式 (autoUpload=false) | ✅ |
| 自定义请求体数据 (data) | ✅ |
| 强类型 accept | ✅ |
| 目录上传 (directory) | ✅ |

---

## 二、已完成的功能

> 以下功能已在 v1.x 中实现，供参考。

### 2.1 文件验证 ✅ 已完成

**状态**：✅ 已完成

**实现位置**：
- `index.tsx` - `validateFile`, `validateFiles` 函数

**使用示例**：

```tsx
<Upload
  accept="image/*"
  maxSize={5 * 1024 * 1024}
  minSize={1024}
  maxCount={3}
  onError={(error) => console.log(error.message)}
/>
```

**强类型支持**：

```typescript
// types.ts
export type UploadAcceptType =
  | 'image/*' | 'video/*' | 'audio/*'
  | 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
  | 'application/pdf' | 'application/zip'
  | `.${string}`;  // 自定义扩展名

export type UploadAccept = UploadAcceptType | `${UploadAcceptType},${string}` | string;
```

---

### 2.2 自定义请求体 ✅ 已完成

**状态**：✅ 已完成

**使用示例**：

```tsx
<Upload
  action="/api/upload"
  data={{ folder: 'documents', category: 'user' }}
  name="attachment"
/>
```

---

### 2.3 手动上传模式 ✅ 已完成

**状态**：✅ 已完成 (使用 `autoUpload` 属性)

**使用示例**：

```tsx
<Upload
  mode="button"
  action="/api/upload"
  autoUpload={false}
  onChange={(files) => console.log(files)}
>
  <button onClick={triggerUpload}>上传</button>
</Upload>
```

---

### 2.4 目录上传 ✅ 已完成

**状态**：✅ 已完成

**实现**：使用 `webkitdirectory` 属性（需要 `@ts-expect-error` 因为是非标准属性）

**使用示例**：

```tsx
<Upload
  mode="button"
  directory={true}
  action="/api/upload"
/>
```

当启用时，用户可以选择整个目录，组件会获取目录中的所有文件。

**实现**：使用 `webkitdirectory` 属性

```tsx
<input
  type="file"
  // @ts-ignore - webkitdirectory 是非标准属性
  webkitdirectory={directory}
  multiple
/>
```

---

### 2.5 粘贴上传

**问题**：用户可能想直接从剪贴板粘贴图片。

```typescript
interface UploadProps {
  /** 是否支持粘贴上传 */
  paste?: boolean;
}
```

**实现**：

```typescript
// 在组件中添加 paste 事件监听
useEffect(() => {
  if (!paste) return

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    const files = Array.from(items)
      .filter(item => item.type.startsWith('image/'))
      .map(item => item.getAsFile())
      .filter(Boolean) as File[]

    if (files.length > 0) {
      handleFiles(files)
    }
  }

  document.addEventListener('paste', handlePaste)
  return () => document.removeEventListener('paste', handlePaste)
}, [paste])
```

---

### 2.6 大文件分片上传

**问题**：大文件上传容易被中断，需要分片上传支持。

```typescript
interface UploadProps {
  /** 是否启用分片上传 */
  chunked?: boolean;
  /** 分片大小（字节），默认 2MB */
  chunkSize?: number;
  /** 分片并行数，默认 3 */
  chunkConcurrent?: number;
}
```

**实现思路**：

```
┌─────────────────────────────────────────────────────┐
│                    分片上传流程                        │
├─────────────────────────────────────────────────────┤
│  1. 读取文件                                         │
│  2. 按 chunkSize 分割成多个 blob                     │
│  3. 并行上传多个分片 (控制并发数)                      │
│  4. 服务端合并分片                                    │
│  5. 返回最终 URL                                     │
└─────────────────────────────────────────────────────┘
```

---

## 三、技术优化

### 3.1 使用 fetch 替代 XMLHttpRequest

**当前**：使用 `XMLHttpRequest`

**问题**：
- API 较老
- 不支持 Promise
- 进度监听方式不够现代化

**建议**：改用 Fetch API + ReadableStream

```typescript
const uploadFile = async (options: FileRequestOptions) => {
  const { action, file, method, signal, onProgress } = options

  // 使用 fetch API
  const response = await fetch(action, {
    method,
    body: createFormData(file),
    signal,
  })

  // 对于进度支持，需要使用 XMLHttpRequest 或第三方库
  // 推荐：axios 或 native-fetch-blob
}
```

**备选方案**：保留 XHR 用于进度监听，封装为 Promise

---

### 3.2 状态管理优化

**当前**：所有状态都在父组件

**问题**：
- 状态过于集中
- 子组件无法独立处理逻辑

**建议**：考虑使用 reducer 或将部分逻辑下放

```typescript
// 使用 useReducer
type UploadAction =
  | { type: 'SET_FILES'; payload: File[] }
  | { type: 'SET_STATUS'; payload: UploadStatus }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'CANCEL' }
  | { type: 'RESET' }

const [state, dispatch] = useReducer(uploadReducer, initialState)
```

---

### 3.3 虚拟化文件列表

**问题**：选择大量文件时 DOM 性能差

**建议**：使用 react-window 渲染文件列表

```typescript
import { FixedSizeList as List } from 'react-window'

// 只渲染可见区域的文件
<List
  height={200}
  itemCount={files.length}
  itemSize={50}
  width="100%"
>
  {({ index, style }) => (
    <FileItem style={style} file={files[index]} />
  )}
</List>
```

---

### 3.4 错误处理增强

**当前**：错误处理较为简单

**建议**：添加更详细的错误类型

```typescript
/** 上传错误类型 */
type UploadErrorType =
  | 'FILE_TYPE_MISMATCH'    // 文件类型不匹配
  | 'FILE_SIZE_EXCEEDED'    // 文件大小超限
  | 'FILE_COUNT_EXCEEDED'   // 文件数量超限
  | 'NETWORK_ERROR'         // 网络错误
  | 'SERVER_ERROR'          // 服务器错误
  | 'ABORT_ERROR'           // 取消上传
  | 'UNKNOWN_ERROR'         // 未知错误

interface UploadError {
  type: UploadErrorType
  message: string
  file?: File
  originalError?: Error
}
```

---

### 3.5 国际化 (i18n)

**当前**：文本硬编码

```tsx
// 当前
"上传中"
"上传完成"
"上传失败"
```

**建议**：提取为配置项

```typescript
interface UploadProps {
  /** 自定义文案 */
  locale?: {
    uploading?: string
    success?: string
    error?: string
    dragHint?: string
    clickHint?: string
  }
}
```

---

## 四、API 设计优化

### 4.1 统一 Props 结构 ✅ 已实现

**状态**：✅ 已完成

**实现文件**：
- `types.ts` - 新增 `UploadConfig`, `UploadFile`, `UploadError` 等接口
- `index-v2.tsx` - 使用统一 API 的新组件

**新 API 示例**：

```tsx
// 基础用法
<Upload action="/api/upload" />

// 完整配置
<Upload
  mode="image"
  action="/api/upload"
  accept="image/*"
  maxSize={5 * 1024 * 1024}
  maxCount={3}
  autoUpload={false}
  onChange={(files) => console.log(files)}
  onProgress={(progress) => console.log(progress)}
  onSuccess={(response) => console.log(response)}
  onError={(error) => console.log(error)}
/>
```

**新增功能**：

| 功能 | 说明 |
|------|------|
| `mode` | 统一的上传模式 (button/image/dragger) |
| `autoUpload` | 自动/手动上传模式 |
| `accept` | 文件类型验证 |
| `maxSize` | 文件大小限制 |
| `minSize` | 最小文件大小 |
| `maxCount` | 最大文件数 |
| `data` | 自定义请求体数据 |
| `name` | 上传字段名 |
| `onChange` | 文件变化回调 |
| `onComplete` | 全部完成回调 |

**向后兼容**：旧版 `index.tsx` 保持不变，新老 API 可以共存。

---

### 4.3 强类型 accept 属性 ✅ 已实现

**状态**：✅ 已完成

**实现文件**：
- `types.ts` - 新增 `UploadAcceptType`, `UploadAccept` 类型

**类型定义**：

```typescript
/** 文件接受类型 - 预定义类型或自定义 MIME 类型/扩展名 */
export type UploadAcceptType =
    | 'image/*'           // 所有图片
    | 'video/*'          // 所有视频
    | 'audio/*'          // 所有音频
    | 'image/jpeg'       // JPEG 图片
    | 'image/png'        // PNG 图片
    | 'image/gif'        // GIF 图片
    | 'image/webp'       // WebP 图片
    | 'application/pdf'   // PDF 文档
    | 'application/msword'
    | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    | 'application/vnd.ms-excel'
    | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    | 'application/zip'
    | 'application/x-rar-compressed'
    | 'text/*'
    | `.${string}`;      // 自定义文件扩展名

/** 文件接受类型 - 支持多个类型组合 */
export type UploadAccept = UploadAcceptType | `${UploadAcceptType},${string}` | string;
```

**好处**：
- IDE 自动补全支持
- 类型安全保证
- 保留 string 兼容性

---

### 4.4 Bug 修复记录

| 问题 | 状态 | 修复说明 |
|------|------|----------|
| 文件状态上传后未更新 | ✅ | 在 `uploadSingleFile` 后添加 `setFiles` 更新状态 |
| FormData 未传递给 uploadFile | ✅ | 修复 `index.tsx` 传递 formData，修改 `utils.ts` 接收参数 |
| 重复的 progress 更新 | ✅ | 移除第二次 setFiles 中的 progress 更新 |
| 进度显示累计而非每文件 | ✅ | 修改为 `event.loaded / file.size` 计算每文件进度 |
| Emoji 图标不一致 | ✅ | 统一使用 @iconify/react Lucide 图标 |

---

### 4.5 复合组件 API

**考虑**：提供更声明式的 API

```tsx
// 可能的未来 API
<Upload>
  <Upload.Button>选择文件</Upload.Button>
  <Upload.Dragger>
    <Upload.List>
      <Upload.Item />
    </Upload.List>
  </Upload.Dragger>
</Upload>
```

---

## 五、性能优化

### 5.1 图片预览优化

**当前**：使用 `URL.createObjectURL`

**问题**：
- 需要手动管理内存
- 大图片预览可能卡顿

**建议**：

```typescript
// 1. 添加图片压缩
const compressImage = async (file: File, maxWidth = 800): Promise<File> => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const img = await loadImage(file)

  const scale = maxWidth / img.width
  canvas.width = maxWidth
  canvas.height = img.height * scale

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas.toBlob('image/jpeg', 0.8) as Promise<File>
}

// 2. 使用缩略图
const useThumbnail = (file: File) => {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => {
      // 创建缩略图
      const canvas = document.createElement('canvas')
      // ... 缩放处理
      setUrl(canvas.toDataURL())
    }
  }, [file])

  return url
}
```

---

### 5.2 懒加载

**建议**：按需加载子组件

```typescript
// 使用 React.lazy
const ButtonUpload = React.lazy(() => import('./components/ButtonUpload'))
const DraggerUpload = React.lazy(() => import('./components/DraggerUpload'))
const ImageUpload = React.lazy(() => import('./components/ImageUpload'))
```

---

## 六、无障碍性 (Accessibility)

### 6.1 增强键盘支持

**当前**：主要依赖鼠标操作

**建议**：添加完整键盘导航

```typescript
// 添加键盘处理
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    inputRef.current?.click()
  }
}
```

---

### 6.2 屏幕阅读器支持

**建议**：添加 ARIA 实时区域

```tsx
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  {status === 'uploading' && `上传中 ${progress}%`}
  {status === 'success' && '上传完成'}
  {status === 'error' && '上传失败'}
</div>
```

---

## 七、测试建议

### 7.1 需要覆盖的场景

| 测试类型 | 测试场景 |
|---------|---------|
| 单元测试 | props 验证、状态转换、函数逻辑 |
| 集成测试 | 文件选择流程、拖拽流程、上传流程 |
| 错误测试 | 网络错误、文件验证失败、取消上传 |
| 边界测试 | 空文件、超大文件、特殊字符文件名 |

### 7.2 建议的测试库

```bash
# 已有
vitest
@testing-library/react

# 建议添加
# - 模拟 XHR/Fetch: msw (Mock Service Worker)
# - 模拟文件: createFileMock
```

---

## 八、版本规划

### Phase 1: 统一 API (v1.x) ✅ 已完成

- [x] 统一 Props 结构 (UploadConfig)
- [x] 文件验证 (accept, maxSize, minSize, maxCount)
- [x] 手动上传模式 (autoUpload)
- [x] 增强错误处理 (UploadError, UploadErrorType)
- [x] 文件列表和进度条 (FileList 组件)
- [x] 强类型 accept 属性 (UploadAcceptType)
- [x] Bug 修复：状态更新、FormData 传递、进度计算、图标统一

### Phase 2: 增强体验 (v2.x)

- [x] 目录上传
- [ ] 粘贴上传
- [ ] 国际化 (locale 配置)
- [ ] 图片压缩预览

### Phase 3: 高级功能 (v3.x)

- [ ] 分片上传
- [ ] 断点续传
- [ ] 大文件处理

---

## 九、总结

Upload 组件 v1.x 已完成全部核心功能，主要包括：

1. **统一 API**：基于 UploadConfig 的声明式配置
2. **文件验证**：accept、maxSize、minSize、maxCount 完整支持
3. **手动上传**：autoUpload=false 支持手动触发
4. **进度显示**：每文件独立进度条，实时更新
5. **错误处理**：详细的错误类型和回调
6. **强类型**：完整的 TypeScript 类型支持

**v1.x 已完成** → 建议进入 Phase 2 增强体验：
- 目录上传、粘贴上传、国际化、图片压缩预览

建议按 Phase 逐步迭代，避免一次性改动过大。
