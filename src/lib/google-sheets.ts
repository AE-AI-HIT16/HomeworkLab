import { google } from "googleapis";
import type { Student, Assignment, Submission, PromptFile, SubmissionFile, SubmissionType } from "@/types";

// Auth scopes for Google Sheets
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

// We expect these in the environment
import { env } from "@/lib/env";
const GOOGLE_SHEET_ID = env.GOOGLE_SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = env.GOOGLE_PRIVATE_KEY;

let sheetsApi: ReturnType<typeof google.sheets>;

function getSheetsApi() {
    if (!sheetsApi) {
        if (!GOOGLE_PRIVATE_KEY || !GOOGLE_SERVICE_ACCOUNT_EMAIL) {
            console.warn("⚠️ Google Sheets credentials missing. Using empty mock responses.");
            return null;
        }

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: GOOGLE_PRIVATE_KEY,
            },
            scopes: SCOPES,
        });

        sheetsApi = google.sheets({ version: "v4", auth });
    }
    return sheetsApi;
}

// ─── Students ─────────────────────────────────────────────────────────────

export async function getStudents(): Promise<Student[]> {
    const sheets = getSheetsApi();
    if (!sheets) return []; // Fallback

    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: "Students!A2:D", // Assuming A1:D1 are headers
        });

        const rows = res.data.values || [];
        return rows.map((row) => ({
            githubUsername: row[0] ?? "",
            name: row[1] ?? "",
            email: row[2] ?? undefined,
            active: String(row[3]).trim().toLowerCase() === "true",
        })).filter((s) => s.githubUsername); // Only return rows with usernames
    } catch (e) {
        console.error("Failed to get students from Google Sheets", e);
        return [];
    }
}

// ─── Assignments ──────────────────────────────────────────────────────────

export async function getAssignments(): Promise<Assignment[]> {
    const sheets = getSheetsApi();
    if (!sheets) return []; // Fallback

    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: "Assignments!A2:K",
        });

        const rows = res.data.values || [];
        return rows.map((row) => {
            let promptFiles: PromptFile[] = [];
            try {
                if (row[8]) promptFiles = JSON.parse(row[8]);
            } catch {
                console.error(`Failed to parse promptFilesJSON for assignment ${row[0]}`);
            }

            return {
                id: row[0] ?? "",
                week: Number(row[1]) || 1,
                lesson: Number(row[2]) || 1,
                title: row[3] ?? "",
                description: row[4] || undefined,
                dueAt: row[5] || undefined,
                published: String(row[6]).trim().toLowerCase() === "true",
                driveFolderId: row[7] || undefined,
                promptFiles,
                createdAt: row[9] ?? new Date().toISOString(),
                updatedAt: row[10] ?? new Date().toISOString(),
            };
        }).filter((a) => a.id);
    } catch (e) {
        console.error("Failed to get assignments from Google Sheets", e);
        return [];
    }
}

export async function getAssignmentById(id: string): Promise<Assignment | undefined> {
    const assignments = await getAssignments();
    return assignments.find((a) => a.id === id);
}

export async function saveAssignment(assignment: Assignment): Promise<void> {
    const sheets = getSheetsApi();
    if (!sheets) {
        console.log("[Mock Save Assignment]:", assignment);
        return;
    }

    const row = [
        assignment.id,
        assignment.week,
        assignment.lesson,
        assignment.title,
        assignment.description ?? "",
        assignment.dueAt ?? "",
        assignment.published ? "TRUE" : "FALSE",
        assignment.driveFolderId ?? "",
        JSON.stringify(assignment.promptFiles),
        assignment.createdAt,
        assignment.updatedAt,
    ];

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: "Assignments!A:K",
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [row] },
        });
    } catch (e) {
        console.error("Failed to save assignment to Google Sheets", e);
        throw e;
    }
}

// ─── Submissions ──────────────────────────────────────────────────────────

export async function getSubmissions(): Promise<Submission[]> {
    const sheets = getSheetsApi();
    if (!sheets) return []; // Fallback

    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: "Submissions!A2:K",
        });

        const rows = res.data.values || [];
        return rows.map((row) => {
            let file: SubmissionFile | undefined = undefined;
            if (row[7]) {
                try {
                    file = JSON.parse(row[7]);
                } catch {
                    console.error(`Failed to parse fileJSON for submission ${row[0]}`);
                }
            }

            return {
                id: row[0] ?? "",
                assignmentId: row[1] ?? "",
                githubUsername: row[2] ?? "",
                studentName: row[3] ?? "",
                submittedAt: row[4] ?? new Date().toISOString(),
                type: (row[5] as SubmissionType) || "file",
                isLate: String(row[6]).trim().toLowerCase() === "true",
                file,
                repoUrl: row[8] || undefined,
                grade: row[9] ? Number(row[9]) : undefined,
                feedback: row[10] || undefined,
            };
        }).filter((s) => s.id);
    } catch (e) {
        console.error("Failed to get submissions from Google Sheets", e);
        return [];
    }
}

export async function getSubmissionsByAssignment(assignmentId: string): Promise<Submission[]> {
    const submissions = await getSubmissions();
    return submissions.filter((s) => s.assignmentId === assignmentId);
}

export async function getSubmissionsByStudent(githubUsername: string): Promise<Submission[]> {
    const submissions = await getSubmissions();
    return submissions.filter((s) => s.githubUsername.toLowerCase() === githubUsername.toLowerCase());
}

export async function getSubmission(assignmentId: string, githubUsername: string): Promise<Submission | undefined> {
    const submissions = await getSubmissions();
    return submissions.find(
        (s) => s.assignmentId === assignmentId && s.githubUsername.toLowerCase() === githubUsername.toLowerCase()
    );
}

export async function saveSubmission(submission: Submission): Promise<void> {
    const sheets = getSheetsApi();
    if (!sheets) {
        console.log("[Mock Save Submission]:", submission);
        return;
    }

    try {
        // Find existing submission to update or append new
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: "Submissions!A:C", // We only need IDs to track
        });

        const rows = res.data.values || [];
        // Row index is index + 1 (A1 notation is 1-based)
        let rowIndexToUpdate = -1;

        for (let i = 0; i < rows.length; i++) {
            if (rows[i][1] === submission.assignmentId && rows[i][2].toLowerCase() === submission.githubUsername.toLowerCase()) {
                rowIndexToUpdate = i + 1; // 1-based index
                break;
            }
        }

        const row = [
            submission.id,
            submission.assignmentId,
            submission.githubUsername,
            submission.studentName,
            submission.submittedAt,
            submission.type,
            submission.isLate ? "TRUE" : "FALSE",
            submission.file ? JSON.stringify(submission.file) : "",
            submission.repoUrl ?? "",
            submission.grade !== undefined ? submission.grade : "",
            submission.feedback ?? "",
        ];

        if (rowIndexToUpdate > 0) {
            // Update
            await sheets.spreadsheets.values.update({
                spreadsheetId: GOOGLE_SHEET_ID,
                range: `Submissions!A${rowIndexToUpdate}:K${rowIndexToUpdate}`,
                valueInputOption: "USER_ENTERED",
                requestBody: { values: [row] },
            });
        } else {
            // Append
            await sheets.spreadsheets.values.append({
                spreadsheetId: GOOGLE_SHEET_ID,
                range: "Submissions!A:K",
                valueInputOption: "USER_ENTERED",
                requestBody: { values: [row] },
            });
        }
    } catch (e) {
        console.error("Failed to save submission to Google Sheets", e);
        throw e;
    }
}

// ─── Aggregation / Joins ──────────────────────────────────────────────────

export interface StudentSubmissionRow {
    student: Student;
    submission?: Submission;
}

export interface AssignmentDetailData {
    assignment: Assignment;
    activeStudents: Student[];
    submissions: Submission[];
    rows: StudentSubmissionRow[];
    stats: {
        total: number;
        submitted: number;
        missing: number;
        late: number;
        files: number;
        repos: number;
    };
}

/**
 * Get assignment details along with associated students and submissions.
 */
export async function getAssignmentDetailsWithSubmissions(assignmentId: string): Promise<AssignmentDetailData | null> {
    const assignment = await getAssignmentById(assignmentId);
    if (!assignment) return null;

    const [allStudents, allSubmissions] = await Promise.all([
        getStudents(),
        getSubmissionsByAssignment(assignmentId),
    ]);

    const activeStudents = allStudents.filter((s) => s.active);

    // Map submissions by github username
    const subMap = new Map<string, Submission>();
    for (const sub of allSubmissions) {
        subMap.set(sub.githubUsername.toLowerCase(), sub);
    }

    // Build rows: Start with active students
    const rows: StudentSubmissionRow[] = activeStudents.map((student) => ({
        student,
        submission: subMap.get(student.githubUsername.toLowerCase()),
    }));

    // Add extra rows for submissions from users not in the active student list
    const studentUsernames = new Set(activeStudents.map(s => s.githubUsername.toLowerCase()));
    const extraSubmissions = allSubmissions.filter(s => !studentUsernames.has(s.githubUsername.toLowerCase()));
    
    for (const sub of extraSubmissions) {
        rows.push({
            student: {
                githubUsername: sub.githubUsername,
                name: sub.studentName || sub.githubUsername,
                active: false,
            },
            submission: sub
        });
    }

    // Sort: submitted first (late last among submitted), then missing
    rows.sort((a, b) => {
        if (a.submission && b.submission) {
            if (a.submission.isLate && !b.submission.isLate) return 1;
            if (!a.submission.isLate && b.submission.isLate) return -1;
            return new Date(b.submission.submittedAt).getTime() - new Date(a.submission.submittedAt).getTime();
        }
        if (a.submission) return -1;
        if (b.submission) return 1;
        return a.student.name.localeCompare(b.student.name);
    });

    const submittedCount = allSubmissions.length;
    const stats = {
        total: Math.max(activeStudents.length, submittedCount),
        submitted: submittedCount,
        missing: Math.max(0, activeStudents.length - submittedCount),
        late: allSubmissions.filter((s) => s.isLate).length,
        files: allSubmissions.filter((s) => s.type === "file").length,
        repos: allSubmissions.filter((s) => s.type === "repo_link").length,
    };

    return {
        assignment,
        activeStudents,
        submissions: allSubmissions,
        rows,
        stats,
    };
}
