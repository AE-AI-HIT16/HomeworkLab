// ─── Roles ──────────────────────────────────────────────

/** Roles within the system */
export type UserRole = "admin" | "student" | "unauthorized";

// ─── Users ──────────────────────────────────────────────

/** Students in the whitelist (mock → Google Sheet) */
export interface Student {
    githubUsername: string;
    name: string;
    email?: string;
    active: boolean;
}

/** Admin / Instructor — derived from ADMIN_GITHUB_USERNAMES env var */
export interface Admin {
    githubUsername: string;
    name?: string;
}

// ─── Assignments ────────────────────────────────────────

/** Attached prompt/resource files (stored on Google Drive) */
export interface PromptFile {
    /** Display filename, e.g., "Assignment 1 - Linear Regression.pdf" */
    name: string;
    /** Google Drive file ID */
    driveFileId: string;
    /** MIME type, VD: "application/pdf" */
    mimeType: string;
    /** File size (bytes) */
    sizeBytes?: number;
}

/** Assignment */
export interface Assignment {
    id: string;
    /** Week number (1-based) */
    week: number;
    /** Lesson number within the week (1-based) */
    lesson: number;
    title: string;
    description?: string;
    /** Due date — ISO 8601 string */
    dueAt?: string;
    /** Whether it has been published to students */
    published: boolean;
    /** Google Drive folder ID containing prompt files + submissions */
    driveFolderId?: string;
    /** List of prompt/resource files */
    promptFiles: PromptFile[];
    /** ISO 8601 */
    createdAt: string;
    /** ISO 8601 */
    updatedAt: string;
}

// ─── Submissions ────────────────────────────────────────

/** Submission type */
export type SubmissionType = "file" | "repo_link";

/** Submission file details (when type = "file") */
export interface SubmissionFile {
    /** Filename, e.g., "assignment_1.ipynb" */
    name: string;
    /** Google Drive file ID */
    driveFileId: string;
    mimeType: string;
    sizeBytes?: number;
}

/** Submission */
export interface Submission {
    id: string;
    assignmentId: string;
    githubUsername: string;
    studentName: string;
    /** ISO 8601 */
    submittedAt: string;
    /** Submission type: file upload or GitHub repo link */
    type: SubmissionType;
    /** File details — when type = "file" */
    file?: SubmissionFile;
    /** Link GitHub repo — when type = "repo_link" */
    repoUrl?: string;
    /** Whether it is a late submission (compared to assignment.dueAt) */
    isLate: boolean;
    /** Grade (if assigned) */
    grade?: number;
    /** Instructor feedback */
    feedback?: string;
}

// ─── Legacy aliases (backward compat) ───────────────────

/** @deprecated Use Student instead */
export type AllowedStudent = Student;

// ─── Server Action Types ────────────────────────────────

export interface CreateAssignmentInput {
    week: number;
    lesson: number;
    title: string;
    description?: string;
    dueAt?: string;
    published: boolean;
    promptFileNames?: string[];
}

export interface ActionResult {
    success: boolean;
    error?: string;
    assignment?: Assignment;
}
