import { type UploadTriggerConfig } from "../types";
import UploadTrigger from "./UploadTrigger";
import { Icon } from "@iconify/react";
import { cn } from "../../../lib/utils";
export default function ButtonUpload({
    inputId,
    variant,
    size,
    shape,
    className,
    status,
    progress,
    onCancel,
    onReset,
}: UploadTriggerConfig) {
    const isUploading = status === "uploading";
    const widthClass = isUploading ? "w-[154px]" : "w-[130px]";
    const mergedClassName = cn(
        widthClass,
        "justify-center transition-[width] duration-200 ease-out",
        isUploading && "relative overflow-hidden",
        className
    );
    const labelContent =
        status === "uploading" ? (
            <span className="inline-flex items-center gap-1 tabular-nums">
                <span>上传中</span>
                <span className="w-[3ch] text-right">{progress}</span>%
            </span>
        ) : status === "success" ? (
            "上传完成"
        ) : status === "error" ? (
            "上传失败"
        ) : (
            "点击上传文件"
        );
    
    const reloadButton = status === "success" && onReset ? (
        <button
            type="button"
            aria-label="Reset upload"
            className="ml-1 inline-flex items-center"
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onReset();
            }}
        >
            <Icon
                icon="bx:reset"
                width="18"
                height="18"
                className="cursor-pointer"
            />
        </button>
    ) : null;
    
    const cancelButton = status === "uploading" && onCancel ? (
        <button
            type="button"
            aria-label="Cancel upload"
            className="ml-1 inline-flex items-center"
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onCancel();
            }}
        >
            <Icon
                icon="fluent-emoji-flat:stop-sign"
                width="18"
                height="18"
                className="cursor-pointer"
            />
        </button>
    ) : null;

    // success/error/uploading/idle 
    const statusIcon = status === "success" ? (
        <Icon icon="icon-park:success" width="16" height="16" />
    ) : status === "error" ? (
        <Icon icon="material-icon-theme:folder-error" width="16" height="16" />
    ) : status === "uploading" ? (
        <Icon icon="line-md:loading-loop" width="16" height="16" />
    ) : <Icon icon="line-md:upload" width="16" height="16" />;

    return (
        <UploadTrigger
            inputId={inputId}
            type="button"
            variant={variant}
            size={size}
            shape={shape}
            className={mergedClassName}
        >
            {isUploading && (
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-80 haiku-upload-shine"
                />
            )}
            <span className="relative z-10 inline-flex items-center gap-2">
                {statusIcon}
                {labelContent}
                {cancelButton}
                {reloadButton}
            </span>
        </UploadTrigger>
    );
}
