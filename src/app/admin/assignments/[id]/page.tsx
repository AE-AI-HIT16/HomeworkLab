import { getCurrentUserRole } from "@/lib/roles";
import { getAssignmentDetailsWithSubmissions } from "@/lib/google-sheets";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { AdminSubmissionTable } from "@/components/AdminSubmissionTable";
import { EditAssignmentModal } from "@/components/EditAssignmentModal";

interface AdminAssignmentDetailPageProps {
    params: Promise<{ id: string }>;
}

function formatDate(iso?: string): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default async function AdminAssignmentDetailPage({ params }: AdminAssignmentDetailPageProps) {
    const { id } = await params;

    const { role, session } = await getCurrentUserRole();
    if (role !== "admin" || !session) redirect("/dashboard");

    const data = await getAssignmentDetailsWithSubmissions(id);
    if (!data) notFound();

    const { assignment, stats, rows } = data;
    const isPastDue = assignment.dueAt ? new Date(assignment.dueAt) < new Date() : false;

    // Build leaderboard from graded submissions
    const leaderboard = rows
        .filter((r) => r.submission?.grade !== undefined)
        .sort((a, b) => (b.submission!.grade ?? 0) - (a.submission!.grade ?? 0));

    return (
        <main className="max-w-5xl mx-auto p-6 md:p-8">
            <Link
                href="/admin"
                className="text-sm text-[var(--hw-primary)] hover:text-[var(--hw-primary)] font-medium mb-6 inline-flex items-center gap-1"
            >
                ← Back to Analytics
            </Link>

            {/* Header */}
            <header className="mb-8">
                <div className="flex items-start gap-4 justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                Week {assignment.week} / Lesson {assignment.lesson}
                            </span>
                            <span
                                className={`text-sm px-3 py-1 rounded-full font-medium ${assignment.published
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-500"
                                    }`}
                            >
                                {assignment.published ? "Published" : "Draft"}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
                    </div>
                    <EditAssignmentModal
                        assignmentId={assignment.id}
                        currentWeek={assignment.week}
                        currentLesson={assignment.lesson}
                        currentTitle={assignment.title}
                    />
                </div>

                <div className="bg-white border rounded-xl p-5 mt-6 shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500 font-medium">Due Date</p>
                            <p className={`text-lg font-semibold mt-1 ${isPastDue ? "text-red-600" : "text-gray-900"}`}>
                                {formatDate(assignment.dueAt)}
                            </p>
                            {isPastDue && <p className="text-xs text-red-500 mt-1">Overdue</p>}
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-600 font-medium">Progress</p>
                            <p className="text-lg font-bold text-blue-900 mt-1">
                                {stats.submitted} / {stats.total}
                            </p>
                            <p className="text-xs text-blue-500 mt-1">Students submitted</p>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-lg">
                            <p className="text-sm text-amber-600 font-medium">Late</p>
                            <p className="text-lg font-bold text-amber-900 mt-1">{stats.late}</p>
                            <p className="text-xs text-amber-500 mt-1">Submitted late</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-600 font-medium">Content</p>
                            <p className="text-lg font-bold text-green-900 mt-1">
                                {stats.files} <span className="text-sm font-normal">Files</span> · {stats.repos} <span className="text-sm font-normal">Repos</span>
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">🏆 Leaderboard</h2>
                    <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b text-xs font-bold uppercase tracking-wider text-slate-400">
                                    <th className="px-5 py-3 text-left w-12">Rank</th>
                                    <th className="px-5 py-3 text-left">Student</th>
                                    <th className="px-5 py-3 text-left">Score</th>
                                    <th className="px-5 py-3 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {leaderboard.map(({ student, submission }, index) => {
                                    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`;
                                    const grade = submission!.grade!;
                                    const scoreColor = grade >= 80 ? "text-emerald-600" : grade >= 60 ? "text-amber-600" : "text-red-500";
                                    return (
                                        <tr key={student.githubUsername} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-5 py-3 text-lg">{medal}</td>
                                            <td className="px-5 py-3">
                                                <p className="font-semibold text-slate-900">{student.name}</p>
                                                <p className="text-xs text-slate-400">@{student.githubUsername}</p>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`text-xl font-bold ${scoreColor}`}>{grade}</span>
                                                <span className="text-xs text-slate-400">/100</span>
                                            </td>
                                            <td className="px-5 py-3">
                                                {submission!.isLate ? (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">Late</span>
                                                ) : (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">On time</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* Detailed table */}
            <h2 className="text-xl font-bold text-gray-900 mb-4">Detailed Submission Status</h2>
            <AdminSubmissionTable assignmentId={assignment.id} rows={rows} />
        </main>
    );
}
