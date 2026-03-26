import { requireSession } from "@/lib/auth";
import { getCurrentUserRole } from "@/lib/roles";
import Link from "next/link";
import { getAssignments, getSubmissionsByStudent } from "@/lib/google-sheets";
import type { Assignment, Submission } from "@/types";
import EmptyAssignments from "@/components/EmptyAssignments";
import { TopNav } from "@/components/TopNav";

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

    // Group by week
    const weekMap = new Map<number, { title: string; assignments: Assignment[] }>();
    for (const a of assignments) {
        const existing = weekMap.get(a.week);
        if (existing) {
            existing.assignments.push(a);
        } else {
            weekMap.set(a.week, { title: `Week ${a.week}`, assignments: [a] });
        }
    }
    const weeks = Array.from(weekMap.entries()).sort(([a], [b]) => a - b);

    // Stats
    const totalAssignments = publishedAssignments.length;
    const submittedCount = userSubmissions.filter(s => publishedAssignments.some(a => a.id === s.assignmentId)).length;
    const completionPct = totalAssignments > 0 ? Math.round((submittedCount / totalAssignments) * 100) : 0;

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
                {/* ═══ SIDEBAR ═══ */}
                <aside className="fixed left-0 h-[calc(100vh-64px)] w-64 bg-slate-50 flex-col p-4 space-y-2 text-sm hidden md:flex">
                    <div className="mb-6 px-2">
                        <h2 className="text-lg font-semibold text-indigo-600">Learning Space</h2>
                        <p className="text-xs text-slate-500">Active Session</p>
                    </div>
                    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 bg-white text-indigo-600 shadow-sm rounded-lg font-semibold">
                        <span className="material-symbols-outlined">dashboard</span>
                        Dashboard
                    </Link>
                    <Link href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg hover:translate-x-1 transition-transform">
                        <span className="material-symbols-outlined">auto_stories</span>
                        Courses
                    </Link>
                    <Link href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg hover:translate-x-1 transition-transform">
                        <span className="material-symbols-outlined">local_library</span>
                        Library
                    </Link>
                    <Link href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg hover:translate-x-1 transition-transform">
                        <span className="material-symbols-outlined">psychology</span>
                        AI Tutor
                    </Link>

                    {role === "admin" && (
                        <div className="mt-8 px-2">
                            <Link href="/admin/create-assignment" className="block w-full bg-[var(--hw-primary)] text-white py-2.5 rounded-lg font-medium shadow-sm hover:brightness-110 active:scale-[0.98] transition-all text-center">
                                New Assignment
                            </Link>
                        </div>
                    )}

                    <div className="mt-auto pt-4 space-y-1">
                        <Link href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg hover:translate-x-1 transition-transform">
                            <span className="material-symbols-outlined">help_outline</span>
                            Help
                        </Link>
                        <Link href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg hover:translate-x-1 transition-transform">
                            <span className="material-symbols-outlined">settings</span>
                            Settings
                        </Link>
                    </div>
                </aside>

                {/* ═══ MAIN CONTENT ═══ */}
                <main className="ml-0 md:ml-64 w-full p-4 sm:p-6 md:p-8 min-h-screen bg-[var(--hw-surface)] xl:mr-80 pb-24">
                    <header className="mb-6 md:mb-12">
                        <div className="hidden md:block">
                            <h1 className="text-[1.75rem] font-medium tracking-tight text-[var(--hw-on-surface)] mb-2">My Learning Path</h1>
                            <p className="text-[var(--hw-on-surface-variant)] text-sm">
                                {role === "admin" ? "Admin View — All Assignments" : "Welcome back, " + (user.name?.split(" ")[0] ?? user.githubUsername)}
                            </p>
                        </div>

                        {/* Mobile 'CURRENT FOCUS' Banner */}
                        <div className="md:hidden bg-[var(--hw-primary)] rounded-xl p-5 shadow-lg shadow-[var(--hw-primary)]/20 text-white relative overflow-hidden">
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-indigo-900/20 rounded-full blur-xl" />
                            <div className="relative z-10">
                                <span className="text-[10px] font-bold tracking-widest uppercase text-white/70 mb-1 block">Current Focus</span>
                                <h2 className="text-[1.35rem] font-bold mb-1">{totalAssignments - submittedCount} Pending<br />Assignments</h2>
                                <p className="text-[13px] text-white/90">Keep the momentum going, {user.name?.split(" ")[0] || "Alex"}!</p>
                            </div>
                        </div>
                    </header>

                    {weeks.length === 0 ? (
                        <EmptyAssignments />
                    ) : (
                        <div className="space-y-16">
                            {weeks.map(([weekNum, { assignments: weekAssignments }]) => (
                                <section key={weekNum}>
                                    <div className="flex items-baseline gap-4 mb-6">
                                        <h2 className="text-xl font-medium text-[var(--hw-on-surface)]">Week {weekNum}</h2>
                                        <span className="h-px flex-1 bg-[var(--hw-surface-container-high)]" />
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {weekAssignments.map((a) => {
                                            const sub = submissionMap.get(a.id);
                                            const status = getSubmissionStatus(a, sub);

                                            return (
                                                <div
                                                    key={a.id}
                                                    className={`group bg-[var(--hw-surface-container-lowest)] p-6 rounded-xl shadow-[0_12px_40px_rgba(26,28,29,0.04)] hover:shadow-[0_12px_40px_rgba(26,28,29,0.08)] transition-all flex flex-col justify-between ${status.type === "due-soon"
                                                        ? "border-l-4 border-l-amber-400"
                                                        : status.type === "overdue"
                                                            ? "border-l-4 border-l-red-400"
                                                            : "border border-transparent hover:border-[var(--hw-outline-variant)]/20"
                                                        }`}
                                                >
                                                    <div>
                                                        <div className="flex justify-between items-start mb-4">
                                                            <span className="text-[0.6875rem] font-bold tracking-widest uppercase text-[var(--hw-outline)]">
                                                                LESSON {a.lesson}
                                                            </span>
                                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide flex items-center gap-1 ${status.type === "submitted"
                                                                ? "bg-emerald-50 text-emerald-700"
                                                                : status.type === "due-soon"
                                                                    ? "bg-amber-50 text-amber-700"
                                                                    : status.type === "overdue"
                                                                        ? "bg-red-50 text-red-700"
                                                                        : "bg-slate-100 text-slate-500"
                                                                }`}>
                                                                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: status.type === "submitted" ? "'FILL' 1" : undefined }}>
                                                                    {status.type === "submitted" ? "check_circle" : status.type === "due-soon" ? "priority_high" : status.type === "overdue" ? "error" : "radio_button_unchecked"}
                                                                </span>
                                                                {status.label}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-lg font-medium text-[var(--hw-on-surface)] mb-2">{a.title}</h3>
                                                        <p className="text-[var(--hw-on-surface-variant)] text-sm leading-relaxed mb-6">
                                                            {a.description || "No description provided."}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center justify-between text-[var(--hw-outline)] text-xs border-t border-[var(--hw-surface-container-low)] pt-4">
                                                        <span className={`flex items-center gap-1.5 ${status.type === "due-soon" ? "font-medium text-amber-600" : status.type === "overdue" ? "font-medium text-red-600" : ""
                                                            }`}>
                                                            <span className="material-symbols-outlined text-sm">
                                                                {status.type === "due-soon" || status.type === "overdue" ? "schedule" : "calendar_today"}
                                                            </span>
                                                            {formatDueDate(a.dueAt)}
                                                        </span>
                                                        {status.type === "submitted" ? (
                                                            <Link href={`/assignment/${a.id}`} className="text-[var(--hw-primary)] font-medium hover:underline">
                                                                View Grades
                                                            </Link>
                                                        ) : status.type === "due-soon" ? (
                                                            <Link href={`/assignment/${a.id}`} className="bg-[var(--hw-primary)] text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:brightness-110">
                                                                Start Work
                                                            </Link>
                                                        ) : (
                                                            <Link href={`/assignment/${a.id}`} className="text-[var(--hw-primary)] font-medium hover:underline">
                                                                View Details
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}
                </main>

                {/* ═══ STATS SIDEBAR ═══ */}
                <aside className="hidden xl:block w-80 p-8 border-l border-[var(--hw-surface-container-high)] bg-white/50 fixed right-0 top-16 h-[calc(100vh-64px)] overflow-y-auto">
                    <h3 className="text-xs font-bold tracking-widest text-[var(--hw-outline)] uppercase mb-8">Course Mastery</h3>

                    {/* Completion Stats */}
                    <div className="mb-10">
                        <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-4xl font-bold text-[var(--hw-on-surface)] tracking-tight">{completionPct}%</span>
                            <span className="text-xs font-medium text-emerald-600">
                                {submittedCount}/{totalAssignments} done
                            </span>
                        </div>
                        <p className="text-[var(--hw-on-surface-variant)] text-sm mb-4">Module Completion</p>
                        <div className="h-2 w-full bg-[var(--hw-surface-container-high)] rounded-full">
                            <div className="h-full bg-[var(--hw-primary)] rounded-full transition-all" style={{ width: `${completionPct}%` }} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* AI Tutor Suggestion */}
                        <div className="p-4 bg-[var(--hw-surface-container-low)] rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="material-symbols-outlined text-[var(--hw-primary)] text-xl">auto_awesome</span>
                                <span className="font-medium text-sm">AI Tutor Suggestion</span>
                            </div>
                            <p className="text-xs text-[var(--hw-on-surface-variant)] leading-relaxed">
                                {submittedCount === 0
                                    ? "Get started by submitting your first assignment to receive personalized learning recommendations."
                                    : `Great progress! You've completed ${submittedCount} assignment${submittedCount > 1 ? "s" : ""}. Keep up the momentum!`}
                            </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="p-4 bg-[var(--hw-primary)]/5 rounded-lg border border-[var(--hw-primary)]/10">
                            <h4 className="text-xs font-bold text-[var(--hw-primary)] mb-3">QUICK STATS</h4>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="flex flex-col items-center justify-center bg-white h-10 w-10 rounded shadow-sm">
                                        <span className="text-sm font-bold text-[var(--hw-on-surface)]">{totalAssignments}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[var(--hw-on-surface)]">Total Assignments</p>
                                        <p className="text-[10px] text-[var(--hw-outline)]">{weeks.length} week{weeks.length !== 1 ? "s" : ""}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex flex-col items-center justify-center bg-white h-10 w-10 rounded shadow-sm">
                                        <span className="text-sm font-bold text-emerald-600">{submittedCount}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[var(--hw-on-surface)]">Submitted</p>
                                        <p className="text-[10px] text-[var(--hw-outline)]">On time</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex flex-col items-center justify-center bg-white h-10 w-10 rounded shadow-sm">
                                        <span className="text-sm font-bold text-amber-600">{totalAssignments - submittedCount}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[var(--hw-on-surface)]">Pending</p>
                                        <p className="text-[10px] text-[var(--hw-outline)]">Not yet submitted</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* ═══ MOBILE BOTTOM NAV ═══ */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[var(--hw-surface-container-lowest)] border-t border-[var(--hw-outline-variant)]/20 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] h-[72px] flex items-center justify-around px-2 z-50">
                <Link href="/dashboard" className="flex flex-col items-center justify-center text-[var(--hw-primary)] gap-1 w-[22%] py-2 rounded-xl bg-[var(--hw-primary)]/5">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                    <span className="text-[9px] font-bold tracking-wider uppercase text-[var(--hw-primary)]">Dashboard</span>
                </Link>
                <Link href="#" className="flex flex-col items-center justify-center text-[var(--hw-outline)] gap-1 w-[22%] pb-2">
                    <span className="material-symbols-outlined text-[20px]">assignment</span>
                    <span className="text-[9px] font-bold tracking-wider uppercase">Tasks</span>
                </Link>
                <Link href="#" className="flex flex-col items-center justify-center text-[var(--hw-outline)] gap-1 w-[22%] pb-2">
                    <span className="material-symbols-outlined text-[20px]">groups</span>
                    <span className="text-[9px] font-bold tracking-wider uppercase">Students</span>
                </Link>
                <Link href="#" className="flex flex-col items-center justify-center text-[var(--hw-outline)] gap-1 w-[22%] pb-2">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                    <span className="text-[9px] font-bold tracking-wider uppercase">Profile</span>
                </Link>
            </nav>
        </div>
    );
}
