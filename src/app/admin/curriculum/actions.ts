"use server";

import { getCurrentUserRole } from "@/lib/roles";
import { deleteAssignment, deleteMaterial } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";

export async function deleteAssignmentAction(assignmentId: string) {
    try {
        const { role } = await getCurrentUserRole();
        if (role !== "admin") {
            return { success: false, error: "Unauthorized" };
        }

        await deleteAssignment(assignmentId);
        revalidatePath("/admin");
        revalidatePath("/admin/curriculum");
        revalidatePath("/courses/[slug]", "page");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to delete assignment." };
    }
}

export async function deleteMaterialAction(materialId: string) {
    try {
        const { role } = await getCurrentUserRole();
        if (role !== "admin") {
            return { success: false, error: "Unauthorized" };
        }

        await deleteMaterial(materialId);
        revalidatePath("/admin/curriculum");
        revalidatePath("/courses/[slug]", "page");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to delete material." };
    }
}
