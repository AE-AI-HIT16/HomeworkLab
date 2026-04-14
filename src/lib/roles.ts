import { auth } from "@/auth";
import { getStudents } from "@/lib/google-sheets";
import { redirect } from "next/navigation";
import type { Student, UserRole } from "@/types";
import type { Session } from "next-auth";

import { env } from "@/lib/env";

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
