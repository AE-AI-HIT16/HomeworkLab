"use server";

import { canManageCourse, getCurrentUserRole } from "@/lib/roles";
import { deleteAssignment, deleteMaterial, getAssignmentById, getMaterials, updateMaterialTitle } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return fallback;
}

export async function deleteAssignmentAction(assignmentId: string) {
    try {
        const { role, session } = await getCurrentUserRole();
        if (!session || (role !== "admin" && role !== "teacher")) {
            return { success: false, error: "Unauthorized" };
        }

        const assignment = await getAssignmentById(assignmentId);
        if (!assignment) {
            return { success: false, error: "Assignment not found." };
        }

        const allowed = await canManageCourse(session.user.githubUsername, assignment.courseId, role);
        if (!allowed) {
            return { success: false, error: "You cannot manage this course." };
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
        const { role, session } = await getCurrentUserRole();
        if (!session || (role !== "admin" && role !== "teacher")) {
            return { success: false, error: "Unauthorized" };
        }

        const materials = await getMaterials();
        const material = materials.find((m) => m.id === materialId);
        if (!material) {
            return { success: false, error: "Material not found." };
        }

        const allowed = await canManageCourse(session.user.githubUsername, material.courseId, role);
        if (!allowed) {
            return { success: false, error: "You cannot manage this course." };
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
        const { role, session } = await getCurrentUserRole();
        if (!session || (role !== "admin" && role !== "teacher")) {
            return { success: false, error: "Unauthorized" };
        }

        if (!newTitle.trim()) {
            return { success: false, error: "Title cannot be empty." };
        }

        const materials = await getMaterials();
        const material = materials.find((m) => m.id === materialId);
        if (!material) {
            return { success: false, error: "Material not found." };
        }

        const allowed = await canManageCourse(session.user.githubUsername, material.courseId, role);
        if (!allowed) {
            return { success: false, error: "You cannot manage this course." };
        }

        await updateMaterialTitle(materialId, newTitle.trim());
        revalidatePath("/admin/curriculum");
        revalidatePath("/courses/[slug]", "page");
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Failed to rename material.") };
    }
}
