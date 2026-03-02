/**
 * 分片列表组件
 * 显示分片上传时各个分片的状态和进度
 */
import { Icon } from "@iconify/react";
import { type ChunkProgress } from "../types";

/** 单个分片项 Props */
interface ChunkItemProps {
    index: number;
    progress: number;        // 0-100
    isCompleted: boolean;    // 是否已完成
    isUploading: boolean;   // 是否正在上传
    isPending: boolean;     // 是否等待上传
}

/**
 * 单个分片项组件
 * 使用小圆点展示状态
 */
function ChunkItem({ index, progress, isCompleted, isUploading, isPending }: ChunkItemProps) {
    // 状态颜色
    const getStatusColor = () => {
        if (isCompleted) return "bg-green-500";
        if (isUploading) return "bg-blue-500";
        return "bg-gray-300";
    };

    return (
        <div className="flex items-center gap-1">
            <div
                className={`w-2 h-2 rounded-full ${getStatusColor()} transition-all duration-200`}
                title={`分片 ${index + 1}: ${isCompleted ? "已完成" : isUploading ? `${progress}%` : "等待中"}`}
            >
                {/* 上传中的分片显示进度环 */}
                {isUploading && (
                    <svg className="w-2 h-2 -rotate-90" viewBox="0 0 8 8">
                        <circle
                            cx="4"
                            cy="4"
                            r="3"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="1"
                        />
                        <circle
                            cx="4"
                            cy="4"
                            r="3"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="1"
                            strokeDasharray={`${progress * 0.188} 18.8`}
                            strokeLinecap="round"
                        />
                    </svg>
                )}
            </div>
        </div>
    );
}

/** 分片列表 Props */
interface ChunkListProps {
    chunkProgress?: ChunkProgress;  // 当前分片的进度信息
    totalChunks: number;            // 总分片数
}

/**
 * 分片列表组件
 * 简洁地展示所有分片的上传状态
 * 样式：行内小圆点，适合放在文件进度条下方
 */
function ChunkList({ chunkProgress, totalChunks }: ChunkListProps) {
    if (!chunkProgress || totalChunks <= 1) {
        return null;
    }

    const { uploadedChunks, chunkIndex, chunkProgress: currentProgress } = chunkProgress;

    // 生成所有分片的状态数组
    const chunks = Array.from({ length: totalChunks }, (_, i) => {
        if (i < uploadedChunks) {
            return { index: i, status: "completed" as const };
        } else if (i === chunkIndex) {
            return { index: i, status: "uploading" as const, progress: currentProgress };
        } else {
            return { index: i, status: "pending" as const };
        }
    });

    // 如果分片太多，只显示部分（每5个一组用逗号分隔）
    if (totalChunks > 20) {
        return (
            <div className="mt-1 text-xs text-gray-400">
                <div className="flex items-center gap-2 flex-wrap">
                    <span>{uploadedChunks}/{totalChunks} 分片已上传</span>
                    {chunkIndex !== undefined && (
                        <span className="text-blue-500">当前: 分片 {chunkIndex + 1} ({currentProgress}%)</span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="mt-1 flex items-center gap-0.5 flex-wrap">
            {chunks.map((chunk) => (
                <ChunkItem
                    key={chunk.index}
                    index={chunk.index}
                    progress={chunk.progress || 0}
                    isCompleted={chunk.status === "completed"}
                    isUploading={chunk.status === "uploading"}
                    isPending={chunk.status === "pending"}
                />
            ))}
            <span className="text-xs text-gray-400 ml-1">
                {uploadedChunks}/{totalChunks}
            </span>
        </div>
    );
}

/** 紧凑分片进度（适合放在进度条旁边） */
interface CompactChunkProgressProps {
    chunkProgress?: ChunkProgress;
}

function CompactChunkProgress({ chunkProgress }: CompactChunkProgressProps) {
    if (!chunkProgress) return null;

    const { uploadedChunks, totalChunks, totalProgress, chunkIndex, chunkProgress: currentProgress } = chunkProgress;

    if (totalChunks <= 1) return null;

    return (
        <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
                <Icon icon="lucide:layers" className="w-3 h-3" />
                <span>{uploadedChunks}/{totalChunks}</span>
            </div>
            {chunkIndex !== undefined && (
                <span className="text-blue-500">
                    {currentProgress}%
                </span>
            )}
        </div>
    );
}

export { ChunkList, ChunkItem, CompactChunkProgress };
export type { ChunkItemProps, ChunkListProps, CompactChunkProgressProps };
