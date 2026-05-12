import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { canManageCourse, getUserRole } from "@/lib/roles";
import { findOrCreateFolder, uploadPromptFile } from "@/lib/google-drive";
import { env } from "@/lib/env";
import { getActiveCourseIds } from "@/lib/courses";

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".zip", ".ipynb"];
const MAX_FILE_SIZE = 20 * 1024 * 1024;

export async function POST(req: NextRequest) {
    // 1. Auth check
    const session = await auth();
    if (!session?.user?.githubUsername) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(session.user.githubUsername);
    if (role !== "admin" && role !== "teacher") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Parse multipart form
    let formData: FormData;
    try {
        formData = await req.formData();
    } catch (err) {
        console.error("formData parse error:", err);
        return NextResponse.json({ error: "Invalid form data. The file may be too large (max 20MB)." }, { status: 400 });
    }

    const file = formData.get("file") as File | null;
    if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const courseId = formData.get("courseId")?.toString().trim() ?? "";
    if (!courseId || !getActiveCourseIds().includes(courseId)) {
        return NextResponse.json({ error: "Please select a valid course before uploading files." }, { status: 400 });
    }

    const allowed = await canManageCourse(session.user.githubUsername, courseId, role);
    if (!allowed) {
        return NextResponse.json({ error: "You cannot upload prompt files for this course." }, { status: 403 });
    }

    if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "File size exceeds the 20MB limit." }, { status: 400 });
    }

    // 3. Validate file type by extension
    const fileName = file.name;
    const ext = "." + fileName.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
            { error: `Unsupported file type. Allowed types: ${ALLOWED_EXTENSIONS.join(", ")}` },
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
    const rootFolderId = env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
    if (!rootFolderId) {
        return NextResponse.json(
            { error: "Google Drive is not configured. Please set GOOGLE_DRIVE_ROOT_FOLDER_ID in your environment." },
            { status: 503 }
        );
    }

    // Keep prompt uploads course-scoped. Do not accept arbitrary folder IDs from the client.
    let targetFolderId = rootFolderId;
    try {
        const courseFolderId = await findOrCreateFolder(courseId, rootFolderId);
        const promptFolderId = await findOrCreateFolder("de-bai", courseFolderId ?? rootFolderId);
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
            { error: `Upload failed: ${errMsg.substring(0, 200)}` },
            { status: 500 }
        );
    }
}
