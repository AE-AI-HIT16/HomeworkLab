import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDriveApi } from "@/lib/google-drive";

/**
 * GET /api/drive/file?id=<driveFileId>
 * Proxy-stream nội dung file từ Google Drive.
 * Dùng chủ yếu để load .ipynb JSON cho NotebookPreview component.
 * Yêu cầu đăng nhập.
 */
export async function GET(req: NextRequest) {
    // Auth check
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("id");

    if (!fileId) {
        return NextResponse.json({ error: "Missing file id" }, { status: 400 });
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
