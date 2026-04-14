import type { PromptFile } from "@/types";

interface PromptFileListProps {
    files: PromptFile[];
}

function formatFileSize(bytes?: number): string {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const mimeIcons: Record<string, string> = {
    "application/pdf": "📕",
    "text/csv": "📊",
    "application/x-ipynb+json": "📓",
};

export function PromptFileList({ files }: PromptFileListProps) {
    if (files.length === 0) {
        return <p className="text-sm text-gray-400">No prompt files yet.</p>;
    }

    return (
        <ul className="space-y-2">
            {files.map((file) => {
                const icon = mimeIcons[file.mimeType] ?? "📄";
                const size = formatFileSize(file.sizeBytes);
                const driveUrl = `https://drive.google.com/file/d/${file.driveFileId}/view`;

                return (
                    <li key={file.driveFileId}>
                        <a
                            href={driveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 rounded-lg border hover:bg-gray-50 transition text-sm"
                        >
                            <span className="text-lg">{icon}</span>
                            <span className="flex-1 truncate font-medium text-gray-700">
                                {file.name}
                            </span>
                            {size && (
                                <span className="text-xs text-gray-400 shrink-0">{size}</span>
                            )}
                            <span className="text-xs text-blue-500 shrink-0">Open ↗</span>
                        </a>
                    </li>
                );
            })}
        </ul>
    );
}
