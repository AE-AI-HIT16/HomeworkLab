import { getCurrentUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import { getAssignments, getSubmissions } from "@/lib/google-sheets";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatDate(iso?: string) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function AdminGradingPage() {
    const { role } = await getCurrentUserRole();
    if (role !== "admin") redirect("/dashboard");

    const [assignments, submissions] = await Promise.all([
        getAssignments(),
        getSubmissions(),
    ]);

    const published = assignments
        .filter((a) => a.published)
        .sort((a, b) => a.week - b.week || a.lesson - b.lesson);

    return (
        <main className="max-w-4xl mx-auto p-6 md:p-8">
            <div className="mb-8">
                <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--hw-primary)] mb-1">Admin</p>
                <h1 className="text-2xl font-bold text-slate-900">Grading & Leaderboards</h1>
                <p className="text-sm text-slate-500 mt-1">Select an assignment to view scores and rank students.</p>
            </div>

            <div className="space-y-3">
                {published.length === 0 && (
                    <div className="text-center py-16 text-slate-400">No published assignments yet.</div>
                )}
                {published.map((assignment) => {
                    const subs = submissions.filter((s) => s.assignmentId === assignment.id);
                    const graded = subs.filter((s) => s.grade !== undefined);
                    const avgGrade = graded.length > 0
                        ? Math.round(graded.reduce((sum, s) => sum + (s.grade ?? 0), 0) / graded.length)
                        : null;
                    const isPastDue = assignment.dueAt ? new Date(assignment.dueAt) < new Date() : false;

                    return (
                        <Link
                            key={assignment.id}
                            href={`/admin/grading/${assignment.id}`}
                            className="group flex items-center justify-between bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-md rounded-xl px-5 py-4 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[var(--hw-primary-fixed)] rounded-lg flex items-center justify-center text-[var(--hw-primary)] font-bold text-sm flex-shrink-0">
                                    W{assignment.week}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            Week {assignment.week} · Lesson {assignment.lesson}
                                        </span>
                                        {isPastDue && (
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-500">CLOSED</span>
                                        )}
                                    </div>
                                    <p className="font-semibold text-slate-900 group-hover:text-[var(--hw-primary)] transition-colors">
                                        {assignment.title}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">Due {formatDate(assignment.dueAt)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 text-right flex-shrink-0">
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">Submitted</p>
                                    <p className="font-bold text-slate-800">{subs.length}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">Graded</p>
                                    <p className="font-bold text-slate-800">{graded.length}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">Avg Score</p>
                                    <p className={`font-bold text-lg ${avgGrade === null ? "text-slate-300" : avgGrade >= 80 ? "text-emerald-600" : avgGrade >= 60 ? "text-amber-600" : "text-red-500"}`}>
                                        {avgGrade ?? "—"}
                                    </p>
                                </div>
                                <span className="material-symbols-outlined text-slate-300 group-hover:text-indigo-400 transition-colors">
                                    chevron_right
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </main>
    );
}
