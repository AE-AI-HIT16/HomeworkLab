"use server";

import { saveSubmission, getSubmission, updateAssignmentFields } from "@/lib/google-sheets";
import { getCurrentUserRole } from "@/lib/roles";
import { revalidatePath } from "next/cache";

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
    fields: { week?: number; lesson?: number; title?: string; description?: string }
) {
    const { role } = await getCurrentUserRole();
    if (role !== "admin") {
        return { success: false, error: "Permission denied." };
    }

    try {
        await updateAssignmentFields(assignmentId, fields);
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
