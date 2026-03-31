"use server";

import { auth } from "@/auth";
import { getUserRole } from "@/lib/roles";
import { saveAssignment } from "@/lib/google-sheets";
import { createAssignmentFolders } from "@/lib/google-drive";
import { redirect } from "next/navigation";
import type { PromptFile, QuizQuestion } from "@/types";

export interface CreateAssignmentFormState {
    error?: string;
    success?: boolean;
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
    const role = await getUserRole(session.user.githubUsername);
    if (role !== "admin") {
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

    // Validation
    if (!title?.trim()) {
        return { error: "Please enter a title for the assignment." };
    }

    // Parse week/lesson numbers
    const weekMatch = week?.match(/Week (\d+)/);
    const lessonMatch = lesson?.match(/(?:Lecture|Practical) (\d+)/);
    const weekNum = weekMatch ? parseInt(weekMatch[1]) : 1;
    const lessonNum = lessonMatch ? parseInt(lessonMatch[1]) : 1;

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
                return { error: "Quiz phải có ít nhất 1 câu hỏi." };
            }
            for (const q of quizData) {
                if (!q.question?.trim()) {
                    return { error: "Mỗi câu hỏi phải có nội dung." };
                }
                const validOptions = q.options.filter((o: string) => o.trim());
                if (validOptions.length < 2) {
                    return { error: `Câu "${q.question.substring(0, 30)}..." phải có ít nhất 2 lựa chọn.` };
                }
                if (q.correctIndex < 0 || q.correctIndex >= q.options.length) {
                    return { error: `Câu "${q.question.substring(0, 30)}..." chưa chọn đáp án đúng.` };
                }
            }
        } catch {
            return { error: "Dữ liệu quiz không hợp lệ." };
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

    // Combine Date and Time
    let dueAt: string | undefined = undefined;
    if (datePart && timePart) {
        try {
            // Attempt to parse date + time
            // timePart could be "14:30" or "2:30 PM"
            const dateTimeStr = `${datePart} ${timePart}`;
            const parsedDate = new Date(dateTimeStr);
            if (!isNaN(parsedDate.getTime())) {
                dueAt = parsedDate.toISOString();
            } else {
                // If direct parse fails, try more robustly
                dueAt = new Date(datePart).toISOString(); // fallback to just date if time is weird
            }
        } catch {
            dueAt = datePart ? new Date(datePart).toISOString() : undefined;
        }
    } else if (datePart) {
        dueAt = new Date(datePart).toISOString();
    }

    // Generate unique ID
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Create Drive folder structure
    let driveFolderId: string | undefined;
    try {
        const folders = await createAssignmentFolders(weekNum, lessonNum, title.trim());
        driveFolderId = folders.parentFolderId;
    } catch (err) {
        console.warn("Could not create Drive folders:", err);
    }

    try {
        await saveAssignment({
            id,
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
