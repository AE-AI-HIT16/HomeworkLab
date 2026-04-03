import { google } from "googleapis";
import type { Student, Assignment, Submission, PromptFile, SubmissionFile, SubmissionType, Material, QuizQuestion } from "@/types";

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
            range: "Students!A2:E", // A:username, B:name, C:email, D:active, E:role
        });

        const rows = res.data.values || [];
        return rows.map((row) => ({
            githubUsername: row[0] ?? "",
            name: row[1] ?? "",
            email: row[2] ?? undefined,
            active: String(row[3]).trim().toLowerCase() === "true",
            role: (String(row[4] ?? "").trim().toLowerCase() === "guest" ? "guest" : "student") as "student" | "guest",
        })).filter((s) => s.githubUsername); // Only return rows with usernames
    } catch (e) {
        console.error("Failed to get students from Google Sheets", e);
        return [];
    }
}

/**
 * Update the role of a student in the Google Sheet (column E).
 * @param githubUsername - The student's GitHub username
 * @param newRole - The new role: "student" or "guest"
 */
export async function updateStudentRole(githubUsername: string, newRole: "student" | "guest"): Promise<void> {
    const sheets = getSheetsApi();
    if (!sheets) throw new Error("Google Sheets credentials missing.");

    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: "Students!A:A",
        });
        const rows = res.data.values || [];
        const rowIndex = rows.findIndex(
            (row) => (row[0] ?? "").toLowerCase() === githubUsername.toLowerCase()
        );
        if (rowIndex === -1) throw new Error(`Student ${githubUsername} not found.`);

        // Update the role cell (column E = index 4, row 1-based in A1 notation)
        await sheets.spreadsheets.values.update({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: `Students!E${rowIndex + 1}`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [[newRole]] },
        });
    } catch (e) {
        console.error("Failed to update student role in Google Sheets", e);
        throw e;
    }
}

// ─── Assignments ──────────────────────────────────────────────────────────

export async function getAssignments(): Promise<Assignment[]> {
    const sheets = getSheetsApi();
    if (!sheets) return []; // Fallback

    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: "Assignments!A2:M",
        });

        const rows = res.data.values || [];
        return rows.map((row) => {
            let promptFiles: PromptFile[] = [];
            try {
                if (row[8]) promptFiles = JSON.parse(row[8]);
            } catch {
                console.error(`Failed to parse promptFilesJSON for assignment ${row[0]}`);
            }

            let quizData: QuizQuestion[] | undefined = undefined;
            try {
                if (row[12]) quizData = JSON.parse(row[12]);
            } catch {
                console.error(`Failed to parse quizData for assignment ${row[0]}`);
            }

            const rawType = (row[11] ?? "").trim().toLowerCase();
            const assignmentType: "standard" | "quiz" = rawType === "quiz" ? "quiz" : "standard";

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
                assignmentType,
                quizData,
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
        console.warn("[MOCK MODE] Google Sheets credentials missing — assignment NOT saved:", assignment.id);
        throw new Error("Google Sheets credentials missing. Cannot save assignment.");
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
        assignment.assignmentType || "standard",
        assignment.quizData ? JSON.stringify(assignment.quizData) : "",
    ];

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: "Assignments!A:M",
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [row] },
        });
    } catch (e) {
        console.error("Failed to save assignment to Google Sheets", e);
        throw e;
    }
}

/**
 * Update specific fields of an existing assignment in Google Sheets.
 */
export async function updateAssignmentFields(
    assignmentId: string,
    fields: Partial<Pick<Assignment, "week" | "lesson" | "title" | "description" | "dueAt" | "published">>
): Promise<void> {
    const sheets = getSheetsApi();
    if (!sheets) throw new Error("Google Sheets credentials missing.");

    try {
        // Find the row
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: "Assignments!A:M",
        });
        const rows = res.data.values || [];
        const rowIndex = rows.findIndex((row) => row[0] === assignmentId);
        if (rowIndex === -1) throw new Error(`Assignment ${assignmentId} not found.`);

        // Column mapping: A=id(0), B=week(1), C=lesson(2), D=title(3), E=description(4), F=dueAt(5), G=published(6)
        const updates: Array<{ range: string; value: string | number }> = [];

        if (fields.week !== undefined) {
            updates.push({ range: `Assignments!B${rowIndex + 1}`, value: fields.week });
        }
        if (fields.lesson !== undefined) {
            updates.push({ range: `Assignments!C${rowIndex + 1}`, value: fields.lesson });
        }
        if (fields.title !== undefined) {
            updates.push({ range: `Assignments!D${rowIndex + 1}`, value: fields.title });
        }
        if (fields.description !== undefined) {
            updates.push({ range: `Assignments!E${rowIndex + 1}`, value: fields.description });
        }
        if (fields.dueAt !== undefined) {
            updates.push({ range: `Assignments!F${rowIndex + 1}`, value: fields.dueAt });
        }
        if (fields.published !== undefined) {
            updates.push({ range: `Assignments!G${rowIndex + 1}`, value: fields.published ? "TRUE" : "FALSE" });
        }

        // Also update the updatedAt timestamp (column K = index 10)
        updates.push({ range: `Assignments!K${rowIndex + 1}`, value: new Date().toISOString() });

        if (updates.length > 0) {
            await sheets.spreadsheets.values.batchUpdate({
                spreadsheetId: GOOGLE_SHEET_ID,
                requestBody: {
                    valueInputOption: "RAW",
                    data: updates.map((u) => ({
                        range: u.range,
                        values: [[u.value]],
                    })),
                },
            });
        }
    } catch (e) {
        console.error("Failed to update assignment in Google Sheets", e);
        throw e;
    }
}

// ─── Materials ────────────────────────────────────────────────────────────

export async function getMaterials(): Promise<Material[]> {
    const sheets = getSheetsApi();
    if (!sheets) return []; // Fallback

    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: "Materials!A2:H",
        });

        const rows = res.data.values || [];
        return rows.map((row) => {
            const rawContentMode = (row[6] ?? "").trim().toLowerCase();
            const contentMode: "link" | "file" | "post" = 
                ["link", "file", "post"].includes(rawContentMode) 
                    ? (rawContentMode as "link" | "file" | "post") 
                    : "link";

            return {
                id: row[0] ?? "",
                week: Number(row[1]) || 1,
                title: row[2] ?? "",
                url: row[3] ?? "",
                type: (row[4] as "theory" | "video" | "slides" | "other") || "other",
                published: String(row[5]).trim().toLowerCase() === "true",
                contentMode,
                postContent: row[7] || undefined,
            };
        }).filter((m) => m.id);
    } catch (e: unknown) {
        const error = e as { response?: { status: number }; code?: number };
        if (error?.response?.status === 400 || error?.code === 400) {
            console.warn("Materials sheet not found or invalid range. Returning empty list.");
        } else {
            console.error("Failed to get materials from Google Sheets", e);
        }
        return [];
    }
}

export async function saveMaterial(material: Material): Promise<void> {
    const sheets = getSheetsApi();
    if (!sheets) {
        console.warn("[MOCK MODE] Google Sheets credentials missing — material NOT saved:", material.id);
        throw new Error("Google Sheets credentials missing. Cannot save material.");
    }

    const row = [
        material.id,
        material.week,
        material.title,
        material.url,
        material.type,
        material.published ? "TRUE" : "FALSE",
        material.contentMode || "link",
        material.postContent ?? "",
    ];

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: "Materials!A:H",
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [row] },
        });
    } catch (e) {
        console.error("Failed to save material to Google Sheets", e);
        throw e;
    }
}

export async function deleteAssignment(assignmentId: string): Promise<void> {
    const sheets = getSheetsApi();
    if (!sheets) throw new Error("Google Sheets credentials missing.");

    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: "Assignments!A:A",
        });
        const rows = res.data.values || [];
        const rowIndex = rows.findIndex((row) => row[0] === assignmentId);
        if (rowIndex === -1) throw new Error(`Assignment ${assignmentId} not found.`);

        // Get sheet ID for Assignments tab
        const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId: GOOGLE_SHEET_ID });
        const assignmentsSheet = sheetMeta.data.sheets?.find(s => s.properties?.title === "Assignments");
        if (!assignmentsSheet?.properties?.sheetId && assignmentsSheet?.properties?.sheetId !== 0) throw new Error("Assignments sheet not found.");

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: GOOGLE_SHEET_ID,
            requestBody: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId: assignmentsSheet.properties!.sheetId!,
                            dimension: "ROWS",
                            startIndex: rowIndex,
                            endIndex: rowIndex + 1,
                        },
                    },
                }],
            },
        });
    } catch (e) {
        console.error("Failed to delete assignment from Google Sheets", e);
        throw e;
    }
}

export async function deleteMaterial(materialId: string): Promise<void> {
    const sheets = getSheetsApi();
    if (!sheets) throw new Error("Google Sheets credentials missing.");

    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: "Materials!A:A",
        });
        const rows = res.data.values || [];
        const rowIndex = rows.findIndex((row) => row[0] === materialId);
        if (rowIndex === -1) throw new Error(`Material ${materialId} not found.`);

        const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId: GOOGLE_SHEET_ID });
        const materialsSheet = sheetMeta.data.sheets?.find(s => s.properties?.title === "Materials");
        if (!materialsSheet?.properties?.sheetId && materialsSheet?.properties?.sheetId !== 0) throw new Error("Materials sheet not found.");

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: GOOGLE_SHEET_ID,
            requestBody: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId: materialsSheet.properties!.sheetId!,
                            dimension: "ROWS",
                            startIndex: rowIndex,
                            endIndex: rowIndex + 1,
                        },
                    },
                }],
            },
        });
    } catch (e) {
        console.error("Failed to delete material from Google Sheets", e);
        throw e;
    }
}

export async function updateMaterialTitle(materialId: string, newTitle: string): Promise<void> {
    const sheets = getSheetsApi();
    if (!sheets) throw new Error("Google Sheets credentials missing.");

    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: "Materials!A:C",
        });
        const rows = res.data.values || [];
        const rowIndex = rows.findIndex((row) => row[0] === materialId);
        if (rowIndex === -1) throw new Error(`Material ${materialId} not found.`);

        // Update the title cell (column C = index 2, row is 1-based in A1 notation)
        await sheets.spreadsheets.values.update({
            spreadsheetId: GOOGLE_SHEET_ID,
            range: `Materials!C${rowIndex + 1}`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [[newTitle]] },
        });
    } catch (e) {
        console.error("Failed to update material title in Google Sheets", e);
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
            range: "Submissions!A2:M",
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

            let quizAnswers: number[] | undefined = undefined;
            try {
                if (row[11]) quizAnswers = JSON.parse(row[11]);
            } catch {
                console.error(`Failed to parse quizAnswers for submission ${row[0]}`);
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
                quizAnswers,
                quizScore: row[12] ? Number(row[12]) : undefined,
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
        console.warn("[MOCK MODE] Google Sheets credentials missing — submission NOT saved:", submission.id);
        throw new Error("Google Sheets credentials missing. Cannot save submission.");
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
            submission.quizAnswers ? JSON.stringify(submission.quizAnswers) : "",
            submission.quizScore !== undefined ? submission.quizScore : "",
        ];

        if (rowIndexToUpdate > 0) {
            // Update
            await sheets.spreadsheets.values.update({
                spreadsheetId: GOOGLE_SHEET_ID,
                range: `Submissions!A${rowIndexToUpdate}:M${rowIndexToUpdate}`,
                valueInputOption: "USER_ENTERED",
                requestBody: { values: [row] },
            });
        } else {
            // Append
            await sheets.spreadsheets.values.append({
                spreadsheetId: GOOGLE_SHEET_ID,
                range: "Submissions!A:M",
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
                role: "student",
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
        total: rows.length,
        submitted: submittedCount,
        missing: rows.length - submittedCount,
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
