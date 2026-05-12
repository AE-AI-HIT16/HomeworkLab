"use server";

import { auth } from "@/auth";
import { canManageCourse, getCurrentUserRoleWithContext } from "@/lib/roles";
import { saveAssignment } from "@/lib/google-sheets";
import { createAssignmentFolders } from "@/lib/google-drive";
import { redirect } from "next/navigation";
import type { PromptFile, QuizQuestion } from "@/types";
import { getActiveCourseIds } from "@/lib/courses";

export interface CreateAssignmentFormState {
    error?: string;
    success?: boolean;
}

function parseVietnamDueAt(datePart: string, timePart: string): string | undefined {
    if (!datePart) return undefined;
    if (!timePart) {
        throw new Error("Please enter a due time.");
    }

    const dateMatch = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!dateMatch) {
        throw new Error("Invalid due date.");
    }

    const timeMatch = timePart.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
    if (!timeMatch) {
        throw new Error("Invalid due time. Use a format like 14:00 or 11:59 PM.");
    }

    const year = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    const day = Number(dateMatch[3]);
    let hour = Number(timeMatch[1]);
    const minute = timeMatch[2] ? Number(timeMatch[2]) : 0;
    const meridiem = timeMatch[3]?.toUpperCase();

    if (meridiem) {
        if (hour < 1 || hour > 12) {
            throw new Error("Invalid due time. Use a 12-hour time between 1 and 12.");
        }
        if (meridiem === "AM") hour = hour === 12 ? 0 : hour;
        if (meridiem === "PM") hour = hour === 12 ? 12 : hour + 12;
    } else if (hour < 0 || hour > 23) {
        throw new Error("Invalid due time. Use a 24-hour time between 00:00 and 23:59.");
    }

    if (minute < 0 || minute > 59) {
        throw new Error("Invalid due time. Minutes must be between 00 and 59.");
    }

    const localDateCheck = new Date(Date.UTC(year, month - 1, day));
    if (
        localDateCheck.getUTCFullYear() !== year ||
        localDateCheck.getUTCMonth() !== month - 1 ||
        localDateCheck.getUTCDate() !== day
    ) {
        throw new Error("Invalid due date.");
    }

    // Vietnam is UTC+07:00 and has no daylight saving time.
    return new Date(Date.UTC(year, month - 1, day, hour - 7, minute)).toISOString();
}

function parsePositiveNumberFromLabel(value: string, fieldName: string): number {
    const match = value?.match(/(\d+)/);
    if (!match) {
        throw new Error(`Please enter a valid ${fieldName}.`);
    }

    const parsed = Number(match[1]);
    if (!Number.isInteger(parsed) || parsed < 1) {
        throw new Error(`${fieldName} must be a positive number.`);
    }

    return parsed;
}

export async function createAssignmentAction(
    _prevState: CreateAssignmentFormState,
    formData: FormData
): Promise<CreateAssignmentFormState> {
    // Auth check
    const session = await auth();
    if (!session?.user?.githubUsername) {
        return { error: "You must be logged in to perform this action." };
    }

    // Role check — only admins can create assignments
    const { role } = await getCurrentUserRoleWithContext({ session });
    if (role !== "admin" && role !== "teacher") {
        return { error: "You do not have permission to create assignments." };
    }

    // Extract form data
    const title = formData.get("title") as string;
    const week = formData.get("week") as string;
    const lesson = formData.get("lesson") as string;
    const description = formData.get("description") as string;
    const datePart = formData.get("dueDatePart") as string;
    const timePart = formData.get("dueTimePart") as string;
    const promptFilesJson = formData.get("promptFilesJson") as string | null;
    const driveFolderLink = formData.get("driveFolderLink") as string;
    const assignmentType = (formData.get("assignmentType") as string) || "standard";
    const quizDataJson = formData.get("quizDataJson") as string | null;
    const courseId = formData.get("courseId") as string;

    // Validation
    if (!courseId || !getActiveCourseIds().includes(courseId)) {
        return { error: "Please select a valid course for this assignment." };
    }
    const allowed = await canManageCourse(session.user.githubUsername, courseId, role);
    if (!allowed) {
        return { error: "You can only create assignments for courses you are assigned to teach." };
    }
    if (!title?.trim()) {
        return { error: "Please enter a title for the assignment." };
    }

    // Parse week/lesson numbers — extract first number from any format
    // Supports: "3", "Week 3", "3 - Machine Learning", "3_Decision Tree", etc.
    let weekNum: number;
    let lessonNum: number;
    try {
        weekNum = parsePositiveNumberFromLabel(week, "week");
        lessonNum = parsePositiveNumberFromLabel(lesson, "lesson");
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Invalid week or lesson." };
    }

    // Parse prompt files
    let promptFiles: PromptFile[] = [];
    if (promptFilesJson) {
        try {
            promptFiles = JSON.parse(promptFilesJson);
        } catch {
            console.warn("Could not parse promptFilesJson");
        }
    }

    // Parse quiz data
    let quizData: QuizQuestion[] | undefined;
    if (assignmentType === "quiz" && quizDataJson) {
        try {
            quizData = JSON.parse(quizDataJson);
            if (!quizData || quizData.length === 0) {
                return { error: "Quiz must include at least one question." };
            }
            for (const q of quizData) {
                if (!q.question?.trim()) {
                    return { error: "Each question must include text." };
                }
                const validOptions = q.options.filter((o: string) => o.trim());
                if (validOptions.length < 2) {
                    return { error: `Question "${q.question.substring(0, 30)}..." must have at least 2 options.` };
                }
                if (q.correctIndex < 0 || q.correctIndex >= q.options.length || !q.options[q.correctIndex]?.trim()) {
                    return { error: `Question "${q.question.substring(0, 30)}..." has no correct answer selected.` };
                }
            }
        } catch {
            return { error: "Invalid quiz data." };
        }
    }

    // Add manual link as a special PromptFile
    if (driveFolderLink?.trim()) {
        const url = driveFolderLink.trim();
        let externalId = url;

        // If it's a Drive URL, try to extract the ID for cleaner rendering, otherwise keep full URL
        if (url.includes("drive.google.com")) {
            const urlIdMatch = url.match(/[-\w]{25,}/);
            if (urlIdMatch) {
                externalId = urlIdMatch[0];
            }
        }

        promptFiles.push({
            name: "🔗 Assignment Drive Link",
            driveFileId: externalId,
            mimeType: "text/uri-list",
            sizeBytes: 0,
        });
    }

    let dueAt: string | undefined = undefined;
    try {
        dueAt = parseVietnamDueAt(datePart, timePart);
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Invalid due date or time." };
    }

    // Generate unique ID
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Create Drive folder structure
    let driveFolderId: string | undefined;
    try {
        const folders = await createAssignmentFolders(weekNum, lessonNum, title.trim(), {
            courseId,
            assignmentId: id,
        });
        driveFolderId = folders.parentFolderId;
    } catch (err) {
        console.warn("Could not create Drive folders:", err);
    }

    console.log(`[CreateAssignment] Creating ${assignmentType} assignment: "${title}"`);
    if (assignmentType === "quiz") {
        console.log(`[CreateAssignment] Quiz questions count: ${quizData?.length || 0}`);
    }

    try {
        await saveAssignment({
            id,
            courseId,
            week: weekNum,
            lesson: lessonNum,
            title: title.trim(),
            description: description?.trim() || undefined,
            dueAt,
            published: true,
            driveFolderId,
            promptFiles,
            createdAt: now,
            updatedAt: now,
            assignmentType: assignmentType === "quiz" ? "quiz" : "standard",
            quizData,
        });

        redirect("/dashboard");
    } catch (error) {
        // redirect() throws a special error, so we need to re-throw it
        if (error instanceof Error && error.message === "NEXT_REDIRECT") {
            throw error;
        }
        console.error("Failed to create assignment:", error);
        return { error: "Could not create assignment. Please try again." };
    }
}
