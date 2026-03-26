import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserRole } from "@/lib/roles";
import { findOrCreateFolder, uploadPromptFile } from "@/lib/google-drive";
import { env } from "@/lib/env";

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".zip", ".ipynb"];

export async function POST(req: NextRequest) {
    // 1. Auth check
    const session = await auth();
    if (!session?.user?.githubUsername) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(session.user.githubUsername);
    if (role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Parse multipart form
    let formData: FormData;
    try {
        formData = await req.formData();
    } catch (err) {
        console.error("formData parse error:", err);
        return NextResponse.json({ error: "Invalid form data. File có thể quá lớn (tối đa 20MB)." }, { status: 400 });
    }

    const file = formData.get("file") as File | null;
    if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 3. Validate file type by extension
    const fileName = file.name;
    const ext = "." + fileName.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
            { error: `Loại file không hỗ trợ. Chỉ nhận: ${ALLOWED_EXTENSIONS.join(", ")}` },
            { status: 400 }
        );
    }

    // 4. Determine MIME type
    let mimeType = file.type;
    if (!mimeType || mimeType === "application/octet-stream") {
        if (ext === ".ipynb") mimeType = "application/x-ipynb+json";
        else if (ext === ".pdf") mimeType = "application/pdf";
        else if (ext === ".docx") mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        else if (ext === ".zip") mimeType = "application/zip";
    }

    // 5. Get or create upload folder
    const folderId = (formData.get("folderId") as string) || env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

    if (!folderId) {
        return NextResponse.json(
            { error: "Google Drive chưa được cấu hình. Vui lòng set GOOGLE_DRIVE_ROOT_FOLDER_ID trong env." },
            { status: 503 }
        );
    }

    // Ensure de-bai folder exists under the given folder
    let targetFolderId = folderId;
    try {
        const promptFolderId = await findOrCreateFolder("de-bai", folderId);
        if (promptFolderId) targetFolderId = promptFolderId;
    } catch (err) {
        console.warn("Could not create de-bai subfolder, uploading to root:", err);
    }

    // 6. Upload to Drive
    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const promptFile = await uploadPromptFile(buffer, fileName, mimeType, targetFolderId);

        return NextResponse.json(promptFile);
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error("Upload prompt file failed:", errMsg);
        return NextResponse.json(
            { error: `Upload thất bại: ${errMsg.substring(0, 200)}` },
            { status: 500 }
        );
    }
}
