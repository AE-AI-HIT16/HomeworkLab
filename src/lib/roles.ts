import { auth } from "@/auth";
import { getStudents } from "@/lib/google-sheets";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types";

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
export async function getUserRole(githubUsername: string): Promise<UserRole> {
    const lower = githubUsername.toLowerCase();

    // Check admin
    if (getAdminUsernames().includes(lower)) {
        return "admin";
    }

    // Check allowed student via Google Sheets
    const students = await getStudents();
    const isAllowedStudent = students.some(
        (s) => s.githubUsername.toLowerCase() === lower && s.active
    );

    if (isAllowedStudent) {
        return "student";
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
    const session = await auth();

    if (!session?.user?.githubUsername) {
        redirect("/login");
    }

    const role = await getUserRole(session.user.githubUsername);

    // Authorization check moved from proxy.ts into Node.js space
    if (role === "unauthorized") {
        redirect("/unauthorized");
    }

    return { role, session };
}
