import { FileRequestOptions } from "./types";

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


export {
    uploadFile
}
