"use server";

import { saveSubmission, getSubmission } from "@/lib/google-sheets";
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
