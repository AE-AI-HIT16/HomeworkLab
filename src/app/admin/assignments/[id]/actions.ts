"use server";

import { saveSubmission, getSubmission, updateAssignmentFields } from "@/lib/google-sheets";
import { getCurrentUserRole } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import type { QuizQuestion } from "@/types";

export async function gradeSubmissionAction(
    assignmentId: string,
    githubUsername: string,
    grade: number,
    feedback: string
) {
    try {
        const existing = await getSubmission(assignmentId, githubUsername);
        if (!existing) {
            throw new Error("Submission not found");
        }

        const updatedSubmission = {
            ...existing,
            grade,
            feedback,
        };

        await saveSubmission(updatedSubmission);

        revalidatePath(`/admin/assignments/${assignmentId}`);
        revalidatePath("/admin");
        
        return { success: true };
    } catch (error) {
        console.error("Error grading submission:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function updateAssignmentAction(
    assignmentId: string,
    fields: { week?: number; lesson?: number; title?: string; description?: string; quizData?: QuizQuestion[]; driveLink?: string }
) {
    const { role } = await getCurrentUserRole();
    if (role !== "admin") {
        return { success: false, error: "Permission denied." };
    }

    try {
        // Build the update payload
        const updateFields: Record<string, unknown> = { ...fields };

        // Convert driveLink to promptFiles format
        if (fields.driveLink !== undefined) {
            delete updateFields.driveLink;
            const url = fields.driveLink.trim();
            if (url) {
                updateFields.promptFiles = [{
                    name: "🔗 Assignment Drive Link",
                    driveFileId: url,
                    mimeType: "text/uri-list",
                    sizeBytes: 0,
                }];
            } else {
                updateFields.promptFiles = [];
            }
        }

        await updateAssignmentFields(assignmentId, updateFields as Parameters<typeof updateAssignmentFields>[1]);
        revalidatePath(`/admin/assignments/${assignmentId}`);
        revalidatePath("/admin");
        revalidatePath("/dashboard");
        revalidatePath("/courses");
        return { success: true };
    } catch (error) {
        console.error("Error updating assignment:", error);
        return { success: false, error: (error as Error).message };
    }
}
