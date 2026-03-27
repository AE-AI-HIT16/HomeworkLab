import { getCurrentUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import { getStudents, getAssignments, getSubmissions } from "@/lib/google-sheets";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
    const { role } = await getCurrentUserRole();
    if (role !== "admin") redirect("/dashboard");

    const [studentsFromSheet, assignments, submissions] = await Promise.all([
        getStudents(),
        getAssignments(),
        getSubmissions(),
    ]);

    // If the Students sheet is empty, derive unique students from submissions
    const students = studentsFromSheet.length > 0
        ? studentsFromSheet
        : Array.from(
            new Map(
                submissions.map((s) => [
                    s.githubUsername.toLowerCase(),
                    { githubUsername: s.githubUsername, name: s.studentName, active: true },
                ])
            ).values()
        );

    const publishedAssignments = assignments.filter((a) => a.published);
    const total = publishedAssignments.length;

    // Build per-student stats
    const now = new Date();
    const overdueAssignments = publishedAssignments.filter(
        (a) => a.dueAt && new Date(a.dueAt) < now
    );

    const studentStats = students.map((student) => {
        const studentSubs = submissions.filter(
            (s) => s.githubUsername.toLowerCase() === student.githubUsername.toLowerCase()
        );
        const submitted = studentSubs.filter((s) =>
            publishedAssignments.some((a) => a.id === s.assignmentId)
        ).length;
        const late = studentSubs.filter((s) => s.isLate).length;
        const graded = studentSubs.filter((s) => s.grade !== undefined);
        const avgGrade =
            graded.length > 0
                ? Math.round(graded.reduce((sum, s) => sum + (s.grade ?? 0), 0) / graded.length)
                : null;
        const completionPct = total > 0 ? Math.round((submitted / total) * 100) : 0;

        // Count overdue assignments this student hasn't submitted
        const missedOverdue = overdueAssignments.filter(
            (a) => !studentSubs.some((s) => s.assignmentId === a.id)
        ).length;

        return { student, submitted, late, avgGrade, completionPct, missedOverdue };
    });

    const missing = studentStats.filter((s) => s.submitted === 0 && s.missedOverdue > 0).length;
    const fullySubmitted = studentStats.filter((s) => s.submitted === total && total > 0).length;

    return (
        <main className="max-w-5xl mx-auto p-6 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-3">
                    <Link href="/admin" className="hover:text-[var(--hw-primary)] transition-colors">Analytics</Link>
                    <span>/</span>
                    <span className="text-slate-700">Students</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Student Overview</h1>
                <p className="text-sm text-slate-500">{students.length} students · {total} published assignments</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-slate-500 font-medium mb-1">Total Students</p>
                    <p className="text-2xl font-bold text-slate-900">{students.length}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-emerald-600 font-medium mb-1">All Submitted</p>
                    <p className="text-2xl font-bold text-emerald-700">{fullySubmitted}</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-red-500 font-medium mb-1">Missing (Overdue)</p>
                    <p className="text-2xl font-bold text-red-600">{missing}</p>
                </div>
                <div className="bg-[var(--hw-primary-fixed)] border border-[var(--hw-primary-fixed-dim)] rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-[var(--hw-primary)] font-medium mb-1">Assignments</p>
                    <p className="text-2xl font-bold text-[var(--hw-primary)]">{total}</p>
                </div>
            </div>

            {/* Student Table */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-800 text-sm">All Students</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                                <th className="px-5 py-3 text-left">Student</th>
                                <th className="px-5 py-3 text-left">Completion</th>
                                <th className="px-5 py-3 text-left">Submitted</th>
                                <th className="px-5 py-3 text-left">Late</th>
                                <th className="px-5 py-3 text-left">Avg Score</th>
                                <th className="px-5 py-3 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {studentStats.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                                        No students found.
                                    </td>
                                </tr>
                            ) : (
                                studentStats.map(({ student, submitted, late, avgGrade, completionPct, missedOverdue }) => (
                                    <tr key={student.githubUsername} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[var(--hw-primary-fixed-dim)] text-[var(--hw-primary)] flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                    {student.name?.[0]?.toUpperCase() ?? "?"}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{student.name}</p>
                                                    <p className="text-xs text-slate-400">@{student.githubUsername}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[var(--hw-primary)] rounded-full transition-all"
                                                        style={{ width: `${completionPct}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-slate-500 font-medium">{completionPct}%</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="font-semibold text-slate-800">{submitted}</span>
                                            <span className="text-slate-400 text-xs"> / {total}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {late > 0 ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                                                    {late} late
                                                </span>
                                            ) : (
                                                <span className="text-slate-300 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            {avgGrade !== null ? (
                                                <span className={`font-bold text-sm ${avgGrade >= 80 ? "text-emerald-600" : avgGrade >= 60 ? "text-amber-600" : "text-red-500"}`}>
                                                    {avgGrade}<span className="text-xs font-normal text-slate-400">/100</span>
                                                </span>
                                            ) : (
                                                <span className="text-slate-300 text-xs">Not graded</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            {submitted === total && total > 0 ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">Complete</span>
                                            ) : submitted > 0 ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--hw-primary-fixed)] text-[var(--hw-primary)] border border-[var(--hw-primary-fixed-dim)]">In Progress</span>
                                            ) : missedOverdue > 0 ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">Missing</span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200">Not Started</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
