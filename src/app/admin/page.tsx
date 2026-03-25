import Link from "next/link";
import { getCurrentUserRole } from "@/lib/roles";
import { AdminAssignmentCard } from "@/components/AdminAssignmentCard";
import { redirect } from "next/navigation";
import { getAssignments, getSubmissionsByAssignment, getStudents } from "@/lib/google-sheets";

export default async function AdminDashboardPage() {
    const { role, session } = await getCurrentUserRole();
    if (role !== "admin" || !session) redirect("/dashboard");

    const allStudents = await getStudents();
    const activeStudents = allStudents.filter((s) => s.active);
    const assignments = await getAssignments();

    const sortedAssignments = [...assignments].sort(
        (a, b) => b.week - a.week || b.lesson - a.lesson
    );

    // Calculate metrics
    let totalSubmissionsCount = 0;
    const allAssignmentsWithSubmissions = await Promise.all(
        sortedAssignments.map(async (a) => {
            const subs = await getSubmissionsByAssignment(a.id);
            totalSubmissionsCount += subs.length;
            const submittedUsernames = new Set(subs.map(s => s.githubUsername));
            return {
                assignment: a,
                submissions: subs,
                missingStudents: activeStudents.filter((s) => !submittedUsernames.has(s.githubUsername))
            };
        })
    );

    const activeAssignmentsCount = assignments.filter((a) => a.published).length;
    const maxPossibleSubmissions = assignments.length * activeStudents.length;

    // EMPTY STATE
    if (assignments.length === 0) {
        return (
            <main className="p-8 max-w-5xl mx-auto min-h-[calc(100vh-56px)] mt-14 pb-20 overflow-y-auto">
                <div className="max-w-3xl mx-auto flex flex-col items-center justify-center text-center mt-32">
                    <div className="w-64 h-48 relative mb-8 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center justify-center gap-6 opacity-60">
                            <div className="w-24 h-24 bg-slate-100 rounded-[2rem] rotate-[-12deg]" />
                            <div className="w-24 h-24 bg-slate-100 rounded-[2rem] rotate-[12deg]" />
                        </div>
                        <div className="w-28 h-28 bg-white rounded-3xl shadow-xl border border-slate-100 flex items-center justify-center relative z-10 transition-transform hover:scale-105 duration-300">
                            <span className="material-symbols-outlined text-[48px] text-indigo-600">assignment_add</span>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">No assignments created yet</h2>
                    <p className="text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
                        Your workspace is quiet. Start by generating an AI-assisted assignment or importing one from your resources.
                    </p>

                    <div className="flex gap-4">
                        <Link
                            href="/admin/create-assignment"
                            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-indigo-600/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            Create your first assignment
                        </Link>
                        <button className="bg-slate-100 text-slate-700 font-medium px-6 py-3 rounded-xl hover:bg-slate-200 transition-colors">
                            Import from Resources
                        </button>
                    </div>

                    <div className="mt-16 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">QUICK START TIP</p>
                        <p className="text-xs text-slate-400 italic">Try using the AI Module Generator to draft a complete assignment syllabus in seconds.</p>
                    </div>
                </div>
            </main>
        );
    }

    // ACTIVE STATE
    return (
        <main className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto md:mt-14 pb-24 md:pb-20 overflow-y-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 md:mb-8">
                <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 mb-1">Analytics Overview</p>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Assignment Dashboard</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-50 shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                        Week 12 (Current)
                    </button>
                    <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-50 shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">filter_list</span>
                        Filter
                    </button>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white border text-sm border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">ACTIVE ASSIGNMENTS</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-slate-900 tracking-tight">{activeAssignmentsCount}</span>
                        <span className="text-xs font-semibold text-emerald-500">+2 from last week</span>
                    </div>
                </div>
                <div className="bg-white border text-sm border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">TOTAL SUBMISSIONS</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-slate-900 tracking-tight">{totalSubmissionsCount}</span>
                        <span className="text-xs font-semibold text-slate-400">/ {maxPossibleSubmissions} total</span>
                    </div>
                </div>
                <div className="bg-white border text-sm border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">AVERAGE SCORE</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-slate-900 tracking-tight">88.4%</span>
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Top 5% of labs</span>
                    </div>
                </div>
            </div>

            {/* Assignment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {allAssignmentsWithSubmissions.map(({ assignment, submissions, missingStudents }) => (
                    <AdminAssignmentCard
                        key={assignment.id}
                        assignment={assignment}
                        submissions={submissions}
                        totalStudents={activeStudents.length}
                        missingStudents={missingStudents}
                    />
                ))}

                {/* New Assignment Card (Desktop Only) */}
                <Link href="/admin/create-assignment" className="hidden md:flex border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-xl p-6 flex-col items-center justify-center text-center h-[240px] hover:border-indigo-400 hover:bg-indigo-50/70 transition-colors group">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-sm mb-4 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[24px]">add</span>
                    </div>
                    <span className="font-semibold text-indigo-900 text-sm mb-1">New Assignment</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">Expand your curriculum</span>
                </Link>
            </div>

            {/* Bottom Visuals Overlay (Mockup for detailed class performance) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-50 border text-sm border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-8">
                        <span className="material-symbols-outlined text-indigo-600 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>bar_chart</span>
                        <h3 className="font-semibold text-slate-900">Detailed Class Performance</h3>
                    </div>
                    <div className="h-48 flex items-end justify-between px-4 pb-2 border-b border-slate-200/50 mb-6 gap-2">
                        {/* Mock Chart Bars */}
                        <div className="w-1/5 bg-indigo-200 rounded-t-lg h-[40%]" title="W8" />
                        <div className="w-1/5 bg-indigo-300 rounded-t-lg h-[60%]" title="W9" />
                        <div className="w-1/5 bg-indigo-200 rounded-t-lg h-[35%]" title="W10" />
                        <div className="w-1/5 bg-indigo-200 rounded-t-lg h-[75%]" title="W11" />
                        <div className="w-1/5 bg-indigo-600 rounded-t-lg h-[55%]" title="W12" />
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <p className="text-slate-500">Class average is 4.2% higher than the institutional baseline.</p>
                        <button className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1">
                            Download Report <span className="material-symbols-outlined text-[14px]">file_download</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white border text-sm border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-6">Urgent Actions</h3>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-red-50/50 rounded-xl border border-red-100">
                            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[16px]">mail</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-slate-900">5 Students Unreachable</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">Lesson 3 follow-up required.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-slate-900">12 Assignments to Grade</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">Quantum Algorithms Lab.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-slate-900">Weekly Module Ready</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">Draft approved by AI Curator.</p>
                            </div>
                        </div>
                    </div>

                    <button className="w-full mt-6 py-2 bg-white border border-slate-200 text-xs font-bold text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                        Manage Assistant Settings
                    </button>
                </div>
            </div>

            {/* Mobile FAB */}
            <div className="md:hidden fixed bottom-[88px] right-4 z-40">
                <Link href="/admin/create-assignment" className="w-[52px] h-[52px] bg-[var(--hw-primary)] active:brightness-90 text-white rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(70,72,212,0.35)] transition-transform active:scale-95 border border-white/20">
                    <span className="material-symbols-outlined text-[26px]">add</span>
                </Link>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[var(--hw-surface-container-lowest)] border-t border-[var(--hw-outline-variant)]/20 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] h-[72px] flex items-center justify-around px-2 z-50">
                <Link href="/admin" className="flex flex-col items-center justify-center text-[var(--hw-primary)] gap-1 w-[22%] py-2 rounded-xl bg-[var(--hw-primary)]/5">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                    <span className="text-[9px] font-bold tracking-wider uppercase text-[var(--hw-primary)]">Dashboard</span>
                </Link>
                <Link href="#" className="flex flex-col items-center justify-center text-[var(--hw-outline)] gap-1 w-[22%] pb-2">
                    <span className="material-symbols-outlined text-[20px]">groups</span>
                    <span className="text-[9px] font-bold tracking-wider uppercase">Students</span>
                </Link>
                <Link href="#" className="flex flex-col items-center justify-center text-[var(--hw-outline)] gap-1 w-[22%] pb-2">
                    <span className="material-symbols-outlined text-[20px]">grading</span>
                    <span className="text-[9px] font-bold tracking-wider uppercase">Grading</span>
                </Link>
                <Link href="#" className="flex flex-col items-center justify-center text-[var(--hw-outline)] gap-1 w-[22%] pb-2">
                    <span className="material-symbols-outlined text-[20px]">settings</span>
                    <span className="text-[9px] font-bold tracking-wider uppercase">Settings</span>
                </Link>
            </nav>
        </main>
    );
}
