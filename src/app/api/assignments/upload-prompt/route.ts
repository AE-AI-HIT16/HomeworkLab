import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserRole } from "@/lib/roles";
import { findOrCreateFolder, uploadPromptFile } from "@/lib/google-drive";
import { env } from "@/lib/env";

export const config = {
    api: {
        bodyParser: false,
    },
};

// Allow up to 20MB
export const maxDuration = 30;

const ALLOWED_TYPES: Record<string, string> = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/zip": ".zip",
    "application/x-zip-compressed": ".zip",
    "application/octet-stream": "", // ipynb may come as this
};

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
    } catch {
        return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
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
            { error: `File type not allowed. Supported: ${ALLOWED_EXTENSIONS.join(", ")}` },
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
    // Use assignmentFolderId if provided (when assignment already exists), otherwise use a temp staging folder
    const folderId = (formData.get("folderId") as string) || env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

    if (!folderId) {
        return NextResponse.json({ error: "Drive not configured" }, { status: 503 });
    }

    // Ensure de-bai folder exists under the given folder
    let targetFolderId = folderId;
    try {
        const promptFolderId = await findOrCreateFolder("de-bai", folderId);
        if (promptFolderId) targetFolderId = promptFolderId;
    } catch {
        // If folder creation fails, upload to root folder directly
        console.warn("Could not create de-bai subfolder, uploading to root");
    }

    // 6. Upload to Drive
    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const promptFile = await uploadPromptFile(buffer, fileName, mimeType, targetFolderId);

        return NextResponse.json(promptFile);
    } catch (error) {
        console.error("Upload prompt file failed:", error);
        return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
    }
}
