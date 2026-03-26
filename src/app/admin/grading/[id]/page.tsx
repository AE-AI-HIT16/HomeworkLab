import { getCurrentUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import { getAssignmentDetailsWithSubmissions } from "@/lib/google-sheets";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminSubmissionTable } from "@/components/AdminSubmissionTable";

interface Props {
    params: Promise<{ id: string }>;
}

function formatDate(iso?: string) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
        weekday: "short", day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

export default async function GradingDetailPage({ params }: Props) {
    const { id } = await params;
    const { role } = await getCurrentUserRole();
    if (role !== "admin") redirect("/dashboard");

    const data = await getAssignmentDetailsWithSubmissions(id);
    if (!data) notFound();

    const { assignment, stats, rows } = data;
    const isPastDue = assignment.dueAt ? new Date(assignment.dueAt) < new Date() : false;

    const leaderboard = rows
        .filter((r) => r.submission?.grade !== undefined)
        .sort((a, b) => (b.submission!.grade ?? 0) - (a.submission!.grade ?? 0));

    const avgGrade = leaderboard.length > 0
        ? Math.round(leaderboard.reduce((sum, r) => sum + (r.submission!.grade ?? 0), 0) / leaderboard.length)
        : null;

    return (
        <main className="max-w-5xl mx-auto p-6 md:p-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-6">
                <Link href="/admin/grading" className="hover:text-indigo-600 transition-colors">Grading</Link>
                <span>/</span>
                <span className="text-slate-700 truncate max-w-[200px]">{assignment.title}</span>
            </div>

            {/* Header */}
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        Week {assignment.week} / Lesson {assignment.lesson}
                    </span>
                    <span className={`text-sm px-3 py-1 rounded-full font-medium ${assignment.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {assignment.published ? "Published" : "Draft"}
                    </span>
                    {isPastDue && (
                        <span className="text-sm px-3 py-1 rounded-full font-medium bg-red-50 text-red-500">Closed</span>
                    )}
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-6">{assignment.title}</h1>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                        <p className="text-xs text-slate-500 font-medium mb-1">Due Date</p>
                        <p className={`text-sm font-semibold ${isPastDue ? "text-red-600" : "text-slate-800"}`}>{formatDate(assignment.dueAt)}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 shadow-sm">
                        <p className="text-xs text-blue-600 font-medium mb-1">Progress</p>
                        <p className="text-xl font-bold text-blue-900">{stats.submitted} <span className="text-sm font-normal text-blue-400">/ {stats.total}</span></p>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 shadow-sm">
                        <p className="text-xs text-indigo-600 font-medium mb-1">Graded</p>
                        <p className="text-xl font-bold text-indigo-900">{leaderboard.length} <span className="text-sm font-normal text-indigo-400">/ {stats.submitted}</span></p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 shadow-sm">
                        <p className="text-xs text-emerald-600 font-medium mb-1">Avg Score</p>
                        <p className={`text-xl font-bold ${avgGrade === null ? "text-slate-300" : avgGrade >= 80 ? "text-emerald-700" : avgGrade >= 60 ? "text-amber-600" : "text-red-500"}`}>
                            {avgGrade ?? "—"}{avgGrade !== null && <span className="text-sm font-normal text-emerald-500">/100</span>}
                        </p>
                    </div>
                </div>
            </header>

            {/* Leaderboard */}
            <section className="mb-10">
                <h2 className="text-xl font-bold text-slate-900 mb-4">🏆 Leaderboard</h2>
                {leaderboard.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-xl p-8 text-center text-slate-400 text-sm shadow-sm">
                        No grades yet. Grade submissions below to populate the leaderboard.
                    </div>
                ) : (
                    <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b text-xs font-bold uppercase tracking-wider text-slate-400">
                                    <th className="px-5 py-3 text-left w-16">Rank</th>
                                    <th className="px-5 py-3 text-left">Student</th>
                                    <th className="px-5 py-3 text-left">Score</th>
                                    <th className="px-5 py-3 text-left">Feedback</th>
                                    <th className="px-5 py-3 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {leaderboard.map(({ student, submission }, index) => {
                                    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`;
                                    const grade = submission!.grade!;
                                    const scoreColor = grade >= 80 ? "text-emerald-600" : grade >= 60 ? "text-amber-600" : "text-red-500";
                                    return (
                                        <tr key={student.githubUsername} className={`hover:bg-slate-50 transition-colors ${index === 0 ? "bg-yellow-50/30" : ""}`}>
                                            <td className="px-5 py-4 text-xl">{medal}</td>
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-slate-900">{student.name}</p>
                                                <p className="text-xs text-slate-400">@{student.githubUsername}</p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-2xl font-bold ${scoreColor}`}>{grade}</span>
                                                <span className="text-xs text-slate-400">/100</span>
                                            </td>
                                            <td className="px-5 py-4 max-w-[200px]">
                                                <p className="text-xs text-slate-500 italic line-clamp-2">
                                                    {submission!.feedback ?? <span className="text-slate-300">—</span>}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
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
                )}
            </section>

            {/* Grading Table */}
            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Grade Submissions</h2>
                <AdminSubmissionTable assignmentId={assignment.id} rows={rows} />
            </section>
        </main>
    );
}
