import { unstable_cache } from "next/cache";
import { getAssignments, getMaterials } from "@/lib/google-sheets";

interface DriveFileAccessEntry {
    courseId: string;
    published: boolean;
}

export type DriveFileAccessIndex = Record<string, DriveFileAccessEntry[]>;

export function extractDriveFileId(url: string): string | null {
    const fileMatch = url.match(/\/file\/d\/([-\w]{25,})/);
    if (fileMatch) return fileMatch[1];

    const idParamMatch = url.match(/[?&]id=([-\w]{25,})/);
    if (idParamMatch) return idParamMatch[1];

    const fallbackMatch = url.match(/[-\w]{25,}/);
    return fallbackMatch ? fallbackMatch[0] : null;
}

function addAccessEntry(
    index: DriveFileAccessIndex,
    fileId: string | null | undefined,
    entry: DriveFileAccessEntry
) {
    if (!fileId) return;
    const entries = index[fileId] ?? [];
    entries.push(entry);
    index[fileId] = entries;
}

export const getDriveFileAccessIndex = unstable_cache(async (): Promise<DriveFileAccessIndex> => {
    const [assignments, materials] = await Promise.all([
        getAssignments(),
        getMaterials(),
    ]);

    const index: DriveFileAccessIndex = {};

    for (const assignment of assignments) {
        for (const file of assignment.promptFiles) {
            addAccessEntry(index, file.driveFileId, {
                courseId: assignment.courseId,
                published: assignment.published,
            });
        }
    }

    for (const material of materials) {
        addAccessEntry(index, extractDriveFileId(material.url), {
            courseId: material.courseId,
            published: material.published,
        });
    }

    return index;
}, ["drive-file-access-index"], {
    tags: ["sheets-assignments", "sheets-materials"],
    revalidate: 3600,
});
