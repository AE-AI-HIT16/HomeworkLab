"use server";

import { getCurrentUserRole } from "@/lib/roles";
import { updateStudentRole } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";

/**
 * Toggle a student's role between "student" and "guest".
 * Only admins can perform this action.
 */
export async function toggleStudentRole(
    githubUsername: string,
    newRole: "student" | "guest"
): Promise<{ success: boolean; error?: string }> {
    const { role } = await getCurrentUserRole();
    if (role !== "admin") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await updateStudentRole(githubUsername, newRole);
        revalidatePath("/admin/students");
        return { success: true };
    } catch (e) {
        console.error("Failed to toggle student role:", e);
        return { success: false, error: "Failed to update role." };
    }
}
