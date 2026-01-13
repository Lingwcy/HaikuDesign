import {
    useEffect,
    useId,
    useRef,
    useState,
    type ChangeEvent,
    type DragEvent,
} from "react";
import {
    type FileRequestOptions,
    type UploadStatus,
    type UploadVariantProps,
    UploadTriggerConfig
} from "./types";
import { uploadFile } from "./utils";
import ButtonUpload from "./components/ButtonUpload";
import DraggerUpload from "./components/DraggerUpload";
import ImageUpload from "./components/ImageUpload";
import { cn } from "../../lib/utils";


interface UploadProps extends UploadVariantProps {
    className?: string;
    action?: string;
    method?: FileRequestOptions["method"];
    headers?: FileRequestOptions["header"];
    disabled?: boolean;
    onProgress?: (
        progress: number,
        event: ProgressEvent<EventTarget>,
        file: File
    ) => void;
    onSuccess?: (responseText: string, file: File) => void;
    onError?: (event: ProgressEvent<EventTarget>, file: File) => void;
}

function Upload({
    type = "button",
    variant,
    size,
    shape,
    className,
    action,
    method = "post",
    headers,
    disabled = false,
    onProgress,
    onSuccess,
    onError,
}: UploadProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<UploadStatus>("idle");
    const [progress, setProgress] = useState(0);
    const inputId = useId();
    const abortRef = useRef<AbortController | null>(null);
    const cancelRef = useRef(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const isDisabled = disabled || status === "uploading" || status === "success"; // 上传中或上传成功时禁用上传操作

    className = cn(
        className,
        isDisabled && "cursor-not-allowed opacity-80",
    );

    const uploadFiles = async (selectedFiles: File[]) => {
        if (!action || selectedFiles.length === 0) {
            setStatus("idle");
            setProgress(0);
            return;
        }

        cancelRef.current = false;
        abortRef.current?.abort();
        abortRef.current = null;

        setStatus("uploading");
        setProgress(0);

        const totalBytes = selectedFiles.reduce((sum, file) => sum + file.size, 0);
        let uploadedBytes = 0;

        for (const file of selectedFiles) {
            if (cancelRef.current) {
                setStatus("idle");
                setProgress(0);
                return;
            }

            const controller = new AbortController();
            abortRef.current = controller;
            try {
                const responseText = await uploadFile({
                    action,
                    file,
                    method,
                    header: headers,
                    signal: abortRef.current.signal,
                    onProgress: (event) => {
                        if (!event.lengthComputable || totalBytes === 0) {
                            return;
                        }
                        const currentBytes = uploadedBytes + event.loaded;
                        const percent = Math.min(
                            100,
                            Math.round((currentBytes / totalBytes) * 100)
                        );
                        setProgress(percent);
                        onProgress?.(percent, event, file);
                    },
                });
                uploadedBytes += file.size;
                setProgress(
                    totalBytes === 0
                        ? 100
                        : Math.round((uploadedBytes / totalBytes) * 100)
                );
                onSuccess?.(responseText, file);
            } catch (event) {
                const isAbort =
                    cancelRef.current ||
                    (event as DOMException)?.name === "AbortError";
                if (isAbort) {
                    setStatus("idle");
                    setProgress(0);
                    return;
                }
                setStatus("error");
                onError?.(event as ProgressEvent<EventTarget>, file);
                return;
            } finally {
                abortRef.current = null;
            }
        }

        setStatus("success");
        setProgress(100);
    };

    const handleFiles = (fileList: FileList | File[]) => {
        const nextFiles = Array.from(fileList);
        setFiles(nextFiles);
        void uploadFiles(nextFiles);
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            handleFiles(event.target.files);
        }
    };

    const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDragging(false);
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            handleFiles(event.dataTransfer.files);
            event.dataTransfer.clearData();
        }
    };

    const handleCancel = () => {
        if (status !== "uploading") {
            return;
        }
        cancelRef.current = true;
        abortRef.current?.abort();
        abortRef.current = null;
        setStatus("idle");
        setProgress(0);
    };

    const handleReset = () => {
        setFiles([]);
        setStatus("idle");
        setProgress(0);
        setPreviewUrl(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    }

    // 用于 files 变化时，如果此时子组件是image且上传资源为image/，启用图片预览。
    useEffect(() => {
        if (type !== "image") {
            setPreviewUrl(null);
            return;
        }

        const file = files[0];
        if (!file || !file.type.startsWith("image/")) {
            setPreviewUrl(null);
            return;
        }

        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [files, type]);



    // 统一将样式、进度、状态信息向下传递给 UploadTrigger 和 样式子组件。
    const triggerProps: UploadTriggerConfig = {
        inputId,
        variant,
        size,
        shape,
        className,
        status,
        progress,
        onCancel: handleCancel,
        onReset: handleReset,
    };

    return (
        <div>
            {type === "button" && <ButtonUpload {...triggerProps} />}
            {type === "image" && (
                <ImageUpload {...triggerProps} previewUrl={previewUrl} />
            )}
            {type === "dragger" && (
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
                multiple
                accept={type === "image" ? "image/*" : undefined}
                onChange={handleInputChange}
            />
        </div>
    );
}

export default Upload;
