"use server";

import { getCurrentUserRole } from "@/lib/roles";
import { assignTeacherToCourse, getStudents, removeTeacherFromCourse, updateStudentRole } from "@/lib/google-sheets";
import { getActiveCourseIds } from "@/lib/courses";
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

/**
 * Assign a teacher to a specific course.
 * Only admins can perform this action.
 */
export async function assignTeacherCourse(
    githubUsername: string,
    courseId: string
): Promise<{ success: boolean; error?: string }> {
    const { role } = await getCurrentUserRole();
    if (role !== "admin") {
        return { success: false, error: "Unauthorized" };
    }

    const normalizedUsername = githubUsername.trim();
    const normalizedCourseId = courseId.trim();
    if (!normalizedUsername || !normalizedCourseId) {
        return { success: false, error: "Missing teacher username or course." };
    }

    const validCourseIds = getActiveCourseIds();
    if (!validCourseIds.includes(normalizedCourseId)) {
        return { success: false, error: "Invalid course selected." };
    }

    const students = await getStudents();
    const teacherCandidate = students.find(
        (student) => student.active && student.githubUsername.toLowerCase() === normalizedUsername.toLowerCase()
    );
    if (!teacherCandidate) {
        return { success: false, error: "Teacher must be an active user in Students sheet." };
    }

    try {
        await assignTeacherToCourse(normalizedUsername, normalizedCourseId);
        revalidatePath("/admin/students");
        revalidatePath("/admin/grading");
        revalidatePath("/admin/curriculum");
        revalidatePath("/leaderboard");
        return { success: true };
    } catch (e) {
        console.error("Failed to assign teacher course:", e);
        return { success: false, error: "Failed to assign teacher to course." };
    }
}

/**
 * Remove a teacher from a specific course.
 * Only admins can perform this action.
 */
export async function removeTeacherCourse(
    githubUsername: string,
    courseId: string
): Promise<{ success: boolean; error?: string }> {
    const { role } = await getCurrentUserRole();
    if (role !== "admin") {
        return { success: false, error: "Unauthorized" };
    }

    const normalizedUsername = githubUsername.trim();
    const normalizedCourseId = courseId.trim();
    if (!normalizedUsername || !normalizedCourseId) {
        return { success: false, error: "Missing teacher username or course." };
    }

    const validCourseIds = getActiveCourseIds();
    if (!validCourseIds.includes(normalizedCourseId)) {
        return { success: false, error: "Invalid course selected." };
    }

    try {
        await removeTeacherFromCourse(normalizedUsername, normalizedCourseId);
        revalidatePath("/admin/students");
        revalidatePath("/admin/grading");
        revalidatePath("/admin/curriculum");
        revalidatePath("/leaderboard");
        return { success: true };
    } catch (e) {
        console.error("Failed to remove teacher course:", e);
        return { success: false, error: "Failed to remove teacher from course." };
    }
}
