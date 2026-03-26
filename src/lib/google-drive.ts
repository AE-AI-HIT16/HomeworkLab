import { google } from "googleapis";
import { Readable } from "stream";
import type { PromptFile } from "@/types";

const SCOPES = ["https://www.googleapis.com/auth/drive"];

import { env } from "@/lib/env";

const GOOGLE_SERVICE_ACCOUNT_EMAIL = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = env.GOOGLE_PRIVATE_KEY;
const GOOGLE_DRIVE_ROOT_FOLDER_ID = env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

let driveApi: ReturnType<typeof google.drive>;

/** Lấy Drive API Client */
export function getDriveApi() {
    if (!driveApi) {
        if (!GOOGLE_PRIVATE_KEY || !GOOGLE_SERVICE_ACCOUNT_EMAIL) {
            console.warn("⚠️ Google Drive credentials missing.");
            return null;
        }

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: GOOGLE_PRIVATE_KEY,
            },
            scopes: SCOPES,
        });

        driveApi = google.drive({ version: "v3", auth });
    }
    return driveApi;
}

/** 
 * Tìm hoặc tạo thư mục.
 * @param name Tên thư mục cần tạo
 * @param parentId ID thư mục cha (mặc định là ROOT folder)
 */
export async function findOrCreateFolder(name: string, parentId?: string): Promise<string | undefined> {
    const drive = getDriveApi();
    if (!drive) return undefined;

    const parent = parentId || GOOGLE_DRIVE_ROOT_FOLDER_ID;
    if (!parent) {
        throw new Error("Missing GOOGLE_DRIVE_ROOT_FOLDER_ID");
    }

    try {
        // Tìm xem folder đã tồn tại chưa
        const query = `name = '${name.replace(/'/g, "\\'")}' and '${parent}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
        const res = await drive.files.list({
            q: query,
            fields: "files(id, name)",
            spaces: "drive",
        });

        if (res.data.files && res.data.files.length > 0) {
            return res.data.files[0].id!;
        }

        // Tạo mới nếu chưa có
        const folderMetadata = {
            name: name,
            mimeType: "application/vnd.google-apps.folder",
            parents: [parent],
        };

        const createRes = await drive.files.create({
            requestBody: folderMetadata,
            fields: "id",
        });

        return createRes.data.id!;
    } catch (error) {
        console.error("Lỗi khi findOrCreateFolder:", error);
        throw error;
    }
}

export interface AssignmentFolders {
    parentFolderId?: string;
    promptFolderId?: string;
    submissionFolderId?: string;
}

/** 
 * Tạo hệ thống folder cho 1 assignment:
 * ROOT > [W{week}-L{lesson}] {title} > [de-bai, nop-bai]
 */
export async function createAssignmentFolders(week: number, lesson: number, title: string): Promise<AssignmentFolders> {
    const drive = getDriveApi();
    if (!drive) return {};

    const parentName = `[W${week}-L${lesson}] ${title}`;

    // Tạo folder cha
    const parentFolderId = await findOrCreateFolder(parentName);
    if (!parentFolderId) return {};

    // Tạo 2 subfolder
    const promptFolderId = await findOrCreateFolder("de-bai", parentFolderId);
    const submissionFolderId = await findOrCreateFolder("nop-bai", parentFolderId);

    return {
        parentFolderId,
        promptFolderId,
        submissionFolderId,
    };
}

/**
 * Xóa dấu tiếng Việt và ký tự đặc biệt để tạo tên file an toàn
 */
export function normalizeFileName(studentName: string, week: number, lesson: number, originalFileName: string): string {
    const noDiacritics = studentName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");

    const safeName = noDiacritics
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ""); // "nguyenvana"

    const ext = originalFileName.includes(".") ? "." + originalFileName.split(".").pop() : "";

    return `${safeName}_Tuan${week}_Bai${lesson}${ext}`;
}

/**
 * Upload file nộp bài lên Drive
 */
export async function uploadSubmissionFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    folderId: string
): Promise<{ fileId: string; sizeBytes: number } | undefined> {
    const drive = getDriveApi();
    if (!drive) {
        console.log("[Mock] Upload file to Drive:", fileName, "-> folder", folderId);
        return { fileId: `mock-file-${Date.now()}`, sizeBytes: fileBuffer.length };
    }

    try {
        const fileMetadata = {
            name: fileName,
            parents: [folderId],
        };

        const media = {
            mimeType,
            // Google APIs Node Client accepts a Readable stream
            body: Readable.from(fileBuffer),
        };

        const res = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: "id",
        });

        return {
            fileId: res.data.id!,
            sizeBytes: fileBuffer.length,
        };
    } catch (error) {
        console.error("Lỗi khi upload submission file:", error);
        throw error;
    }
}

/**
 * Upload file đề bài lên Drive và set quyền public-read.
 * Trả về PromptFile metadata để lưu vào Google Sheets.
 */
export async function uploadPromptFile(
    fileBuffer: Buffer,
    originalFileName: string,
    mimeType: string,
    folderId: string
): Promise<PromptFile> {
    const drive = getDriveApi();

    if (!drive) {
        // Mock mode khi không có credentials
        console.log("[Mock] Upload prompt file:", originalFileName, "-> folder", folderId);
        return {
            name: originalFileName,
            driveFileId: `mock-prompt-${Date.now()}`,
            mimeType,
            sizeBytes: fileBuffer.length,
        };
    }

    try {
        // 1. Upload file
        const createRes = await drive.files.create({
            requestBody: {
                name: originalFileName,
                parents: [folderId],
            },
            media: {
                mimeType,
                body: Readable.from(fileBuffer),
            },
            fields: "id,name,size",
        });

        const fileId = createRes.data.id!;

        // 2. Set permission: anyone with link can view
        await drive.permissions.create({
            fileId,
            requestBody: {
                role: "reader",
                type: "anyone",
            },
        });

        return {
            name: originalFileName,
            driveFileId: fileId,
            mimeType,
            sizeBytes: fileBuffer.length,
        };
    } catch (error) {
        console.error("Lỗi khi upload prompt file:", error);
        throw error;
    }
}
