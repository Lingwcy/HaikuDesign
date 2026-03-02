# 大文件分片上传

## 一、分片上传原理

分片上传将大文件分割成多个小块（chunks），并行上传这些小块，最后在服务端合并。这种方式有以下优势：

1. **支持大文件**：突破浏览器单次上传的文件大小限制
2. **并行上传**：多个分片同时上传，提高上传速度
3. **减少内存占用**：不需要将整个文件加载到内存
4. **便于错误恢复**：单个分片失败只需重试该分片


- `File.slice()` 不会真正复制数据，只是创建 Blob 视图，内存占用极低
- 这是浏览器提供的原生 API，非常高效


---

## 二、使用方式

### 2.1 基础配置

```tsx
<Upload
  action="/api/upload"
  chunkedConfig={{
    chunked: true,                    // 启用分片上传
    chunkSize: 2 * 1024 * 1024,        // 分片大小 2MB
    chunkConcurrency: 3,              // 并行上传数，0=自动
    chunkThreshold: 5 * 1024 * 1024,   // 超过 5MB 启用分片
    mergeUrl: '/api/upload/merge',    // 合并分片的 API 地址
  }}
/>
```

### 2.2 配置参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `chunked` | `boolean` | `false` | 是否启用分片上传 |
| `chunkSize` | `number` | `2MB` | 每个分片的大小（字节） |
| `chunkConcurrency` | `number` | `0` (自动) | 同时上传的分片数量，0 表示根据文件大小自动计算 |
| `chunkThreshold` | `number` | `5MB` | 超过此大小才启用分片上传 |
| `mergeUrl` | `string` | `""` | 合并分片的 API 地址 |
| `resumable` | `boolean` | `false` | 是否启用断点续传 |
| `chunkedUrl` | `string` | `""` | 查询已上传分片的 API 地址 |

### 2.3 自动并发计算

当 `chunkConcurrency` 设置为 `0` 时，会根据文件大小自动计算并发数：

```typescript
const calculateConcurrency = (fileSize: number): number => {
    const mb = fileSize / 1024 / 1024;
    if (mb < 10) return 2;      // < 10MB: 2 并发
    if (mb < 50) return 3;      // 10-50MB: 3 并发
    if (mb < 100) return 4;     // 50-100MB: 4 并发
    if (mb < 500) return 5;    // 100-500MB: 5 并发
    return 6;                   // > 500MB: 6 并发
};
```

---

## 三、上传流程

```
┌─────────────────────────────────────────────────────────────────┐
│                      分片上传流程                                  │
├─────────────────────────────────────────────────────────────────┤
│  1. 检查文件大小 > chunkThreshold (默认 5MB)                     │
│  2. (可选) 查询已上传分片，支持断点续传                          │
│  3. 使用 File.slice() 分割文件为多个 Blob                        │
│  4. 过滤出需要上传的分片（已上传的跳过）                         │
│  5. 并行上传 N 个分片 (通过并发控制)                            │
│  6. 调用 mergeUrl 合并所有分片                                   │
│  7. 返回最终文件的 URL                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 四、并发控制策略

分片上传使用并发控制来限制同时上传的分片数量：

```typescript
const executeWithConcurrency = async (tasks, limit) => {
    const results = [];
    const executing = [];
    let taskIndex = 0;

    while (taskIndex < tasks.length || executing.length > 0) {
        // 启动新任务直到达到限制
        while (taskIndex < tasks.length && executing.length < limit) {
            const task = tasks[taskIndex++];
            const promise = task().then(result => {
                results.push(result);
                return result;
            });
            executing.push(promise);
        }

        // 等待至少一个任务完成
        if (executing.length > 0) {
            await Promise.race(executing);
            // 移除已完成的 promise
            const completedIndex = executing.findIndex(p => ...);
            if (completedIndex !== -1) {
                executing.splice(completedIndex, 1);
            }
        }
    }
    return results;
};
```

**为什么需要控制并发**：
- 避免同时发起过多请求导致浏览器性能问题
- 防止服务端过载
- 保持良好的用户体验
- 移动端建议降低并发数（2-3）

### 4.1 并发控制代码详解

这段代码实现了一个经典的"滑动窗口"并发模式，下面逐步解析其工作原理：

**核心变量**：
- `tasks`：所有需要执行的任务数组（如上传 10 个分片）
- `limit`：并发上限（如 3 个同时上传）
- `taskIndex`：下一个待执行任务的索引
- `executing`：正在执行的任务 Promise 数组

**执行流程**（以 10 个分片、并发数 3 为例）：

```
第 1 轮：
  - 启动任务 0, 1, 2（taskIndex: 0→3）
  - executing = [p0, p1, p2]，长度 = limit
  - await Promise.race(executing) 等待任意一个完成
  - 假设 p0 完成，executing = [p1, p2]

第 2 轮：
  - 启动任务 3（因为 executing.length < limit）
  - executing = [p1, p2, p3]
  - await Promise.race 等待任意完成
  - ...

直到所有任务完成
```

**关键点解析**：

1. **双层 while 循环**
   - 外层 `while (taskIndex < tasks.length || executing.length > 0)`：控制整体流程
   - 内层 `while (taskIndex < tasks.length && executing.length < limit)`：填充并发槽位

2. **Promise.race 的作用**
   ```typescript
   await Promise.race(executing);
   ```
   这行代码会等待 `executing` 数组中**任意一个** Promise 完成就继续，而不是等全部完成。这是实现"完成一个立即补充一个"的关键。

3. **动态补充任务**
   当一个任务完成后，`executing` 长度变为 `limit - 1`，内层循环会立即启动一个新任务，保持并发数始终满载。

4. **结果收集**
   ```typescript
   const promise = task().then(result => {
       results.push(result);
       return result;
   });
   ```
   每个任务完成后将结果存入 `results`，最终返回完整的结果数组。

**简化理解**：

```
想象有 3 个传送带槽位：
┌───┐ ┌───┐ ┌───┐
│任务0│ │任务1│ │任务2│  ← 3 个任务同时运行
└───┘ └───┘ └───┘
    ↓     ↓     ↓
  完成   运行中 运行中
┌───┐ ┌───┐ ┌───┐
│任务3│ │任务1│ │任务2│  ← 任务0完成后，立即补充任务3
└───┘ └───┘ └───┘
```

---

## 五、服务端接口要求

### 5.1 分片上传接口

**重要**：将分片信息放入 FormData，不要使用自定义请求头（避免 CORS 问题）。

**请求**：
```
POST /api/upload/chunk
Content-Type: multipart/form-data

file: <Blob>              # 注意：字段名是 file，不是 chunk
chunkIndex: 0
totalChunks: 10
fileName: video.mp4
fileSize: 52428800
```

**响应**：
```json
{
  "success": true,
  "chunkIndex": 0
}
```

### 5.2 合并分片接口

**请求**：
```
POST /api/upload/merge
Content-Type: application/json

{
  "fileName": "video.mp4",
  "totalChunks": 10
}
```

**响应**：
```json
{
  "success": true,
  "url": "/uploads/video.mp4"
}
```

### 5.3 查询已上传分片（断点续传）

**请求**：
```
GET /api/upload/chunks?fileName=video.mp4&fileSize=52428800
```

**响应**：
```json
{
  "uploadedChunks": [0, 1, 2, 5]
}
```
