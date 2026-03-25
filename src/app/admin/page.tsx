import Link from "next/link";
import Image from "next/image";
import { getCurrentUserRole } from "@/lib/roles";
import { LogoutButton } from "@/components/LogoutButton";
import { AdminAssignmentRow } from "@/components/AdminAssignmentRow";
import { redirect } from "next/navigation";
import { getAssignments, getSubmissionsByAssignment, getStudents } from "@/lib/google-sheets";

export default async function AdminPage() {
    const { role, session } = await getCurrentUserRole();
    if (role !== "admin" || !session) redirect("/dashboard");

    const user = session.user;

    // Fetch data from Google Sheets
    const allStudents = await getStudents();
    const activeStudents = allStudents.filter((s) => s.active);
    const assignments = await getAssignments();

    // Sort: newest first (by week desc, lesson desc)
    const sortedAssignments = [...assignments].sort(
        (a, b) => b.week - a.week || b.lesson - a.lesson
    );

    return (
        <main className="min-h-screen p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Quản trị</h1>
                    <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                        Admin / Giáo viên
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                    >
                        ← Dashboard
                    </Link>
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

            {/* Actions */}
            <div className="flex items-center justify-between mb-6">
                <p className="text-gray-500 text-sm">
                    {assignments.length} bài tập · {activeStudents.length} học viên
                </p>
                <Link
                    href="/admin/assignments/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition text-sm font-medium"
                >
                    + Tạo bài tập mới
                </Link>
            </div>

            {/* Assignment list */}
            {sortedAssignments.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-5xl mb-4">📋</p>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Chưa có bài tập</h2>
                    <p className="text-gray-400">Hãy tạo bài tập đầu tiên.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {await Promise.all(sortedAssignments.map(async (assignment) => {
                        const submissions = await getSubmissionsByAssignment(assignment.id);
                        const submittedUsernames = new Set(submissions.map((s) => s.githubUsername));
                        const missingStudents = activeStudents.filter(
                            (s) => !submittedUsernames.has(s.githubUsername)
                        );

                        return (
                            <AdminAssignmentRow
                                key={assignment.id}
                                assignment={assignment}
                                submissions={submissions}
                                totalStudents={activeStudents.length}
                                missingStudents={missingStudents}
                            />
                        );
                    }))}
                </div>
            )}
        </main>
    );
}
