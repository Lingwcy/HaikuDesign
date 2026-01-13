import { FileRequestOptions } from "./types";

const uploadFile = ({
    action,
    file,
    method = "post",
    header,
    onProgress,
    signal,
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

        const formData = new FormData();
        formData.append("file", file);
        xhr.send(formData);
    });


export {
    uploadFile
}
