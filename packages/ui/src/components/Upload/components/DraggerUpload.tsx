import { type UploadTriggerConfig } from "../types";
import {
    type DragEvent,
} from "react";
import UploadTrigger from "./UploadTrigger";

/** 拖拽式上传组件 Props */
interface DraggerUploadProps extends UploadTriggerConfig {
    isDragging: boolean;                              // 是否正在拖拽
    onDragOver: (event: DragEvent<HTMLLabelElement>) => void;   // 拖拽悬停回调
    onDragLeave: (event: DragEvent<HTMLLabelElement>) => void;   // 拖拽离开回调
    onDrop: (event: DragEvent<HTMLLabelElement>) => void;        // 拖拽放下回调
}

/**
 * 拖拽式上传组件
 * 支持拖拽文件到上传区域，显示拖拽状态和上传进度
 */
export default function DraggerUpload({
    inputId,
    isDragging,
    onDragOver,
    onDragLeave,
    onDrop,
    variant,
    size,
    shape,
    className,
    status,
    progress,
}: DraggerUploadProps) {
    return (
        <UploadTrigger
            inputId={inputId}
            type="dragger"
            variant={variant}
            size={size}
            shape={shape}
            className={className}
            isDragging={isDragging}
            onDragOver={onDragOver}
            onDragEnter={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            {status === "uploading" ? (
                <>
                    <span className="text-sm font-medium inline-flex tabular-nums">
                        <span>上传中</span>
                        <span className="w-[4ch] text-right">{progress}%</span>
                    </span>
                    <div className="h-1 w-full rounded-full bg-default-foreground/20">
                        <div
                            className="h-full rounded-full bg-primary-900"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </>
            ) : status === "error" ? (
                <span className="text-sm font-medium">上传失败，点击重试</span>
            ) : status === "success" ? (
                <span className="text-sm font-medium">上传完成</span>
            ) : (
                <>
                    <span className="text-sm font-medium">点击或拖拽上传</span>
                    <span className="text-xs text-default opacity-70">支持多文件</span>
                </>
            )}
        </UploadTrigger>
    );
}
