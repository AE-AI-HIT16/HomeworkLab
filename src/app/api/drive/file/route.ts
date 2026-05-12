import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDriveApi } from "@/lib/google-drive";
import { getDriveFileAccessIndex } from "@/lib/drive-access";
import { getManagedCourseIdsForUser, getUserRole } from "@/lib/roles";

async function canReadDriveFile(githubUsername: string, fileId: string): Promise<boolean> {
    const role = await getUserRole(githubUsername);
    if (role === "unauthorized") return false;

    const accessIndex = await getDriveFileAccessIndex();
    const entries = accessIndex[fileId] ?? [];
    if (entries.length === 0) return false;

    if (role === "admin") return true;

    if (role === "teacher") {
        const managedCourseIds = await getManagedCourseIdsForUser(githubUsername, role);
        const managedCourses = new Set(managedCourseIds);
        return entries.some((entry) => managedCourses.has(entry.courseId));
    }

    return entries.some((entry) => entry.published);
}

/**
 * GET /api/drive/file?id=<driveFileId>
 * Proxy-stream nội dung file từ Google Drive.
 * Dùng chủ yếu để load .ipynb JSON cho NotebookPreview component.
 * Yêu cầu đăng nhập.
 */
export async function GET(req: NextRequest) {
    // Auth check
    const session = await auth();
    if (!session?.user?.githubUsername) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("id");

    if (!fileId) {
        return NextResponse.json({ error: "Missing file id" }, { status: 400 });
    }

    const hasAccess = await canReadDriveFile(session.user.githubUsername, fileId);
    if (!hasAccess) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const drive = getDriveApi();

    if (!drive) {
        // Mock mode: return empty notebook
        return NextResponse.json({
            nbformat: 4,
            nbformat_minor: 5,
            metadata: {},
            cells: [
                {
                    cell_type: "markdown",
                    source: "**[Dev Mode]** Google Drive not configured. This is a mock notebook preview.",
                    metadata: {},
                    outputs: [],
                },
            ],
        });
    }

    try {
        // Get file metadata first to check mimeType
        const meta = await drive.files.get({
            fileId,
            fields: "mimeType,name",
        });

        // Download file content
        const res = await drive.files.get(
            { fileId, alt: "media" },
            { responseType: "arraybuffer" }
        );

        const buffer = Buffer.from(res.data as ArrayBuffer);
        const mimeType = meta.data.mimeType ?? "application/octet-stream";

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": mimeType,
                "Cache-Control": "private, max-age=300", // cache 5 mins
            },
        });
    } catch (error) {
        console.error("Drive file proxy error:", error);
        return NextResponse.json({ error: "Could not fetch file from Drive" }, { status: 500 });
    }
}
