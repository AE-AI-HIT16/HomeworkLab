"use server";

import { getCurrentUserRole } from "@/lib/roles";
import { deleteAssignment, deleteMaterial, updateMaterialTitle } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return fallback;
}

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
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Failed to delete assignment.") };
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
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Failed to delete material.") };
    }
}

export async function renameMaterialAction(materialId: string, newTitle: string) {
    try {
        const { role } = await getCurrentUserRole();
        if (role !== "admin") {
            return { success: false, error: "Unauthorized" };
        }

        if (!newTitle.trim()) {
            return { success: false, error: "Title cannot be empty." };
        }

        await updateMaterialTitle(materialId, newTitle.trim());
        revalidatePath("/admin/curriculum");
        revalidatePath("/courses/[slug]", "page");
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Failed to rename material.") };
    }
}
