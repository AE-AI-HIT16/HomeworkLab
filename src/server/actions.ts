"use server";

import type { Assignment, Submission, SubmissionType, SubmissionFile } from "@/types";
import type { CreateAssignmentInput, ActionResult } from "@/types";
import { saveAssignment, saveSubmission, getAssignmentById } from "@/lib/google-sheets";
import { getCurrentUserRole } from "@/lib/roles";
import { createAssignmentFolders, normalizeFileName, uploadSubmissionFile } from "@/lib/google-drive";
import { getActiveCourseIds } from "@/lib/courses";

/**
 * Generate assignment ID in format: w{week}-l{lesson}
 */
function generateAssignmentId(courseId: string, week: number, lesson: number): string {
    return `${courseId}-w${week}-l${lesson}`;
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
        return { success: false, error: "You do not have permission to create assignments." };
    }

    // 2. Validate input
    if (!input.courseId || !getActiveCourseIds().includes(input.courseId)) {
        return { success: false, error: "Please select a valid course." };
    }
    if (!input.title.trim()) {
        return { success: false, error: "Title cannot be empty." };
    }
    if (input.week < 1 || !Number.isInteger(input.week)) {
        return { success: false, error: "Week must be an integer ≥ 1." };
    }
    if (input.lesson < 1 || !Number.isInteger(input.lesson)) {
        return { success: false, error: "Lesson must be an integer ≥ 1." };
    }

    const now = new Date().toISOString();
    const id = generateAssignmentId(input.courseId, input.week, input.lesson);

    // Handle Drive folder creation
    let driveFolderId: string | undefined = undefined;
    try {
        const folders = await createAssignmentFolders(input.week, input.lesson, input.title.trim());
        driveFolderId = folders.parentFolderId;
    } catch (e) {
        console.error("Error creating Drive folder:", e);
        // Don't block assignment creation, folder can be created later
    }

    const assignment: Assignment = {
        id,
        courseId: input.courseId,
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
        assignmentType: "standard",
    };

    // 3. Save to Google Sheets
    try {
        await saveAssignment(assignment);
        return { success: true, assignment };
    } catch {
        return { success: false, error: "Error saving to Google Sheets." };
    }
}

/**
 * Submit assignment (supports FormData for file upload)
 */
export async function submitAssignment(formData: FormData): Promise<ActionResult> {
    const now = new Date().toISOString();

    // 1. Get current logged in student
    const { role, session } = await getCurrentUserRole();
    if (role === "guest") {
        return { success: false, error: "Guest accounts cannot submit assignments. Please contact your instructor for access." };
    }
    if (role !== "student" && role !== "admin") {
        return { success: false, error: "You do not have permission to submit assignments." };
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
        return { success: false, error: "Assignment not found." };
    }
    if (!assignment.published && role !== "admin") {
        return { success: false, error: "Assignment is not published yet." };
    }
    const isLate = assignment.dueAt ? new Date(now) > new Date(assignment.dueAt) : false;

    // 4. Handle file upload to Google Drive
    let submissionFile: SubmissionFile | undefined;
    if (type === "file") {
        if (!file || file.size === 0) {
            return { success: false, error: "A file is required for submission." };
        }

        // Server-side security checks
        const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
        if (file.size > MAX_FILE_SIZE) {
            return { success: false, error: "File size exceeds the 20MB limit." };
        }

        const allowedExtensions = ["py", "ipynb", "zip", "pdf", "docx", "csv", "txt", "md"];
        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        if (!allowedExtensions.includes(ext)) {
            return { success: false, error: "File format is not allowed on the server." };
        }

        // Generate standard filename: username_Week1_Lesson1.ipynb
        const safeName = normalizeFileName(user.name, assignment.week, assignment.lesson, file.name);

        try {
            // Buffer from web API File
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Find "submission" folder by regenerating it from assignment name
            const folders = await createAssignmentFolders(assignment.week, assignment.lesson, assignment.title);
            const folderId = folders.submissionFolderId;

            if (!folderId) {
                return { success: false, error: "The submission directory has not been created. Please notify your instructor." };
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
            return { success: false, error: "Error uploading file to Google Drive." };
        }
    }

    const submission: Submission = {
        id: `sub-${assignmentId}-${user.githubUsername}`,
        assignmentId: assignment.id,
        courseId: assignment.courseId,
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
    } catch {
        return { success: false, error: "Error saving submission info." };
    }
}
