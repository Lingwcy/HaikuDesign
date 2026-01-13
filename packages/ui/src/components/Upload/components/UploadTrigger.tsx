import { UploadVariantProps,uploadTriggerVariants } from "../types";
import {
    type LabelHTMLAttributes,
} from "react";
import { cn } from "../../../lib/utils";

type UploadTriggerProps = UploadVariantProps &
    Omit<LabelHTMLAttributes<HTMLLabelElement>, "color"> & {
        inputId: string;
        isDragging?: boolean;
    };

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
