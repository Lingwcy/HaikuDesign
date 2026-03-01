# 大文件分片上传

**状态**：✅ 已完成

**实现位置**：
- `types.ts` - `ChunkedUploadConfig`, `ChunkUploadOptions`, `ChunkProgress` 类型
- `utils.ts` - `splitFileIntoChunks`, `uploadChunk`, `mergeChunks`, `parallelLimit` 函数
- `index.tsx` - `uploadWithChunkedMode` 函数

---

## 一、分片上传原理

分片上传将大文件分割成多个小块（chunks），并行上传这些小块，最后在服务端合并。这种方式有以下优势：

1. **支持大文件**：突破浏览器单次上传的文件大小限制
2. **并行上传**：多个分片同时上传，提高上传速度
3. **减少内存占用**：不需要将整个文件加载到内存
4. **便于错误恢复**：单个分片失败只需重试该分片

---

## 二、使用方式

### 2.1 基础配置

```tsx
<Upload
  action="/api/upload"
  chunkedConfig={{
    chunked: true,                    // 启用分片上传
    chunkSize: 2 * 1024 * 1024,        // 分片大小 2MB
    chunkConcurrency: 3,              // 并行上传数
    chunkThreshold: 5 * 1024 * 1024,   // 超过 5MB 启用分片
  }}
/>
```

### 2.2 配置参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `chunked` | `boolean` | `false` | 是否启用分片上传 |
| `chunkSize` | `number` | `2MB` | 每个分片的大小（字节） |
| `chunkConcurrency` | `number` | `3` | 同时上传的分片数量 |
| `chunkThreshold` | `number` | `5MB` | 超过此大小才启用分片上传 |
| `mergeUrl` | `string` | `""` | 合并分片的 API 地址 |

---

## 三、上传流程

```
┌─────────────────────────────────────────────────────────────────┐
│                      分片上传流程                                  │
├─────────────────────────────────────────────────────────────────┤
│  1. 检查文件大小 > chunkThreshold (默认 5MB)                     │
│  2. 使用 File.slice() 分割文件为多个 Blob                        │
│  3. 并行上传 N 个分片 (通过 chunkConcurrency 控制)               │
│  4. 每个分片携带: chunkIndex, totalChunks, fileName, fileSize   │
│  5. 调用 mergeUrl 合并所有分片                                   │
│  6. 返回最终文件的 URL                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 四、并发控制策略

分片上传使用并发控制来限制同时上传的分片数量：

```typescript
// 简化版并发控制实现
const executeWithConcurrency = async (tasks, limit) => {
  const executing = [];

  for (const task of tasks) {
    const promise = task();
    executing.push(promise);

    // 达到并发限制，等待任一任务完成
    if (executing.length >= limit) {
      await Promise.race(executing);
      // 移除已完成的 promise
      const completedIndex = executing.findIndex(p => isPromiseFulfilled(p));
      if (completedIndex !== -1) {
        executing.splice(completedIndex, 1);
      }
    }
  }

  await Promise.all(executing);
};
```

**为什么需要控制并发**：
- 避免同时发起过多请求导致浏览器性能问题
- 防止服务端过载
- 保持良好的用户体验

---

## 五、服务端接口要求

### 5.1 分片上传接口

**请求**：
```
POST /api/upload/chunk
Content-Type: multipart/form-data

chunk: <Blob>
chunkIndex: 0
totalChunks: 10
fileName: video.mp4
fileSize: 52428800
```

**请求头**：
```
X-Chunk-Index: 0
X-Total-Chunks: 10
X-File-Name: video.mp4
X-File-Size: 52428800
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

### 5.3 服务端实现示例 (Python/Flask)

```python
from flask import Blueprint, request, jsonify
import os
import uuid

upload_bp = Blueprint('upload', __name__)

# 临时存储分片
TEMP_DIR = './temp_chunks'

@upload_bp.route('/chunk', methods=['POST'])
def upload_chunk():
    chunk = request.files['chunk']
    chunk_index = int(request.form['chunkIndex'])
    total_chunks = int(request.form['totalChunks'])
    file_name = request.form['fileName']

    # 保存分片到临时目录
    temp_path = os.path.join(TEMP_DIR, f"{file_name}.part{chunk_index}")
    chunk.save(temp_path)

    return jsonify({
        "success": True,
        "chunkIndex": chunk_index
    })

@upload_bp.route('/merge', methods=['POST'])
def merge_chunks():
    data = request.json
    file_name = data['fileName']
    total_chunks = data['totalChunks']

    # 合并分片
    output_path = os.path.join('./uploads', file_name)
    with open(output_path, 'wb') as output:
        for i in range(total_chunks):
            part_path = os.path.join(TEMP_DIR, f"{file_name}.part{i}")
            with open(part_path, 'rb') as part:
                output.write(part.read())
            os.remove(part_path)

    return jsonify({
        "success": True,
        "url": f"/uploads/{file_name}"
    })
```

---

## 六、进度追踪

分片上传会触发特殊的进度回调：

```typescript
// ChunkProgress 类型
interface ChunkProgress {
  chunkIndex: number;      // 当前上传的分片索引
  chunkProgress: number;   // 当前分片进度 0-100
  totalProgress: number;   // 整体进度 0-100
  uploadedChunks: number;  // 已上传分片数
  totalChunks: number;     // 总分片数
}
```

组件内部会通过 `onProgress` 回调返回文件级别的进度：

```tsx
<Upload
  action="/api/upload"
  chunkedConfig={{ chunked: true }}
  onProgress={(progress, file) => {
    console.log(`上传进度: ${progress}%`);
  }}
/>
```

---

## 七、注意事项

1. **分片大小选择**：
   - 建议 1MB-5MB 范围内
   - 太小会增加请求开销
   - 太大不利于断点续传

2. **文件名处理**：
   - 服务端需要根据文件名和分片索引来区分不同分片
   - 建议使用 UUID 或时间戳避免文件名冲突

3. **临时文件清理**：
   - 定期清理未完成的临时分片
   - 可以设置过期时间自动清理

4. **安全性**：
   - 验证文件类型和大小
   - 防止恶意用户上传超大文件消耗存储
