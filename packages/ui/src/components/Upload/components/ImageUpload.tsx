import UploadTrigger from "./UploadTrigger";
import { type UploadTriggerConfig } from "../types";

interface ImageUploadProps extends UploadTriggerConfig {
    previewUrl?: string | null;
}

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
