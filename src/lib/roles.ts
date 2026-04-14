import { auth } from "@/auth";
import { getCourseMembers, getStudents } from "@/lib/google-sheets";
import { redirect } from "next/navigation";
import type { CourseMembership, Student, UserRole } from "@/types";
import type { Session } from "next-auth";

import { env } from "@/lib/env";
import { getActiveCourseIds } from "@/lib/courses";

/**
 * Danh sách admin GitHub usernames, đọc từ env var.
 */
function getAdminUsernames(): string[] {
    return env.ADMIN_GITHUB_USERNAMES;
}

/**
 * Xác định role dựa trên GitHub username (truy vấn Google Sheets).
 *
 * Thứ tự ưu tiên:
 *   1. admin — nếu username nằm trong ADMIN_GITHUB_USERNAMES
 *   2. student — nếu username nằm trong sheet Students và active
 *   3. unauthorized — tất cả trường hợp còn lại
 */
export async function getUserRole(githubUsername: string, studentsOverride?: Student[]): Promise<UserRole> {
    const lower = githubUsername.toLowerCase();

    // Check admin
    if (getAdminUsernames().includes(lower)) {
        return "admin";
    }

    // Check teacher via course memberships
    const teacherCourseIds = await getTeacherCourseIds(githubUsername);
    if (teacherCourseIds.length > 0) {
        return "teacher";
    }

    // Check allowed student/guest via Google Sheets
    const students = studentsOverride ?? await getStudents();
    const found = students.find(
        (s) => s.githubUsername.toLowerCase() === lower && s.active
    );

    if (found) {
        return found.role === "guest" ? "guest" : "student";
    }

    return "unauthorized";
}

/**
 * Lấy role của user hiện tại từ session.
 * Dùng ở Server Components và Server Actions.
 *
 * Nếu role="unauthorized", sẽ tự động redirect tới /unauthorized 
 * (thay thế chức năng bảo vệ của proxy.ts trước đây).
 */
export async function getCurrentUserRole() {
    return getCurrentUserRoleWithContext();
}

interface CurrentUserRoleOptions {
    session?: Session | null;
    students?: Student[];
}

export async function getCurrentUserRoleWithContext(options: CurrentUserRoleOptions = {}) {
    const session = options.session ?? await auth();

    if (!session?.user?.githubUsername) {
        redirect("/login");
    }

    const role = await getUserRole(session.user.githubUsername, options.students);

    if (role === "unauthorized") {
        redirect("/unauthorized");
    }

    return { role, session };
}

/**
 * All active course IDs this teacher can manage.
 * Admins are not handled here; use getManagedCourseIdsForUser for role-aware behavior.
 */
export async function getTeacherCourseIds(
    githubUsername: string,
    membershipsOverride?: CourseMembership[]
): Promise<string[]> {
    const lower = githubUsername.toLowerCase();
    const memberships = membershipsOverride ?? await getCourseMembers();
    const courseIds = memberships
        .filter((m) => m.active && m.role === "teacher" && m.githubUsername.toLowerCase() === lower)
        .map((m) => m.courseId);
    return Array.from(new Set(courseIds));
}

/**
 * Role-aware list of courses the user can manage.
 * - admin: all active courses
 * - teacher: assigned courses only
 * - others: none
 */
export async function getManagedCourseIdsForUser(
    githubUsername: string,
    role?: UserRole,
    membershipsOverride?: CourseMembership[]
): Promise<string[]> {
    const resolvedRole = role ?? await getUserRole(githubUsername);
    if (resolvedRole === "admin") {
        return getActiveCourseIds();
    }
    if (resolvedRole === "teacher") {
        return getTeacherCourseIds(githubUsername, membershipsOverride);
    }
    return [];
}

/**
 * Check whether a role/user can manage content of a specific course.
 */
export async function canManageCourse(
    githubUsername: string,
    courseId: string,
    role?: UserRole,
    membershipsOverride?: CourseMembership[]
): Promise<boolean> {
    if (role === "admin") {
        return true;
    }
    const managed = await getManagedCourseIdsForUser(githubUsername, role, membershipsOverride);
    return managed.includes(courseId);
}
