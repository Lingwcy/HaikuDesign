/**
 * 上传组件 - 
 *
 * 使用统一的 UploadConfig 接口，支持:
 * - 三种上传模式：button（按钮）、image（图片）、dragger（拖拽）
 * - 文件验证：accept、maxSize、maxCount
 * - 手动/自动上传模式
 * - 增强的错误处理
 *
 * @example
 * ```tsx
 * // 基础用法
 * <Upload action="/api/upload" />
 *
 * // 图片上传
 * <Upload mode="image" action="/api/upload" accept="image/*" maxSize={5 * 1024 * 1024} />
 *
 * // 拖拽上传
 * <Upload mode="dragger" action="/api/upload" maxCount={5} />
 *
 * // 手动上传模式
 * <Upload mode="button" action="/api/upload" autoUpload={false} onChange={handleChange} />
 *   <button onClick={triggerUpload}>上传</button>
 * </Upload>
 * ```
 */
import {
    useEffect,
    useId,
    useRef,
    useState,
    useCallback,
    type ChangeEvent,
    type DragEvent,
} from "react";
import {
    type UploadConfig,
    type UploadFile,
    type UploadStatus,
    type UploadError,
    type UploadMode,
    type UploadVariant,
    type UploadSize,
    type UploadShape,
    type UploadErrorType,
    type UploadAccept,
    type UploadAcceptType,
    UploadTriggerConfig,
} from "./types";
import { uploadFile } from "./utils";
import ButtonUpload from "./components/ButtonUpload";
import DraggerUpload from "./components/DraggerUpload";
import ImageUpload from "./components/ImageUpload";
import { FileList } from "./components/FileList";
import { cn } from "../../lib/utils";

// 默认配置
const DEFAULT_OPTIONS: Partial<UploadConfig> = {
    mode: "button",
    autoUpload: true,
    showFileList: true,
    variant: "default",
    size: "md",
    shape: "rounded",
    method: "post",
    name: "file",
};

/** 创建上传错误 */
const createUploadError = (
    type: UploadErrorType,
    message: string,
    file?: File,
    originalError?: Error
): UploadError => ({
    type,
    message,
    file,
    originalError,
});

/**
 * 生成唯一文件 ID
 */
const generateFileId = () => Math.random().toString(36).substring(2, 11);

/**
 * 上传组件
 */
function Upload(config: UploadConfig) {
    // 合并配置
    const options: Required<UploadConfig> = {
        ...DEFAULT_OPTIONS,
        ...config,
    } as Required<UploadConfig>;

    // 解构配置
    const {
        mode,
        autoUpload,
        showFileList,
        directory,
        accept,
        maxSize,
        minSize,
        maxCount,
        variant,
        size,
        shape,
        action,
        method,
        headers,
        data,
        name,
        onChange,
        onProgress,
        onSuccess,
        onError,
        onComplete,
    } = options;

    // 文件列表状态
    const [files, setFiles] = useState<UploadFile[]>([]);
    // 拖拽状态
    const [isDragging, setIsDragging] = useState(false);
    // 图片预览 URL
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    // 全局上传状态
    const [status, setStatus] = useState<UploadStatus>("idle");
    // 全局进度
    const [progress, setProgress] = useState(0);

    // Refs
    const inputId = useId();
    const abortRef = useRef<AbortController | null>(null);
    const cancelRef = useRef(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // 计算当前状态
    const isDisabled = status === "uploading";
    const isUploading = status === "uploading";

    // 触发文件变化回调
    const notifyChange = useCallback((newFiles: UploadFile[]) => {
        onChange?.(newFiles);
    }, [onChange]);

    // 验证单个文件
    const validateFile = useCallback((file: File): UploadError | null => {
        // 文件大小验证
        if (maxSize && file.size > maxSize) {
            return createUploadError(
                "FILE_SIZE_EXCEEDED",
                `文件大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`,
                file
            );
        }
        if (minSize && file.size < minSize) {
            return createUploadError(
                "FILE_SIZE_EXCEEDED",
                `文件大小不能小于 ${Math.round(minSize / 1024)}KB`,
                file
            );
        }
        return null;
    }, [maxSize, minSize]);

    // 验证文件列表
    const validateFiles = useCallback((newFiles: File[]): { valid: File[]; errors: UploadError[] } => {
        const valid: File[] = [];
        const errors: UploadError[] = [];

        // 文件数量验证
        if (maxCount && newFiles.length > maxCount) {
            const error = createUploadError(
                "FILE_COUNT_EXCEEDED",
                `最多只能上传 ${maxCount} 个文件`
            );
            errors.push(error);
        }

        // 逐个验证
        for (const file of newFiles) {
            const error = validateFile(file);
            if (error) {
                errors.push(error);
            } else {
                valid.push(file);
            }
        }

        return { valid, errors };
    }, [maxCount, validateFile]);

    // 上传单个文件
    const uploadSingleFile = async (
        fileItem: UploadFile,
        totalBytes: number,
        uploadedBytes: number
    ): Promise<UploadFile> => {
        const { file } = fileItem;

        // 创建 AbortController
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            // 构建 FormData
            const formData = new FormData();
            formData.append(name, file);
            // 添加额外数据
            if (data) {
                Object.entries(data).forEach(([key, value]) => {
                    formData.append(key, String(value));
                });
            }

            const responseText = await uploadFile({
                action,
                method,
                header: headers,
                signal: controller.signal,
                formData,
                onProgress: (event) => {
                    if (!event.lengthComputable || file.size === 0) {
                        return;
                    }
                    // 计算当前文件的进度
                    const percent = Math.min(
                        100,
                        Math.round((event.loaded / file.size) * 100)
                    );
                    // 更新全局进度（所有文件的累计）
                    const currentTotalBytes = uploadedBytes + event.loaded;
                    setProgress(
                        Math.round((currentTotalBytes / totalBytes) * 100)
                    );
                    onProgress?.(percent, file);

                    // 更新当前文件的进度
                    setFiles((prev) =>
                        prev.map((f) =>
                            f.id === fileItem.id
                                ? { ...f, progress: percent }
                                : f
                        )
                    );
                },
            });

            // 上传成功
            const updatedFile: UploadFile = {
                ...fileItem,
                status: "success",
                progress: 100,
                response: responseText,
            };

            onSuccess?.(responseText, file);
            return updatedFile;
        } catch (event) {
            // 判断是否为取消
            const isAbort =
                cancelRef.current ||
                (event as DOMException)?.name === "AbortError";

            if (isAbort) {
                return { ...fileItem, status: "idle", progress: 0 };
            }

            // 上传失败
            const error = createUploadError(
                "NETWORK_ERROR",
                event instanceof Error ? event.message : "上传失败",
                file,
                event instanceof Error ? event : undefined
            );

            onError?.(error, file);
            return { ...fileItem, status: "error", error };
        }
    };

    // 上传文件核心逻辑
    const uploadFiles = useCallback(async (filesToUpload: UploadFile[]) => {
        // 无 action 或无文件，直接返回
        if (!action || filesToUpload.length === 0) {
            setStatus("idle");
            setProgress(0);
            return;
        }

        // 非自动上传模式，不触发上传
        if (!autoUpload) {
            return;
        }

        cancelRef.current = false;
        abortRef.current?.abort();
        abortRef.current = null;

        setStatus("uploading");
        setProgress(0);

        // 计算总大小
        const totalBytes = filesToUpload.reduce((sum, f) => sum + f.file.size, 0);
        let uploadedBytes = 0;

        const uploadedFiles: UploadFile[] = [];

        for (const fileItem of filesToUpload) {
            // 检查取消
            if (cancelRef.current) {
                setStatus("idle");
                setProgress(0);
                return;
            }

            // 更新为上传中状态
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === fileItem.id ? { ...f, status: "uploading" as const } : f
                )
            );

            const result = await uploadSingleFile(fileItem, totalBytes, uploadedBytes);
            uploadedFiles.push(result);

            // 更新文件列表中的状态（只需要更新 status 和 response，progress 已在 onProgress 中更新）
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === fileItem.id
                        ? { ...f, status: result.status, response: result.response }
                        : f
                )
            );

            if (result.status === "success") {
                uploadedBytes += fileItem.file.size;
                setProgress(
                    totalBytes === 0
                        ? 100
                        : Math.round((uploadedBytes / totalBytes) * 100)
                );
            } else if (result.status === "error") {
                // 如果有错误，停止上传
                setStatus("error");
                return;
            }
        }

        // 全部成功
        setStatus("success");
        setProgress(100);
        onComplete?.(uploadedFiles);
    }, [action, autoUpload, headers, method, name, data, onComplete, onError, onProgress, onSuccess]);

    // 处理文件选择
    const handleFiles = useCallback((fileList: FileList | File[]) => {
        const newFiles = Array.from(fileList);

        // 验证
        const { valid, errors } = validateFiles(newFiles);

        // 触发错误回调
        errors.forEach((error) => {
            onError?.(error, error.file!);
        });

        if (valid.length === 0) {
            return;
        }

        // 创建文件项
        const fileItems: UploadFile[] = valid.map((file) => ({
            id: generateFileId(),
            file,
            status: "idle" as const,
            progress: 0,
        }));

        // 更新文件列表
        setFiles((prev) => {
            const newFileList = [...prev, ...fileItems];
            notifyChange(newFileList);
            return newFileList;
        });

        // 触发上传
        void uploadFiles(fileItems);
    }, [validateFiles, notifyChange, uploadFiles, onError]);

    // 处理输入变化
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            handleFiles(event.target.files);
            // 重置 input 以允许重复选择同一文件
            event.target.value = "";
        }
    };

    // 处理拖拽悬停
    const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };

    // 处理拖拽离开
    const handleDragLeave = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDragging(false);
    };

    // 处理拖拽放下
    const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDragging(false);
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            handleFiles(event.dataTransfer.files);
            event.dataTransfer.clearData();
        }
    };

    // 处理取消
    const handleCancel = useCallback(() => {
        if (status !== "uploading") {
            return;
        }
        cancelRef.current = true;
        abortRef.current?.abort();
        abortRef.current = null;
        setStatus("idle");
        setProgress(0);
        setFiles([]);
    }, [status]);

    // 处理重置
    const handleReset = useCallback(() => {
        setFiles([]);
        setStatus("idle");
        setProgress(0);
        setPreviewUrl(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
        notifyChange([]);
    }, [notifyChange]);

    // 处理删除文件
    const handleRemoveFile = useCallback((id: string) => {
        setFiles((prev) => {
            const newFiles = prev.filter((f) => f.id !== id);
            notifyChange(newFiles);
            return newFiles;
        });
    }, [notifyChange]);

    // 处理取消单个文件上传
    const handleCancelFile = useCallback((id: string) => {
        // 找到对应的文件并标记为取消
        setFiles((prev) =>
            prev.map((f) =>
                f.id === id ? { ...f, status: "idle" as const, progress: 0 } : f
            )
        );
    }, []);

    // 手动触发上传
    const triggerUpload = useCallback(() => {
        if (files.length > 0 && autoUpload === false) {
            const pendingFiles = files.filter((f) => f.status === "idle");
            if (pendingFiles.length > 0) {
                uploadFiles(pendingFiles);
            }
        }
    }, [files, autoUpload, uploadFiles]);

    // 图片预览
    useEffect(() => {
        if (mode !== "image") {
            setPreviewUrl(null);
            return;
        }

        const file = files[0]?.file;
        if (!file || !file.type.startsWith("image/")) {
            setPreviewUrl(null);
            return;
        }

        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [files, mode]);

    // 构建 trigger props
    const triggerProps: UploadTriggerConfig = {
        inputId,
        variant,
        size,
        shape,
        className: cn(isDisabled && "cursor-not-allowed opacity-80"),
        status,
        progress,
        onCancel: handleCancel,
        onReset: handleReset,
    };

    // 渲染
    return (
        <div>
            {mode === "button" && <ButtonUpload {...triggerProps} />}
            {mode === "image" && (
                <ImageUpload {...triggerProps} previewUrl={previewUrl} />
            )}
            {mode === "dragger" && (
                <DraggerUpload
                    {...triggerProps}
                    isDragging={isDragging}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                />
            )}

            <input
                className="opacity-0 absolute"
                disabled={isDisabled}
                id={inputId}
                ref={inputRef}
                type="file"
                multiple={maxCount !== 1}
                accept={accept}
                // @ts-expect-error - webkitdirectory 是非标准但广泛支持的属性
                webkitdirectory={directory ? "" : undefined}
                onChange={handleInputChange}
            />

            {/* 文件列表 */}
            <FileList
                files={files}
                show={showFileList}
                onRemove={handleRemoveFile}
                onCancel={handleCancelFile}
            />
        </div>
    );
}

export default Upload;
export type { UploadConfig, UploadFile, UploadError, UploadErrorType, UploadAccept, UploadAcceptType };
