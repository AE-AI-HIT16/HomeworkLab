import { requireSession } from "@/lib/auth";
import { getCurrentUserRole } from "@/lib/roles";
import Link from "next/link";
import { getAssignments, getSubmissionsByStudent } from "@/lib/google-sheets";
import type { Assignment, Submission } from "@/types";

import { TopNav } from "@/components/TopNav";
import { StudentSidebar } from "@/components/StudentSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";

function getSubmissionStatus(assignment: Assignment, submission?: Submission) {
    if (submission) {
        return { label: "Submitted", type: "submitted" as const };
    }
    if (assignment.dueAt) {
        const due = new Date(assignment.dueAt);
        const now = new Date();
        const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
            return { label: "Overdue", type: "overdue" as const };
        }
        if (diffDays <= 3) {
            return { label: `Due Soon (${diffDays}d)`, type: "due-soon" as const };
        }
    }
    return { label: "Not Submitted", type: "pending" as const };
}

function formatDueDate(dueAt?: string) {
    if (!dueAt) return "No due date";
    const d = new Date(dueAt);
    return `Due: ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    await requireSession();
    const { role, session } = await getCurrentUserRole();
    const user = session!.user;
    const { q } = await searchParams;

    const allAssignments = await getAssignments();
    const publishedAssignments = allAssignments.filter((a) => a.published);
    const assignments = q
        ? publishedAssignments.filter((a) =>
            a.title.toLowerCase().includes(q.toLowerCase()) ||
            (a.description ?? "").toLowerCase().includes(q.toLowerCase())
        )
        : publishedAssignments;
    const userSubmissions = await getSubmissionsByStudent(user.githubUsername);
    const submissionMap = new Map<string, Submission>(
        userSubmissions.map((s) => [s.assignmentId, s])
    );

    // Stats
    const totalAssignments = publishedAssignments.length;
    const submittedCount = userSubmissions.filter(s => publishedAssignments.some(a => a.id === s.assignmentId)).length;
    const completionPct = totalAssignments > 0 ? Math.round((submittedCount / totalAssignments) * 100) : 0;

    // Advanced Stats
    const gradedSubs = userSubmissions.filter(s => s.grade !== undefined);
    const avgScore = gradedSubs.length > 0
        ? Math.round(gradedSubs.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubs.length)
        : null;

    // Categorize Assignments
    const now = new Date();
    const pendingAssignments = assignments
        .filter((a) => !submissionMap.has(a.id))
        .sort((a, b) => {
            // Sort by week/lesson ascending
            if (a.week !== b.week) return a.week - b.week;
            return a.lesson - b.lesson;
        });

    const nextUp = pendingAssignments.length > 0 ? pendingAssignments[0] : null;

    const urgentAssignments = pendingAssignments.filter((a) => {
        if (!a.dueAt) return false;
        const due = new Date(a.dueAt);
        const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 3; // overdue (<=0) or due soon (<=3)
    }).sort((a, b) => new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime());

    // Recent activity (last 4 submissions)
    const recentActivity = userSubmissions
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .slice(0, 4)
        .map(sub => ({
            submission: sub,
            assignment: publishedAssignments.find(a => a.id === sub.assignmentId)
        }))
        .filter(item => item.assignment !== undefined) as { submission: Submission, assignment: Assignment }[];

    return (
        <div className="min-h-screen bg-[var(--hw-surface)] text-[var(--hw-on-surface)] antialiased">
            <TopNav
                user={{
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    githubUsername: user.githubUsername
                }}
                role={role}
                showSearch={true}
            />

            <div className="flex pt-16">
                <StudentSidebar role={role} />

                {/* ═══ MAIN CONTENT ═══ */}
                <main className="ml-0 md:ml-64 w-full p-4 sm:p-6 md:p-8 min-h-screen bg-[var(--hw-surface)] pb-24 max-w-7xl mx-auto">
                    <header className="mb-8 flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-[var(--hw-on-surface)] mb-1">Learning Hub</h1>
                            <p className="text-[var(--hw-on-surface-variant)] text-sm">
                                {role === "admin"
                                    ? "You are viewing the student-facing dashboard."
                                    : `Welcome back, ${user.name?.split(" ")[0] ?? user.githubUsername}`}
                            </p>
                        </div>
                        {role === "admin" && (
                            <Link href="/admin" className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--hw-primary)] text-white text-sm font-semibold rounded-xl hover:brightness-110 transition-all shadow-md shadow-[var(--hw-primary)]/20">
                                Open Admin Workspace
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </Link>
                        )}
                    </header>

                    {/* TOP METRICS */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white border border-[var(--hw-surface-container-high)] rounded-xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                            <p className="text-xs text-[var(--hw-on-surface-variant)] font-medium mb-1 uppercase tracking-wider">Progress</p>
                            <div className="flex items-center justify-between">
                                <p className="text-2xl font-bold text-[var(--hw-on-surface)]">{completionPct}%</p>
                                <span className="text-xs font-bold bg-[var(--hw-primary-fixed)] text-[var(--hw-primary)] px-2 py-0.5 rounded-md">
                                    {submittedCount}/{totalAssignments}
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-[var(--hw-surface-container-high)] rounded-full mt-3 overflow-hidden">
                                <div className="h-full bg-[var(--hw-primary)] rounded-full transition-all" style={{ width: `${completionPct}%` }} />
                            </div>
                        </div>

                        <div className="bg-white border border-[var(--hw-surface-container-high)] rounded-xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                            <p className="text-xs text-[var(--hw-on-surface-variant)] font-medium mb-1 uppercase tracking-wider">Avg Score</p>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold text-[var(--hw-on-surface)]">{avgScore !== null ? avgScore : "—"}</p>
                                {avgScore !== null && <span className="text-xs text-[var(--hw-on-surface-variant)]">/100</span>}
                            </div>
                            <p className="text-[11px] text-[var(--hw-outline)] mt-2">
                                Based on {gradedSubs.length} graded
                            </p>
                        </div>

                        <div className="bg-white border border-[var(--hw-surface-container-high)] rounded-xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                            <p className="text-xs text-[var(--hw-on-surface-variant)] font-medium mb-1 uppercase tracking-wider">Pending</p>
                            <p className="text-2xl font-bold text-[var(--hw-on-surface)]">{totalAssignments - submittedCount}</p>
                            <p className="text-[11px] text-[var(--hw-outline)] mt-2">Assignments to do</p>
                        </div>

                        <div className={`${urgentAssignments.length > 0 ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"} border rounded-xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)]`}>
                            <p className={`text-xs font-medium mb-1 uppercase tracking-wider ${urgentAssignments.length > 0 ? "text-red-600" : "text-emerald-700"}`}>
                                Needs Attention
                            </p>
                            <p className={`text-2xl font-bold ${urgentAssignments.length > 0 ? "text-red-700" : "text-emerald-800"}`}>
                                {urgentAssignments.length}
                            </p>
                            <p className={`text-[11px] mt-2 ${urgentAssignments.length > 0 ? "text-red-500" : "text-emerald-600"}`}>
                                {urgentAssignments.length > 0 ? "Due soon or overdue" : "All caught up!"}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* MAIN COLUMN (Hero + Urgent) */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* NEXT UP HERO */}
                            <section>
                                <h2 className="text-sm font-bold tracking-widest text-[var(--hw-outline)] uppercase mb-4">Continue Learning</h2>
                                {nextUp ? (
                                    <div className="bg-[var(--hw-primary)] rounded-2xl p-6 md:p-8 shadow-xl shadow-[var(--hw-primary)]/20 text-white relative overflow-hidden group">
                                        {/* Decorative backgrounds */}
                                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-900/40 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700 delay-100" />
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay" />

                                        <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                                            <div>
                                                <span className="inline-block px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-md text-[10px] font-bold tracking-widest uppercase mb-3">
                                                    Up Next • Week {nextUp.week}
                                                </span>
                                                <h3 className="text-2xl font-bold mb-2">{nextUp.title}</h3>
                                                <p className="text-white/80 text-sm max-w-md line-clamp-2 leading-relaxed mb-4">
                                                    {nextUp.description || "Continue your learning journey with this assignment."}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs font-medium text-white/90">
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                                                        {formatDueDate(nextUp.dueAt)}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="material-symbols-outlined text-[16px]">book</span>
                                                        Lesson {nextUp.lesson}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="shrink-0 mt-4 md:mt-0">
                                                <Link
                                                    href={`/assignment/${nextUp.id}`}
                                                    className="w-full md:w-auto inline-flex justify-center items-center gap-2 bg-white text-[var(--hw-primary)] px-6 py-3 rounded-xl font-bold shadow-lg hover:brightness-105 hover:scale-[1.02] active:scale-95 transition-all text-sm"
                                                >
                                                    Start Work
                                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white border border-[var(--hw-surface-container-high)] border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                                            <span className="material-symbols-outlined text-[32px]">celebration</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-[var(--hw-on-surface)] mb-2">You&apos;re all caught up!</h3>
                                        <p className="text-[var(--hw-on-surface-variant)] text-sm max-w-md">
                                            You&apos;ve completed all published assignments. Great job staying on top of your studies!
                                        </p>
                                    </div>
                                )}
                            </section>

                            {/* URGENT / ACTION ITEMS */}
                            {urgentAssignments.length > 0 && (
                                <section>
                                    <h2 className="text-sm font-bold tracking-widest text-[var(--hw-outline)] uppercase mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        Needs Attention
                                    </h2>
                                    <div className="bg-white border border-red-100 rounded-2xl overflow-hidden shadow-sm">
                                        {urgentAssignments.slice(0, 5).map((a, idx) => {
                                            const status = getSubmissionStatus(a);
                                            const isOverdue = status.type === "overdue";
                                            return (
                                                <div key={a.id} className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${idx !== 0 ? 'border-t border-slate-100' : ''}`}>
                                                    <div className="flex gap-4 items-start">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isOverdue ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                                            <span className="material-symbols-outlined">{isOverdue ? 'error' : 'warning'}</span>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-[var(--hw-on-surface)] text-[15px] mb-1">{a.title}</h3>
                                                            <div className="flex flex-wrap items-center gap-3 text-xs">
                                                                <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
                                                                    {status.label}
                                                                </span>
                                                                <span className="w-1 h-1 rounded-full bg-[var(--hw-outline-variant)]" />
                                                                <span className="text-[var(--hw-outline)]">Week {a.week} • Lesson {a.lesson}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        href={`/assignment/${a.id}`}
                                                        className="shrink-0 text-sm font-bold bg-[var(--hw-surface-container-low)] hover:bg-[var(--hw-surface-container-high)] text-[var(--hw-on-surface)] px-4 py-2.5 rounded-lg transition-colors text-center"
                                                    >
                                                        View Task
                                                    </Link>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* SIDEBAR COLUMN (Recent + Courses) */}
                        <div className="space-y-8">

                            {/* RECENT ACTIVITY */}
                            <section>
                                <h2 className="text-sm font-bold tracking-widest text-[var(--hw-outline)] uppercase mb-4">Recent Activity</h2>
                                <div className="bg-white border border-[var(--hw-surface-container-high)] rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                                    {recentActivity.length === 0 ? (
                                        <p className="text-sm text-[var(--hw-on-surface-variant)] text-center py-6">No recent submissions.</p>
                                    ) : (
                                        <div className="space-y-5">
                                            {recentActivity.map(({ submission: sub, assignment: a }) => (
                                                <div key={sub.id} className="relative pl-4">
                                                    {/* Timeline line */}
                                                    <div className="absolute left-[3px] top-6 bottom-[-24px] w-px bg-[var(--hw-surface-container-high)] last-of-type:hidden" />
                                                    {/* Dot */}
                                                    <div className={`absolute left-0 top-1.5 w-2 h-2 rounded-full ring-4 ring-white ${sub.grade !== undefined ? 'bg-emerald-500' : 'bg-[var(--hw-primary)]'}`} />

                                                    <Link href={`/assignment/${a.id}`} className="block group">
                                                        <h4 className="text-[13px] font-semibold text-[var(--hw-on-surface)] group-hover:text-[var(--hw-primary)] transition-colors line-clamp-1 mb-1">
                                                            {a.title}
                                                        </h4>
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-[var(--hw-outline)]">
                                                                {new Date(sub.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                            </span>
                                                            {sub.grade !== undefined ? (
                                                                <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                                                    {sub.grade}/100
                                                                </span>
                                                            ) : (
                                                                <span className="font-medium text-[var(--hw-primary)] bg-[var(--hw-primary-fixed)] px-1.5 py-0.5 rounded">
                                                                    Pending Grade
                                                                </span>
                                                            )}
                                                        </div>
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* LEARNING PATHS */}
                            <section>
                                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white text-center shadow-lg relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                                            <span className="material-symbols-outlined text-[24px]">explore</span>
                                        </div>
                                        <h3 className="font-bold text-lg mb-2">Explore Courses</h3>
                                        <p className="text-slate-300 text-xs mb-5 line-clamp-2 px-2">
                                            Dive into specialized learning paths: AI Core, Data Engineering, and more.
                                        </p>
                                        <Link href="/courses" className="inline-block w-full bg-white text-slate-900 font-bold text-sm py-2.5 rounded-xl hover:bg-slate-100 transition-colors">
                                            View Catalog
                                        </Link>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </main>
            </div>

            <MobileBottomNav variant="student" />
        </div>
    );
}
