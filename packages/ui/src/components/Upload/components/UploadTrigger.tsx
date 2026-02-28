import { UploadVariantProps,uploadTriggerVariants } from "../types";
import {
    type LabelHTMLAttributes,
} from "react";
import { cn } from "../../../lib/utils";

/** 上传触发器 Props */
type UploadTriggerProps = UploadVariantProps &
    Omit<LabelHTMLAttributes<HTMLLabelElement>, "color"> & {
        inputId: string;              // 关联的文件输入框 ID
        isDragging?: boolean;         // 是否正在拖拽
    };

/**
 * 上传触发器基础组件
 * 作为文件输入框的 label 包装器，应用变体样式
 */
export default function UploadTrigger({
    inputId,
    type = "button",
    variant,
    size,
    shape,
    className,
    isDragging,
    children,
    ...props
}: UploadTriggerProps) {
    return (
        <label
            htmlFor={inputId}
            className={cn(
                uploadTriggerVariants({ type, variant, size, shape }),
                isDragging && "border-primary-300 text-primary-900",
                className
            )}
            {...props}
        >
            {children}
        </label>
    );
}
