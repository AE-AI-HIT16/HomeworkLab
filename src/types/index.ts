// ─── Roles ──────────────────────────────────────────────

/** Roles within the system */
export type UserRole = "admin" | "student" | "guest" | "unauthorized";

// ─── Users ──────────────────────────────────────────────

/** Students in the whitelist (mock → Google Sheet) */
export interface Student {
    githubUsername: string;
    name: string;
    email?: string;
    active: boolean;
    /** Role within the student list: "student" (default) or "guest" */
    role: "student" | "guest";
}

/** Admin / Instructor — derived from ADMIN_GITHUB_USERNAMES env var */
export interface Admin {
    githubUsername: string;
    name?: string;
}

// ─── Assignments ────────────────────────────────────────

/** Assignment type */
export type AssignmentType = "standard" | "quiz";

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

/** A single multiple-choice quiz question */
export interface QuizQuestion {
    id: string;
    /** The question text */
    question: string;
    /** Answer options (typically 4) */
    options: string[];
    /** Index of the correct option (0-based) */
    correctIndex: number;
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
    /** Assignment type — 'standard' (file/link) or 'quiz' */
    assignmentType: AssignmentType;
    /** Quiz questions — only used when assignmentType = 'quiz' */
    quizData?: QuizQuestion[];
}

// ─── Materials ──────────────────────────────────────────

/** Content delivery mode for materials */
export type MaterialContentMode = "link" | "file" | "post";

export interface Material {
    id: string;
    /** Week number (1-based) */
    week: number;
    title: string;
    /** URL for link/file modes, optional for post mode */
    url: string;
    type: "theory" | "video" | "slides" | "other";
    /** Whether it has been published to students */
    published: boolean;
    /** How this material is delivered to students */
    contentMode: MaterialContentMode;
    /** Markdown content — only used when contentMode = "post" */
    postContent?: string;
}

// ─── Submissions ────────────────────────────────────────

/** Submission type */
export type SubmissionType = "file" | "repo_link" | "quiz";

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
    /** Submission type: file upload, GitHub repo link, or quiz */
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
    /** Quiz answers — array of selected option indices (type = "quiz") */
    quizAnswers?: number[];
    /** Auto-graded quiz score 0-100 (type = "quiz") */
    quizScore?: number;
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
