# 断点续传

**状态**：✅ 已完成

**实现位置**：
- `types.ts` - `ChunkedUploadConfig.resumable`, `chunkedUrl` 属性
- `utils.ts` - `checkUploadedChunks` 函数
- `index.tsx` - `uploadWithChunkedMode` 中的断点续传逻辑

---

## 一、断点续传原理

断点续传是分片上传的增强功能，允许在上传中断后从上次停止的位置继续上传，而不是从头开始。这对于大文件上传和网络不稳定的环境尤为重要。

```
┌─────────────────────────────────────────────────────────────────┐
│  普通分片上传 vs 断点续传                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  普通分片:     [██████] [██████] [██████] [██████] [██████]   │
│                 0%      20%     40%     60%     80%    100%   │
│                           ✕ 中断!                               │
│  重试:         [██████] [██████] [██████] [██████] [██████]   │
│                 0%      20%     40%     60%     80%    100%   │
│                                                                 │
│  断点续传:     [██████] [██████] [████]                         │
│                 0%      20%     40%                               │
│                           ✕ 中断!                               │
│  继续:         [██████] [██████] [████] [██] [██████] [████]  │
│                 0%      20%     40%     60%     80%    100%   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 二、使用方式

### 2.1 启用断点续传

```tsx
<Upload
  action="/api/upload"
  chunkedConfig={{
    chunked: true,
    resumable: true,                    // 启用断点续传
    chunkedUrl: '/api/upload/chunks',   // 查询已上传分片的接口
  }}
/>
```

### 2.2 配置参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `resumable` | `boolean` | `false` | 是否启用断点续传 |
| `chunkedUrl` | `string` | `""` | 查询已上传分片列表的 API |

---

## 三、工作流程

```
┌─────────────────────────────────────────────────────────────────┐
│                      断点续传流程                                  │
├─────────────────────────────────────────────────────────────────┤
│  1. 初始化上传，文件超过 chunkThreshold                          │
│  2. 调用 chunkedUrl 查询已上传的分片                            │
│  3. 服务端返回已上传的分片索引列表 [0, 1, 2, 5]                 │
│  4. 客户端过滤出未上传的分片 [3, 4, 6, 7, 8, 9]                │
│  5. 只上传未完成的分片                                          │
│  6. 合并分片，完成上传                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 四、状态持久化方案

### 4.1 客户端存储

当页面刷新后需要继续上传时，需要将上传状态存储到 `localStorage`：

```typescript
// 存储上传状态
const saveUploadState = (file: File, uploadedChunks: number[]) => {
  const key = `upload_${file.name}_${file.size}`;
  localStorage.setItem(key, JSON.stringify({
    uploadedChunks,
    timestamp: Date.now(),
  }));
};

// 读取上传状态
const getUploadState = (file: File): number[] | null => {
  const key = `upload_${file.name}_${file.size}`;
  const data = localStorage.getItem(key);
  if (!data) return null;

  const { uploadedChunks, timestamp } = JSON.parse(data);
  // 检查是否过期 (24小时)
  if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
    localStorage.removeItem(key);
    return null;
  }

  return uploadedChunks;
};
```

### 4.2 服务端存储

服务端需要持久化已上传的分片信息：

```python
# 服务端存储方案
class ChunkUploadManager:
    def __init__(self):
        # 使用数据库或 Redis 存储
        self.chunk_store = {}  # {file_key: [uploaded_indices]}

    def get_uploaded_chunks(self, file_key):
        """获取已上传的分片索引"""
        return self.chunk_store.get(file_key, [])

    def mark_chunk_uploaded(self, file_key, chunk_index):
        """标记分片已上传"""
        if file_key not in self.chunk_store:
            self.chunk_store[file_key] = []
        if chunk_index not in self.chunk_store[file_key]:
            self.chunk_store[file_key].append(chunk_index)

    def clear_chunks(self, file_key):
        """清理分片记录（合并完成后）"""
        # 删除临时分片文件
        # 删除存储记录
        pass
```

---

## 五、服务端接口要求

### 5.1 查询已上传分片

**请求**：
```
GET /api/upload/chunks?fileName=video.mp4&fileSize=52428800&chunkSize=2097152
```

**响应**：
```json
{
  "success": true,
  "uploadedChunks": [0, 1, 2, 3, 5]
}
```

**说明**：
- `fileName`: 文件名（用于识别文件）
- `fileSize`: 文件大小（辅助识别）
- `chunkSize`: 分片大小（可选，用于验证）

### 5.2 服务端实现示例 (Python/Flask)

```python
from flask import Blueprint, request, jsonify

upload_bp = Blueprint('upload', __name__)

# 假设使用内存存储（生产环境应使用数据库或 Redis）
chunk_store = {}

@upload_bp.route('/chunks', methods=['GET'])
def get_uploaded_chunks():
    file_name = request.args.get('fileName')
    file_size = request.args.get('fileSize')

    file_key = f"{file_name}_{file_size}"
    uploaded = chunk_store.get(file_key, [])

    return jsonify({
        "success": True,
        "uploadedChunks": uploaded
    })

@upload_bp.route('/chunk', methods=['POST'])
def upload_chunk():
    chunk = request.files['chunk']
    chunk_index = int(request.form['chunkIndex'])
    file_name = request.form['fileName']
    file_size = request.form['fileSize']

    file_key = f"{file_name}_{file_size}"

    # 保存分片
    temp_path = f"./temp/{file_key}.part{chunk_index}"
    chunk.save(temp_path)

    # 标记已上传
    if file_key not in chunk_store:
        chunk_store[file_key] = []
    if chunk_index not in chunk_store[file_key]:
        chunk_store[file_key].append(chunk_index)

    return jsonify({
        "success": True,
        "chunkIndex": chunk_index
    })

@upload_bp.route('/merge', methods=['POST'])
def merge_chunks():
    data = request.json
    file_name = data['fileName']
    file_size = data['fileSize']
    total_chunks = data['totalChunks']

    file_key = f"{file_name}_{file_size}"

    # 合并文件
    output_path = f"./uploads/{file_name}"
    with open(output_path, 'wb') as output:
        for i in range(total_chunks):
            part_path = f"./temp/{file_key}.part{i}"
            with open(part_path, 'rb') as part:
                output.write(part.read())
            os.remove(part_path)

    # 清理分片记录
    del chunk_store[file_key]

    return jsonify({
        "success": True,
        "url": f"/uploads/{file_name}"
    })
```

---

## 六、完整使用示例

### 6.1 基础断点续传

```tsx
import { Upload } from '@haiku/ui';

function App() {
  return (
    <Upload
      action="/api/upload/chunk"
      chunkedConfig={{
        chunked: true,
        chunkSize: 2 * 1024 * 1024,      // 2MB 分片
        chunkConcurrency: 3,            // 3 个并发
        chunkThreshold: 5 * 1024 * 1024, // 5MB 以上启用
        resumable: true,                 // 启用断点续传
        chunkedUrl: '/api/upload/chunks', // 查询接口
        mergeUrl: '/api/upload/merge',    // 合并接口
      }}
      onProgress={(progress, file) => {
        console.log(`${file.name}: ${progress}%`);
      }}
      onSuccess={(response, file) => {
        console.log(`${file.name} 上传成功: ${response}`);
      }}
      onError={(error, file) => {
        console.error(`${file.name} 上传失败: ${error.message}`);
      }}
    />
  );
}
```

### 6.2 带状态的断点续传

```tsx
import { Upload } from '@haiku/ui';
import { useState } from 'react';

function UploadWithState() {
  const [uploadId, setUploadId] = useState<string | null>(null);

  const handleChange = (files) => {
    if (files.length > 0 && !uploadId) {
      // 生成唯一上传 ID
      const id = `${files[0].file.name}_${files[0].file.size}_${Date.now()}`;
      setUploadId(id);
    }
  };

  return (
    <Upload
      action="/api/upload/chunk"
      chunkedConfig={{
        chunked: true,
        resumable: true,
        chunkedUrl: `/api/upload/chunks?uploadId=${uploadId}`,
        mergeUrl: `/api/upload/merge?uploadId=${uploadId}`,
      }}
      onChange={handleChange}
    />
  );
}
```

---

## 七、注意事项

1. **文件标识**：
   - 使用文件名 + 文件大小作为唯一标识
   - 避免同名文件冲突

2. **状态清理**：
   - 合并完成后清理服务端临时文件
   - 清理 localStorage 中的过期状态
   - 定期清理未完成的旧上传

3. **安全性**：
   - 验证分片完整性（如 MD5 校验）
   - 防止恶意用户查询他人文件状态

4. **用户体验**：
   - 显示"检测到之前的上传，是否继续？"提示
   - 提供"重新上传"按钮清空之前状态
