import { cva, type VariantProps} from "class-variance-authority";

/** 上传状态类型 */
type UploadStatus = "idle" | "uploading" | "success" | "error";

/** HTTP 请求方法类型 */
type HttpMethod = "get" | "post" | "put";

/** 文件请求选项 */
type FileRequestOptions = {
    action: string;          // 上传地址
    file?: File;              // 要上传的文件（如果提供 formData 则可选）
    method?: HttpMethod;    // 请求方法，默认 post
    header?: Record<string, string>; // 请求头
    onProgress?: (event: ProgressEvent<EventTarget>) => void; // 进度回调
    signal?: AbortSignal;    // 中止信号
    formData?: FormData;     // 完整的 FormData 对象
};

// ============================================
// 统一配置 API (4.1 API 设计优化)
// ============================================

/** 上传模式类型 */
export type UploadMode = 'button' | 'image' | 'dragger';

/** 上传变体类型 */
export type UploadVariant = 'default' | 'dashed';

/** 上传尺寸类型 */
export type UploadSize = 'sm' | 'md' | 'lg';

/** 上传形状类型 */
export type UploadShape = 'rounded' | 'square';

/** 文件接受类型 - 预定义类型或自定义 MIME 类型/扩展名 */
export type UploadAcceptType =
    | 'image/*'           // 所有图片
    | 'video/*'          // 所有视频
    | 'audio/*'          // 所有音频
    | 'image/jpeg'       // JPEG 图片
    | 'image/png'        // PNG 图片
    | 'image/gif'        // GIF 图片
    | 'image/webp'       // WebP 图片
    | 'application/pdf'   // PDF 文档
    | 'application/msword'           // Word 文档
    | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'  // Word 2007+
    | 'application/vnd.ms-excel'     // Excel 文档
    | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'  // Excel 2007+
    | 'application/zip'      // ZIP 压缩文件
    | 'application/x-rar-compressed'  // RAR 压缩文件
    | 'text/*'          // 所有文本文件
    | `.${string}`;     // 自定义文件扩展名

/** 文件接受类型 - 支持多个类型组合 */
export type UploadAccept = UploadAcceptType | `${UploadAcceptType},${string}` | string;

/** 上传错误类型 */
export type UploadErrorType =
    | 'FILE_TYPE_MISMATCH'    // 文件类型不匹配
    | 'FILE_SIZE_EXCEEDED'    // 文件大小超限
    | 'FILE_COUNT_EXCEEDED'   // 文件数量超限
    | 'NETWORK_ERROR'         // 网络错误
    | 'SERVER_ERROR'          // 服务器错误
    | 'ABORT_ERROR'           // 取消上传
    | 'UNKNOWN_ERROR';        // 未知错误

/** 分片上传配置 */
export interface ChunkedUploadConfig {
    /** 是否启用分片上传 */
    chunked?: boolean;
    /** 分片大小（字节），默认 2MB */
    chunkSize?: number;
    /** 分片并行数，默认 3 */
    chunkConcurrency?: number;
    /** 是否启用断点续传 */
    resumable?: boolean;
    /** 获取已上传分片列表的 API */
    chunkedUrl?: string;
    /** 合并分片的 API */
    mergeUrl?: string;
    /** 触发自动分片上传的文件大小阈值，默认 5MB */
    chunkThreshold?: number;
}

/** 分片信息 */
export interface UploadChunk {
    index: number;       // 分片索引
    start: number;       // 起始字节
    end: number;         // 结束字节
    size: number;        // 分片大小
    uploaded: boolean;   // 是否已上传
}

/** 分片上传进度 */
export interface ChunkProgress {
    chunkIndex: number;
    chunkProgress: number;  // 当前分片进度 0-100
    totalProgress: number;  // 整体进度 0-100
    uploadedChunks: number;
    totalChunks: number;
}

/** 分片上传选项 */
export interface ChunkUploadOptions {
    action: string;
    chunk: Blob;
    chunkIndex: number;
    totalChunks: number;
    fileName: string;
    fileSize: number;
    method?: HttpMethod;
    headers?: Record<string, string>;
    onProgress?: (event: ProgressEvent<EventTarget>) => void;
    signal?: AbortSignal;
}

/** 上传错误接口 */
export interface UploadError {
    type: UploadErrorType;
    message: string;
    file?: File;
    originalError?: Error;
}

/** 文件项接口 */
export interface UploadFile {
    id: string;
    file: File;
    status: UploadStatus;
    progress: number;
    response?: string;
    error?: UploadError;
}

/** 统一的上传配置接口 */
export interface UploadConfig {
    // ============ 行为配置 ============
    /** 上传模式：button-按钮 | image-图片 | dragger-拖拽 */
    mode?: UploadMode;
    /** 上传模式：auto-选择后自动上传, manual-手动触发 */
    autoUpload?: boolean;
    /** 是否显示文件列表 */
    showFileList?: boolean;
    /** 是否允许上传目录（使用 webkitdirectory） */
    directory?: boolean;

    // ============ 验证配置 ============
    /** 允许的文件类型，支持预定义类型或自定义字符串 */
    accept?: UploadAccept;
    /** 限制文件最大大小（字节） */
    maxSize?: number;
    /** 限制文件最小大小（字节） */
    minSize?: number;
    /** 允许的最大文件数 */
    maxCount?: number;

    // ============ 样式配置 ============
    /** 样式变体：default-默认 | dashed-虚线 */
    variant?: UploadVariant;
    /** 尺寸：sm-小 | md-中 | lg-大 */
    size?: UploadSize;
    /** 形状：rounded-圆角 | square-方形 */
    shape?: UploadShape;

    // ============ 请求配置 ============
    /** 上传地址 URL */
    action: string;
    /** HTTP 请求方法，默认 post */
    method?: 'get' | 'post' | 'put';
    /** 请求头 */
    headers?: Record<string, string>;
    /** 自定义请求体数据 */
    data?: Record<string, unknown>;
    /** 请求体字段名，默认 "file" */
    name?: string;

    // ============ 分片上传配置 ============
    /** 分片上传配置 */
    chunkedConfig?: ChunkedUploadConfig;

    // ============ 回调 ============
    /** 文件变化回调 */
    onChange?: (files: UploadFile[]) => void;
    /** 上传进度回调 */
    onProgress?: (progress: number, file: File) => void;
    /** 单个文件上传成功回调 */
    onSuccess?: (response: string, file: File) => void;
    /** 单个文件上传失败回调 */
    onError?: (error: UploadError, file: File) => void;
    /** 所有文件上传完成回调 */
    onComplete?: (files: UploadFile[]) => void;
}

/** 统一配置解析结果 */
export interface UseUploadOptions {
    mode: UploadMode;
    autoUpload: boolean;
    accept: string | undefined;
    maxSize: number | undefined;
    minSize: number | undefined;
    maxCount: number | undefined;
    variant: UploadVariant;
    size: UploadSize;
    shape: UploadShape;
    action: string;
    method: 'get' | 'post' | 'put';
    headers: Record<string, string> | undefined;
    data: Record<string, unknown> | undefined;
    name: string;
    chunkedConfig: ChunkedUploadConfig | undefined;
}

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

/** 上传触发器变体属性类型 */
type UploadVariantProps = VariantProps<typeof uploadTriggerVariants>;

/** 上传触发器配置接口 */
interface UploadTriggerConfig {
    inputId: string;                    // 文件输入框 ID
    variant?: UploadVariantProps["variant"]; // 样式变体
    size?: UploadVariantProps["size"];   // 尺寸
    shape?: UploadVariantProps["shape"]; // 形状
    className?: string;                 // 额外类名
    status: UploadStatus;              // 当前状态
    progress: number;                  // 进度百分比
    onCancel?: () => void;             // 取消回调
    onReset?: () => void;              // 重置回调
}

// 旧的导出（保持向后兼容）
// 注意：UploadMode, UploadVariant 等类型已在定义时导出，无需重复导出
export {
    FileRequestOptions,
    UploadStatus,
    UploadVariantProps,
    uploadTriggerVariants,
    UploadTriggerConfig
};
