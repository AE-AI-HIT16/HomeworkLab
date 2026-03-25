import { requireSession } from "@/lib/auth";
import { getCurrentUserRole } from "@/lib/roles";
import { LogoutButton } from "@/components/LogoutButton";
import { WeekGroup } from "@/components/WeekGroup";
import Image from "next/image";
import Link from "next/link";
import { getAssignments, getSubmissionsByStudent } from "@/lib/google-sheets";
import type { Submission } from "@/types";

const roleBadge: Record<string, { label: string; className: string }> = {
    admin: { label: "Admin / Giáo viên", className: "bg-purple-100 text-purple-800" },
    student: { label: "Học viên", className: "bg-green-100 text-green-800" },
};

export default async function DashboardPage() {
    await requireSession();
    const { role, session } = await getCurrentUserRole();
    const user = session!.user;
    const badge = roleBadge[role];

    // Lấy assignments đã publish từ Google Sheets
    const allAssignments = await getAssignments();
    const assignments = allAssignments.filter((a) => a.published);

    // Lấy submissions của user hiện tại từ Google Sheets
    const userSubmissions = await getSubmissionsByStudent(user.githubUsername);
    const submissionMap = new Map<string, Submission>(
        userSubmissions.map((s) => [s.assignmentId, s])
    );

    // Nhóm theo tuần
    const weekMap = new Map<number, typeof assignments>();
    for (const a of assignments) {
        const list = weekMap.get(a.week) ?? [];
        list.push(a);
        weekMap.set(a.week, list);
    }
    const weeks = Array.from(weekMap.entries()).sort(([a], [b]) => a - b);

    return (
        <main className="min-h-screen p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    {badge && (
                        <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.className}`}>
                            {badge.label}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    {role === "admin" && (
                        <Link
                            href="/admin"
                            className="text-sm text-purple-600 hover:text-purple-500 font-medium"
                        >
                            Quản trị →
                        </Link>
                    )}
                    <div className="flex items-center gap-2">
                        {user.image && (
                            <Image src={user.image} alt={user.name ?? "Avatar"} width={32} height={32} className="rounded-full" />
                        )}
                        <div className="text-sm">
                            <p className="font-medium">{user.name}</p>
                            <p className="text-gray-500">@{user.githubUsername}</p>
                        </div>
                    </div>
                    <LogoutButton />
                </div>
            </div>

            {/* Content */}
            {weeks.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-5xl mb-4">📚</p>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Chưa có bài tập</h2>
                    <p className="text-gray-400">Giáo viên chưa publish bài tập nào. Quay lại sau nhé!</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {weeks.map(([week, weekAssignments]) => (
                        <WeekGroup
                            key={week}
                            week={week}
                            assignments={weekAssignments}
                            submissionMap={submissionMap}
                        />
                    ))}
                </div>
            )}
        </main>
    );
}
