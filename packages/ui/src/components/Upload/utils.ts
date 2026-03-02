import { FileRequestOptions, ChunkUploadOptions } from "./types";

/**
 * 上传文件到服务器
 * 使用 XMLHttpRequest 实现，支持进度回调和取消功能
 * @param options - 文件请求选项
 * @returns Promise<string> - 服务器响应文本
 */
const uploadFile = ({
    action,
    file,
    method = "post",
    header,
    onProgress,
    signal,
    formData: providedFormData,
}: FileRequestOptions) =>
    new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method.toUpperCase(), action, true);

        const handleAbort = () => {
            xhr.abort();
        };

        if (header) {
            Object.entries(header).forEach(([key, value]) => {
                xhr.setRequestHeader(key, value);
            });
        }

        xhr.upload.onprogress = (event) => {
            onProgress?.(event);
        };

        xhr.onload = () => {
            signal?.removeEventListener("abort", handleAbort);
            resolve(xhr.responseText);
        };

        xhr.onerror = (event) => {
            signal?.removeEventListener("abort", handleAbort);
            reject(event);
        };

        xhr.onabort = () => {
            signal?.removeEventListener("abort", handleAbort);
            reject(new DOMException("Upload aborted", "AbortError"));
        };

        if (signal?.aborted) {
            reject(new DOMException("Upload aborted", "AbortError"));
            return;
        }
        signal?.addEventListener("abort", handleAbort);

        // 使用传入的 formData，或创建一个新的
        const formData = providedFormData || new FormData();
        if (!providedFormData && file) {
            formData.append("file", file);
        }
        xhr.send(formData);
    });

/**
 * 将文件分割成多个 Blob
 * @param file - 要分割的文件
 * @param chunkSize - 分片大小（字节）
 * @returns 分片数组
 */
const splitFileIntoChunks = (
    file: File,
    chunkSize: number
): { blob: Blob; index: number; start: number; end: number }[] => {
    const chunks: { blob: Blob; index: number; start: number; end: number }[] = [];
    let start = 0;
    let index = 0;

    while (start < file.size) {
        const end = Math.min(start + chunkSize, file.size);
        const blob = file.slice(start, end);
        chunks.push({
            blob,
            index,
            start,
            end,
        });
        start = end;
        index++;
    }

    return chunks;
};

/**
 * 上传单个分片
 * @param options - 分片上传选项
 * @returns Promise<string> - 服务器响应文本
 */
const uploadChunk = ({
    action,
    chunk,
    chunkIndex,
    totalChunks,
    fileName,
    fileSize,
    method = "post",
    headers,
    onProgress,
    signal,
}: ChunkUploadOptions): Promise<string> =>
    new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method.toUpperCase(), action, true);

        const handleAbort = () => {
            xhr.abort();
        };

        if (headers) {
            Object.entries(headers).forEach(([key, value]) => {
                xhr.setRequestHeader(key, value);
            });
        }

        // 注意：分片信息已通过 FormData 传递，避免自定义请求头触发 CORS 预检
        // chunkIndex, totalChunks, fileName, fileSize 都在 formData 中

        xhr.upload.onprogress = (event) => {
            onProgress?.(event);
        };

        xhr.onload = () => {
            signal?.removeEventListener("abort", handleAbort);
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.responseText);
            } else {
                reject(new Error(`Chunk upload failed: ${xhr.statusText}`));
            }
        };

        xhr.onerror = (event) => {
            signal?.removeEventListener("abort", handleAbort);
            reject(event);
        };

        xhr.onabort = () => {
            signal?.removeEventListener("abort", handleAbort);
            reject(new DOMException("Chunk upload aborted", "AbortError"));
        };

        if (signal?.aborted) {
            reject(new DOMException("Chunk upload aborted", "AbortError"));
            return;
        }
        signal?.addEventListener("abort", handleAbort);

        const formData = new FormData();

        formData.append("file", chunk);
        formData.append("chunkIndex", String(chunkIndex));
        formData.append("totalChunks", String(totalChunks));
        formData.append("fileName", fileName);
        formData.append("fileSize", String(fileSize));

        xhr.send(formData);
    });

/**
 * 检查已上传的分片（断点续传）
 * @param action - 查询接口地址
 * @param file - 文件对象
 * @param chunkSize - 分片大小
 * @param headers - 请求头
 * @returns Promise<number[]> - 已上传的分片索引数组
 */
const checkUploadedChunks = (
    action: string,
    file: File,
    chunkSize: number,
    headers?: Record<string, string>
): Promise<number[]> =>
    new Promise<string>((resolve, _reject) => {
        const xhr = new XMLHttpRequest();

        // 构建查询参数
        const params = new URLSearchParams({
            fileName: file.name,
            fileSize: String(file.size),
            chunkSize: String(chunkSize),
        });

        xhr.open("GET", `${action}?${params}`, true);

        if (headers) {
            Object.entries(headers).forEach(([key, value]) => {
                xhr.setRequestHeader(key, value);
            });
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.responseText);
            } else {
                // 如果查询失败，返回空数组（从头开始上传）
                resolve("[]");
            }
        };

        xhr.onerror = () => {
            // 如果查询失败，返回空数组（从头开始上传）
            resolve("[]");
        };

        xhr.ontimeout = () => {
            resolve("[]");
        };

        xhr.send();
    }).then((responseText) => {
        try {
            const data = JSON.parse(responseText);
            return data.uploadedChunks || [];
        } catch {
            return [];
        }
    });

/**
 * 合并分片
 * @param action - 合并接口地址
 * @param fileName - 文件名
 * @param totalChunks - 总分片数
 * @param method - 请求方法
 * @param headers - 请求头
 * @returns Promise<string> - 服务器响应
 */
const mergeChunks = (
    action: string,
    fileName: string,
    totalChunks: number,
    method: "post" | "put" = "post",
    headers?: Record<string, string>
): Promise<string> =>
    new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method.toUpperCase(), action, true);

        if (headers) {
            Object.entries(headers).forEach(([key, value]) => {
                xhr.setRequestHeader(key, value);
            });
        }

        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.responseText);
            } else {
                reject(new Error(`Merge chunks failed: ${xhr.statusText}`));
            }
        };

        xhr.onerror = (event) => {
            reject(event);
        };

        const body = JSON.stringify({
            fileName,
            totalChunks,
        });

        xhr.send(body);
    });

/**
 * 并行控制函数 - 控制同时运行的任务数量
 */
const parallelLimit = async <T>(
    tasks: (() => Promise<T>)[],
    limit: number
): Promise<T[]> => {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    for (const task of tasks) {
        const promise = task().then((result) => {
            results.push(result);
        });

        executing.push(promise);

        if (executing.length >= limit) {
            await Promise.race(executing);
            // 移除已完成的 promise
            const completedIndex = executing.findIndex(
                (p) => (p as unknown as { status: string }).status === "fulfilled"
            );
            if (completedIndex !== -1) {
                executing.splice(completedIndex, 1);
            }
        }
    }

    // 等待所有任务完成
    await Promise.all(executing);
    return results;
};

export {
    uploadFile,
    splitFileIntoChunks,
    uploadChunk,
    checkUploadedChunks,
    mergeChunks,
    parallelLimit,
};
