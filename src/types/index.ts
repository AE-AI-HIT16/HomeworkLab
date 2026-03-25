// ─── Roles ──────────────────────────────────────────────

/** Vai trò trong hệ thống */
export type UserRole = "admin" | "student" | "unauthorized";

// ─── Users ──────────────────────────────────────────────

/** Học viên trong danh sách whitelist (mock → Google Sheet) */
export interface Student {
    githubUsername: string;
    name: string;
    email?: string;
    active: boolean;
}

/** Admin / Giáo viên — lấy từ env var ADMIN_GITHUB_USERNAMES */
export interface Admin {
    githubUsername: string;
    name?: string;
}

// ─── Assignments ────────────────────────────────────────

/** File đề bài đính kèm (lưu trên Google Drive) */
export interface PromptFile {
    /** Tên file hiển thị, VD: "Bài tập 1 - Linear Regression.pdf" */
    name: string;
    /** Google Drive file ID */
    driveFileId: string;
    /** MIME type, VD: "application/pdf" */
    mimeType: string;
    /** Kích thước file (bytes) */
    sizeBytes?: number;
}

/** Bài tập */
export interface Assignment {
    id: string;
    /** Tuần thứ mấy (1-based) */
    week: number;
    /** Bài thứ mấy trong tuần (1-based) */
    lesson: number;
    title: string;
    description?: string;
    /** Hạn nộp — ISO 8601 string */
    dueAt?: string;
    /** Đã publish cho học viên chưa */
    published: boolean;
    /** Google Drive folder ID chứa file đề + bài nộp */
    driveFolderId?: string;
    /** Danh sách file đề bài */
    promptFiles: PromptFile[];
    /** ISO 8601 */
    createdAt: string;
    /** ISO 8601 */
    updatedAt: string;
}

// ─── Submissions ────────────────────────────────────────

/** Loại bài nộp */
export type SubmissionType = "file" | "repo_link";

/** Thông tin file bài nộp (khi type = "file") */
export interface SubmissionFile {
    /** Tên file, VD: "bai_tap_1.ipynb" */
    name: string;
    /** Google Drive file ID */
    driveFileId: string;
    mimeType: string;
    sizeBytes?: number;
}

/** Bài nộp */
export interface Submission {
    id: string;
    assignmentId: string;
    githubUsername: string;
    studentName: string;
    /** ISO 8601 */
    submittedAt: string;
    /** Loại nộp: upload file hoặc link GitHub repo */
    type: SubmissionType;
    /** Thông tin file — khi type = "file" */
    file?: SubmissionFile;
    /** Link GitHub repo — khi type = "repo_link" */
    repoUrl?: string;
    /** Nộp muộn hay không (so sánh với assignment.dueAt) */
    isLate: boolean;
    /** Điểm (nếu đã chấm) */
    grade?: number;
    /** Nhận xét từ giáo viên */
    feedback?: string;
}

// ─── Legacy aliases (backward compat) ───────────────────

/** @deprecated Dùng Student thay thế */
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
