/**
 * 文件列表组件
 * 显示所有已选择/上传的文件及其进度
 */
import { Icon } from "@iconify/react";
import { UploadFile, type UploadStatus } from "../types";

/** 文件列表项组件 Props */
interface FileItemProps {
    /** 文件项数据 */
    file: UploadFile;
    /** 删除回调 */
    onRemove?: (id: string) => void;
    /** 取消上传回调 */
    onCancel?: (id: string) => void;
}

/**
 * 单个文件项组件
 * 显示文件名、进度条、状态图标
 */
function FileItem({ file, onRemove, onCancel }: FileItemProps) {
    const { id, file: fileData, status, progress, error } = file;

    // 状态图标配置
    const iconMap = {
        idle: { icon: "lucide:file", className: "text-gray-400" },
        uploading: { icon: "lucide:loader-2", className: "text-blue-500 animate-spin" },
        success: { icon: "lucide:check-circle", className: "text-green-500" },
        error: { icon: "lucide:x-circle", className: "text-red-500" },
    };
    const iconConfig = iconMap[status] || iconMap.idle;

    // 格式化文件大小
    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    };

    return (
        <div className="flex items-center gap-3 p-3 border rounded-md bg-white dark:bg-zinc-800">
            {/* 文件图标 */}
            <Icon icon={iconConfig.icon} className={iconConfig.className} width={20} />

            {/* 文件信息 */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <span className="truncate font-medium text-md">{fileData.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                        {formatSize(fileData.size)}
                    </span>
                </div>

                {/* 进度条 */}
                {(status === "uploading" || status === "success") && (
                    <div className="mt-1">
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-xs text-gray-500">{progress}%</span>
                    </div>
                )}

                {/* 错误信息 */}
                {status === "error" && error && (
                    <div className="mt-1 text-xs text-red-500">{error.message}</div>
                )}
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-1">
                {/* 取消按钮 - 上传中显示 */}
                {status === "uploading" && onCancel && (
                    <button
                        type="button"
                        onClick={() => onCancel(id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="取消"
                    >
                        <Icon icon="lucide:x" className="w-4 h-4 text-gray-500" />
                    </button>
                )}

                {/* 删除按钮 - 非上传中显示 */}
                {status !== "uploading" && onRemove && (
                    <button
                        type="button"
                        onClick={() => onRemove(id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="删除"
                    >
                        <Icon icon="lucide:trash-2" className="w-4 h-4 text-gray-500" />
                    </button>
                )}
            </div>
        </div>
    );
}

/** 文件列表组件 Props */
interface FileListProps {
    /** 文件列表 */
    files: UploadFile[];
    /** 删除回调 */
    onRemove?: (id: string) => void;
    /** 取消上传回调 */
    onCancel?: (id: string) => void;
    /** 是否显示 */
    show?: boolean;
}

/**
 * 文件列表组件
 * 渲染所有已选择的文件
 */
function FileList({ files, onRemove, onCancel, show = true }: FileListProps) {
    if (!show || files.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2 mt-4">
            {files.map((file) => (
                <FileItem
                    key={file.id}
                    file={file}
                    onRemove={onRemove}
                    onCancel={onCancel}
                />
            ))}
        </div>
    );
}

export { FileList, FileItem };
export type { FileListProps, FileItemProps };
