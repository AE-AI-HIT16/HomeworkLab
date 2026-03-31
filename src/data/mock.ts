import type { Assignment, Submission } from "@/types";

/**
 * Mock data bài tập — thay bằng Google Sheet sau.
 *
 * 🔄 Khi tích hợp Google Sheet:
 *    export async function fetchAssignments(): Promise<Assignment[]> {
 *        // Đọc từ sheet "Assignments" → parse rows
 *    }
 */
export const mockAssignments: Assignment[] = [
    {
        id: "w1-l1",
        week: 1,
        lesson: 1,
        title: "Giới thiệu Python & NumPy",
        description:
            "Làm quen với Python cơ bản, cài đặt môi trường, thực hành NumPy array operations.",
        dueAt: "2026-04-01T23:59:00+07:00",
        published: true,
        driveFolderId: "1aBcDeFgHiJkLmNoPqRsT",
        promptFiles: [
            {
                name: "Week1_Lesson1_Python_NumPy.pdf",
                driveFileId: "file-001",
                mimeType: "application/pdf",
                sizeBytes: 245_000,
            },
            {
                name: "numpy_exercises.ipynb",
                driveFileId: "file-002",
                mimeType: "application/x-ipynb+json",
                sizeBytes: 18_400,
            },
        ],
        createdAt: "2026-03-20T10:00:00+07:00",
        updatedAt: "2026-03-20T10:00:00+07:00",
        assignmentType: "standard",
    },
    {
        id: "w1-l2",
        week: 1,
        lesson: 2,
        title: "Pandas & Data Cleaning",
        description: "Đọc dữ liệu CSV, xử lý missing values, EDA cơ bản với Pandas.",
        dueAt: "2026-04-03T23:59:00+07:00",
        published: true,
        driveFolderId: "1uVwXyZaBcDeFgHiJkLmN",
        promptFiles: [
            {
                name: "Week1_Lesson2_Pandas.pdf",
                driveFileId: "file-003",
                mimeType: "application/pdf",
                sizeBytes: 312_000,
            },
        ],
        createdAt: "2026-03-21T10:00:00+07:00",
        updatedAt: "2026-03-21T14:30:00+07:00",
        assignmentType: "standard",
    },
    {
        id: "w2-l1",
        week: 2,
        lesson: 1,
        title: "Linear Regression",
        description:
            "Hiểu lý thuyết Linear Regression, implement from scratch và dùng scikit-learn.",
        dueAt: "2026-04-08T23:59:00+07:00",
        published: true,
        driveFolderId: "1OpQrStUvWxYzAbCdEfGh",
        promptFiles: [
            {
                name: "Week2_Lesson1_LinearRegression.pdf",
                driveFileId: "file-004",
                mimeType: "application/pdf",
                sizeBytes: 420_000,
            },
            {
                name: "housing_data.csv",
                driveFileId: "file-005",
                mimeType: "text/csv",
                sizeBytes: 56_200,
            },
        ],
        createdAt: "2026-03-25T10:00:00+07:00",
        updatedAt: "2026-03-25T10:00:00+07:00",
        assignmentType: "standard",
    },
    {
        id: "w2-l2",
        week: 2,
        lesson: 2,
        title: "Logistic Regression & Classification",
        description: "Phân loại nhị phân, ROC curve, confusion matrix.",
        dueAt: "2026-04-10T23:59:00+07:00",
        published: false, // Chưa publish
        driveFolderId: undefined,
        promptFiles: [],
        createdAt: "2026-03-25T15:00:00+07:00",
        updatedAt: "2026-03-25T15:00:00+07:00",
        assignmentType: "standard",
    },
];

/**
 * Mock data bài nộp.
 */
export const mockSubmissions: Submission[] = [
    {
        id: "sub-001",
        assignmentId: "w1-l1",
        githubUsername: "student1",
        studentName: "Nguyễn Văn A",
        submittedAt: "2026-03-31T20:15:00+07:00",
        type: "file",
        file: {
            name: "bai_tap_1_nguyenvana.ipynb",
            driveFileId: "sub-file-001",
            mimeType: "application/x-ipynb+json",
            sizeBytes: 34_500,
        },
        isLate: false,
    },
    {
        id: "sub-002",
        assignmentId: "w1-l1",
        githubUsername: "student2",
        studentName: "Trần Thị B",
        submittedAt: "2026-04-02T08:30:00+07:00",
        type: "repo_link",
        repoUrl: "https://github.com/student2/ai-homework-w1",
        isLate: true, // Nộp sau deadline
    },
    {
        id: "sub-003",
        assignmentId: "w1-l2",
        githubUsername: "student1",
        studentName: "Nguyễn Văn A",
        submittedAt: "2026-04-03T18:00:00+07:00",
        type: "file",
        file: {
            name: "pandas_nguyenvana.ipynb",
            driveFileId: "sub-file-003",
            mimeType: "application/x-ipynb+json",
            sizeBytes: 42_100,
        },
        isLate: false,
        grade: 9,
        feedback: "Bài làm tốt, trình bày rõ ràng. Cần bổ sung thêm phần xử lý outliers.",
    },
    {
        id: "sub-004",
        assignmentId: "w2-l1",
        githubUsername: "student3",
        studentName: "Lê Văn C",
        submittedAt: "2026-04-07T22:45:00+07:00",
        type: "repo_link",
        repoUrl: "https://github.com/student3/linear-regression-hw",
        isLate: false,
    },
];

// ─── Helper functions ───────────────────────────────────

/** Lấy danh sách bài tập đã publish */
export function getPublishedAssignments(): Assignment[] {
    return mockAssignments.filter((a) => a.published);
}

/** Lấy bài tập theo ID */
export function getAssignmentById(id: string): Assignment | undefined {
    return mockAssignments.find((a) => a.id === id);
}

/** Lấy bài nộp của một student cho một assignment */
export function getSubmission(
    assignmentId: string,
    githubUsername: string
): Submission | undefined {
    return mockSubmissions.find(
        (s) => s.assignmentId === assignmentId && s.githubUsername === githubUsername
    );
}

/** Lấy tất cả bài nộp cho một assignment */
export function getSubmissionsByAssignment(assignmentId: string): Submission[] {
    return mockSubmissions.filter((s) => s.assignmentId === assignmentId);
}

/** Lấy tất cả bài nộp của một student */
export function getSubmissionsByStudent(githubUsername: string): Submission[] {
    return mockSubmissions.filter((s) => s.githubUsername === githubUsername);
}
