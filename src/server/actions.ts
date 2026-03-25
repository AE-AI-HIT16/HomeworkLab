"use server";

import type { Assignment, Submission, SubmissionType, SubmissionFile } from "@/types";
import type { CreateAssignmentInput, ActionResult } from "@/types";
import { saveAssignment, saveSubmission, getAssignmentById } from "@/lib/google-sheets";
import { getCurrentUserRole } from "@/lib/roles";
import { createAssignmentFolders, normalizeFileName, uploadSubmissionFile } from "@/lib/google-drive";

/**
 * Generate assignment ID theo format: w{week}-l{lesson}
 */
function generateAssignmentId(week: number, lesson: number): string {
    return `w${week}-l${lesson}`;
}

function guessMimeType(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase();
    const map: Record<string, string> = {
        pdf: "application/pdf",
        ipynb: "application/x-ipynb+json",
        csv: "text/csv",
        py: "text/x-python",
        zip: "application/zip",
        md: "text/markdown",
        txt: "text/plain",
    };
    return map[ext ?? ""] ?? "application/octet-stream";
}

export async function createAssignment(input: CreateAssignmentInput): Promise<ActionResult> {
    // 1. Verify admin role
    const { role } = await getCurrentUserRole();
    if (role !== "admin") {
        return { success: false, error: "Bạn không có quyền tạo bài tập." };
    }

    // 2. Validate input
    if (!input.title.trim()) {
        return { success: false, error: "Tiêu đề không được để trống." };
    }
    if (input.week < 1 || !Number.isInteger(input.week)) {
        return { success: false, error: "Tuần phải là số nguyên ≥ 1." };
    }
    if (input.lesson < 1 || !Number.isInteger(input.lesson)) {
        return { success: false, error: "Bài phải là số nguyên ≥ 1." };
    }

    const now = new Date().toISOString();
    const id = generateAssignmentId(input.week, input.lesson);

    // Xử lý tạo folder trên Google Drive
    let driveFolderId: string | undefined = undefined;
    try {
        const folders = await createAssignmentFolders(input.week, input.lesson, input.title.trim());
        driveFolderId = folders.parentFolderId;
    } catch (e) {
        console.error("Lỗi tạo folder Drive:", e);
        // Không block việc tạo bài tập, có thể tạo folder sau
    }

    const assignment: Assignment = {
        id,
        week: input.week,
        lesson: input.lesson,
        title: input.title.trim(),
        description: input.description?.trim() || undefined,
        dueAt: input.dueAt || undefined,
        published: input.published,
        driveFolderId,
        promptFiles: (input.promptFileNames ?? []).map((name, i) => ({
            name,
            driveFileId: `mock-file-${id}-${i}`, // Admin upload manual for now
            mimeType: guessMimeType(name),
        })),
        createdAt: now,
        updatedAt: now,
    };

    // 3. Save to Google Sheets
    try {
        await saveAssignment(assignment);
        return { success: true, assignment };
    } catch (e) {
        return { success: false, error: "Lỗi lưu vào Google Sheets." };
    }
}

/**
 * Nộp bài tập (hỗ trợ FormData để upload file)
 */
export async function submitAssignment(formData: FormData): Promise<ActionResult> {
    const now = new Date().toISOString();

    // 1. Get current logged in student
    const { role, session } = await getCurrentUserRole();
    if (role !== "student" && role !== "admin") {
        return { success: false, error: "Bạn không có quyền nộp bài." };
    }
    const user = session!.user;

    // 2. Parsed formData
    const assignmentId = String(formData.get("assignmentId"));
    const type = String(formData.get("type")) as SubmissionType;
    const repoUrl = formData.get("repoUrl") ? String(formData.get("repoUrl")) : undefined;
    const file = formData.get("file") as File | null;

    // 3. Get assignment to check deadline
    const assignment = await getAssignmentById(assignmentId);
    if (!assignment) {
        return { success: false, error: "Bài tập không tồn tại." };
    }
    if (!assignment.published && role !== "admin") {
        return { success: false, error: "Bài tập chưa được publish." };
    }
    const isLate = assignment.dueAt ? new Date(now) > new Date(assignment.dueAt) : false;

    // 4. Handle file upload to Google Drive
    let submissionFile: SubmissionFile | undefined;
    if (type === "file") {
        if (!file || file.size === 0) {
            return { success: false, error: "Cần tải lên file để nộp bài." };
        }

        // Server-side security checks
        const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
        if (file.size > MAX_FILE_SIZE) {
            return { success: false, error: "Dung lượng file vượt quá giới hạn 20MB." };
        }

        const allowedExtensions = ["py", "ipynb", "zip", "pdf", "docx", "csv", "txt", "md"];
        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        if (!allowedExtensions.includes(ext)) {
            return { success: false, error: "Định dạng file không được phép trên Server." };
        }

        // Tạo tên file chuẩn: nguyenvana_Tuan1_Bai1.ipynb
        const safeName = normalizeFileName(user.name, assignment.week, assignment.lesson, file.name);

        try {
            // Buffer từ web API File
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Tìm Folder "nop-bai" bằng cách tạo lại từ tên assignment (Drive helper sẽ tự động find by name)
            const folders = await createAssignmentFolders(assignment.week, assignment.lesson, assignment.title);
            const folderId = folders.submissionFolderId;

            if (!folderId) {
                return { success: false, error: "Hệ thống chưa tạo thư mục nhận bài. Báo cho giáo viên." };
            }

            const driveRes = await uploadSubmissionFile(buffer, safeName, file.type || guessMimeType(file.name), folderId);

            if (driveRes) {
                submissionFile = {
                    name: safeName,
                    driveFileId: driveRes.fileId,
                    mimeType: file.type || guessMimeType(file.name),
                    sizeBytes: driveRes.sizeBytes,
                };
            }
        } catch (e) {
            console.error(e);
            return { success: false, error: "Có lỗi khi upload file lên Google Drive." };
        }
    }

    const submission: Submission = {
        id: `sub-${assignmentId}-${user.githubUsername}`,
        assignmentId: assignment.id,
        githubUsername: user.githubUsername,
        studentName: user.name,
        submittedAt: now,
        type,
        isLate,
        file: submissionFile,
        repoUrl: type === "repo_link" ? repoUrl : undefined,
    };

    // 5. Save metadata to Google Sheets
    try {
        await saveSubmission(submission);
        return { success: true };
    } catch (e) {
        return { success: false, error: "Lỗi lưu thông tin nộp bài." };
    }
}
