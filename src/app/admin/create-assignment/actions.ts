"use server";

import { auth } from "@/auth";
import { getUserRole } from "@/lib/roles";
import { saveAssignment } from "@/lib/google-sheets";
import { createAssignmentFolders } from "@/lib/google-drive";
import { redirect } from "next/navigation";
import type { PromptFile } from "@/types";

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
        return { error: "Bạn cần đăng nhập để thực hiện thao tác này." };
    }

    // Role check — only admins can create assignments
    const role = await getUserRole(session.user.githubUsername);
    if (role !== "admin") {
        return { error: "Bạn không có quyền tạo bài tập." };
    }

    // Extract form data
    const title = formData.get("title") as string;
    const week = formData.get("week") as string;
    const lesson = formData.get("lesson") as string;
    const description = formData.get("description") as string;
    const dueDate = formData.get("dueDate") as string;
    const points = formData.get("points") as string;
    const fileUpload = formData.get("fileUpload") === "on";
    const githubLink = formData.get("githubLink") === "on";
    const promptFilesJson = formData.get("promptFilesJson") as string | null;

    // Validation
    if (!title?.trim()) {
        return { error: "Vui lòng nhập tiêu đề bài tập." };
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
            dueAt: dueDate || undefined,
            published: true,
            driveFolderId,
            promptFiles,
            createdAt: now,
            updatedAt: now,
        });

        redirect("/dashboard");
    } catch (error) {
        // redirect() throws a special error, so we need to re-throw it
        if (error instanceof Error && error.message === "NEXT_REDIRECT") {
            throw error;
        }
        console.error("Failed to create assignment:", error);
        return { error: "Không thể tạo bài tập. Vui lòng thử lại." };
    }
}
