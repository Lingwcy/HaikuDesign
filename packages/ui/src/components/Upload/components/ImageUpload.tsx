import UploadTrigger from "./UploadTrigger";
import { type UploadTriggerConfig } from "../types";

/** 图片上传组件 Props */
interface ImageUploadProps extends UploadTriggerConfig {
    previewUrl?: string | null; // 图片预览 URL
}

/**
 * 图片上传组件
 * 显示为图片缩略图样式，支持图片预览和上传进度覆盖
 */
export default function ImageUpload({
    inputId,
    previewUrl,
    variant,
    size,
    shape,
    className,
    status,
    progress,
}: ImageUploadProps) {
    const isUploading = status === "uploading";
    return (
        <UploadTrigger
            inputId={inputId}
            type="image"
            variant={variant}
            size={size}
            shape={shape}
            className={className}
        >
            {previewUrl ? (
                <img src={previewUrl} alt="上传预览" className="h-full w-full object-cover" />
            ) : (
                <span className="text-xs inline-flex font-medium">上传</span>
            )}
            {isUploading && (
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-30 opacity-70 haiku-upload-shine"
                />
            )}
            {isUploading && (
                <span className="absolute inset-0 z-20 tabular-nums text-right flex items-center justify-center bg-black/35 text-xs font-medium text-white">
                    {progress}%
                </span>
            )}
            {status === "error" && (
                <span className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 text-xs font-medium text-white">
                    上传失败
                </span>
            )}
        </UploadTrigger>
    );
}
