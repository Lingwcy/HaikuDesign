import { cva, type VariantProps} from "class-variance-authority";

type UploadStatus = "idle" | "uploading" | "success" | "error";

type FileRequestOptions = {
    action: string;
    file: File;
    method?: "get" | "post";
    header?: Record<string, string>;
    onProgress?: (event: ProgressEvent<EventTarget>) => void;
    signal?: AbortSignal;
};

const uploadTriggerVariants = cva(
    "flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
    {
        variants: {
            type: {
                button: "",
                dragger: "flex-col border-2 border-dashed text-center",
                image: "relative overflow-hidden p-0",
            },
            variant: {
                default:
                    "border border-default bg-white text-default hover:bg-default-foreground/10",
                dashed:
                    "border-2 border-dashed border-default bg-white text-default hover:bg-default-foreground/10",
            },
            size: {
                sm: "",
                md: "",
                lg: "",
            },
            shape: {
                rounded: "rounded-md",
                square: "rounded-none",
            },
        },
        compoundVariants: [
            { type: "button", size: "sm", className: "h-8 px-3 text-xs" },
            { type: "button", size: "md", className: "h-9 px-4 text-sm" },
            { type: "button", size: "lg", className: "h-10 px-6 text-sm" },
            { type: "dragger", size: "sm", className: "min-h-[96px] px-4 py-6 text-xs" },
            { type: "dragger", size: "md", className: "min-h-[120px] px-6 py-8 text-sm" },
            { type: "dragger", size: "lg", className: "min-h-[152px] px-8 py-10 text-sm" },
            { type: "image", size: "sm", className: "h-15 w-15" },
            { type: "image", size: "md", className: "h-23 w-23" },
            { type: "image", size: "lg", className: "h-35 w-35" },
            { type: "image", shape: "rounded", className: "rounded-full" },
        ],
        defaultVariants: {
            type: "button",
            variant: "default",
            size: "md",
            shape: "rounded",
        },
    }
);

type UploadVariantProps = VariantProps<typeof uploadTriggerVariants>;

interface UploadTriggerConfig {
    inputId: string;
    variant?: UploadVariantProps["variant"];
    size?: UploadVariantProps["size"];
    shape?: UploadVariantProps["shape"];
    className?: string;
    status: UploadStatus;
    progress: number;
    onCancel?: () => void;
    onReset?: () => void
}

export {
    FileRequestOptions,
    UploadStatus,
    UploadVariantProps,
    uploadTriggerVariants,
    UploadTriggerConfig
};
