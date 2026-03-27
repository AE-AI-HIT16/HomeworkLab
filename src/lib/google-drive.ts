import { google } from "googleapis";
import { Readable } from "stream";
import type { PromptFile } from "@/types";

const SCOPES = ["https://www.googleapis.com/auth/drive"];

import { env } from "@/lib/env";

const GOOGLE_SERVICE_ACCOUNT_EMAIL = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = env.GOOGLE_PRIVATE_KEY;
const GOOGLE_DRIVE_ROOT_FOLDER_ID = env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REFRESH_TOKEN = env.GOOGLE_REFRESH_TOKEN;

let driveApi: ReturnType<typeof google.drive>;

/** Get Drive API Client */
export function getDriveApi() {
    if (!driveApi) {
        // 1. Try OAuth2 first (Personal Gmail with 30TB Storage)
        if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REFRESH_TOKEN) {
            const oauth2Client = new google.auth.OAuth2(
                GOOGLE_CLIENT_ID,
                GOOGLE_CLIENT_SECRET
            );
            oauth2Client.setCredentials({
                refresh_token: GOOGLE_REFRESH_TOKEN,
            });

            driveApi = google.drive({ version: "v3", auth: oauth2Client });
            return driveApi;
        }

        // 2. Fallback to Service Account
        if (!GOOGLE_PRIVATE_KEY || !GOOGLE_SERVICE_ACCOUNT_EMAIL) {
            console.warn("⚠️ Google Drive credentials missing (neither OAuth2 nor Service Account).");
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
 * Find or create a folder.
 * @param name Folder name to create
 * @param parentId Parent folder ID (defaults to ROOT folder)
 */
export async function findOrCreateFolder(name: string, parentId?: string): Promise<string | undefined> {
    const drive = getDriveApi();
    if (!drive) return undefined;

    const parent = parentId || GOOGLE_DRIVE_ROOT_FOLDER_ID;
    if (!parent) {
        throw new Error("Missing GOOGLE_DRIVE_ROOT_FOLDER_ID");
    }

    try {
        // Check if the folder already exists
        const query = `name = '${name.replace(/'/g, "\\'")}' and '${parent}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
        const res = await drive.files.list({
            q: query,
            fields: "files(id, name)",
            spaces: "drive",
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
        });

        if (res.data.files && res.data.files.length > 0) {
            return res.data.files[0].id!;
        }

        // Create new if it doesn't exist
        const folderMetadata = {
            name: name,
            mimeType: "application/vnd.google-apps.folder",
            parents: [parent],
        };

        const createRes = await drive.files.create({
            requestBody: folderMetadata,
            fields: "id",
            supportsAllDrives: true,
        });

        return createRes.data.id!;
    } catch (error) {
        console.error("Error in findOrCreateFolder:", error);
        throw error;
    }
}

export interface AssignmentFolders {
    parentFolderId?: string;
    promptFolderId?: string;
    submissionFolderId?: string;
}

/** 
 * Create folder structure for an assignment:
 * ROOT > [W{week}-L{lesson}] {title} > [course-materials, student-submissions]
 */
export async function createAssignmentFolders(week: number, lesson: number, title: string): Promise<AssignmentFolders> {
    const drive = getDriveApi();
    if (!drive) return {};

    const parentName = `[W${week}-L${lesson}] ${title}`;

    // Create parent folder
    const parentFolderId = await findOrCreateFolder(parentName);
    if (!parentFolderId) return {};

    // Create 2 subfolders
    const promptFolderId = await findOrCreateFolder("course-materials", parentFolderId);
    const submissionFolderId = await findOrCreateFolder("student-submissions", parentFolderId);

    return {
        parentFolderId,
        promptFolderId,
        submissionFolderId,
    };
}

/**
 * Remove Vietnamese diacritics and special characters to create a safe filename
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

    return `${safeName}_Week${week}_Lesson${lesson}${ext}`;
}

/**
 * Upload student submission file to Drive
 */
export async function uploadSubmissionFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    folderId: string
): Promise<{ fileId: string; sizeBytes: number } | undefined> {
    const drive = getDriveApi();
    if (!drive) {
        console.warn("[MOCK MODE] Google Drive credentials missing — file NOT uploaded:", fileName);
        throw new Error("Google Drive credentials missing. Cannot upload submission file.");
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
            supportsAllDrives: true,
        });

        return {
            fileId: res.data.id!,
            sizeBytes: fileBuffer.length,
        };
    } catch (error) {
        console.error("Error uploading submission file:", error);
        throw error;
    }
}

/**
 * Upload resource file to Drive and set permission to public-read.
 * Returns PromptFile metadata for Google Sheets storage.
 */
export async function uploadPromptFile(
    fileBuffer: Buffer,
    originalFileName: string,
    mimeType: string,
    folderId: string
): Promise<PromptFile> {
    const drive = getDriveApi();

    if (!drive) {
        console.warn("[MOCK MODE] Google Drive credentials missing — prompt file NOT uploaded:", originalFileName);
        throw new Error("Google Drive credentials missing. Cannot upload prompt file.");
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
            supportsAllDrives: true,
        });

        const fileId = createRes.data.id!;

        // 2. Set permission: anyone with link can view
        await drive.permissions.create({
            fileId,
            requestBody: {
                role: "reader",
                type: "anyone",
            },
            supportsAllDrives: true,
        });

        return {
            name: originalFileName,
            driveFileId: fileId,
            mimeType,
            sizeBytes: fileBuffer.length,
        };
    } catch (error) {
        console.error("Error uploading prompt file:", error);
        throw error;
    }
}
