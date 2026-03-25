import { requireSession } from "@/lib/auth";
import { getCurrentUserRole } from "@/lib/roles";
import { WeekGroup } from "@/components/WeekGroup";
import Image from "next/image";
import Link from "next/link";
import { getAssignments, getSubmissionsByStudent } from "@/lib/google-sheets";
import { signOut } from "@/auth";
import type { Submission } from "@/types";
import EmptyAssignments from "@/components/EmptyAssignments";

export default async function DashboardPage() {
    await requireSession();
    const { role, session } = await getCurrentUserRole();
    const user = session!.user;

    // Fetch published assignments
    const allAssignments = await getAssignments();
    const assignments = allAssignments.filter((a) => a.published);

    // Fetch current user's submissions
    const userSubmissions = await getSubmissionsByStudent(user.githubUsername);
    const submissionMap = new Map<string, Submission>(
        userSubmissions.map((s) => [s.assignmentId, s])
    );

    // Group by week
    const weekMap = new Map<number, typeof assignments>();
    for (const a of assignments) {
        const list = weekMap.get(a.week) ?? [];
        list.push(a);
        weekMap.set(a.week, list);
    }
    const weeks = Array.from(weekMap.entries()).sort(([a], [b]) => a - b);

    return (
        <div className="min-h-screen flex bg-[var(--hw-surface)] text-[var(--hw-on-surface)] antialiased">
            {/* Sidebar */}
            <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 bg-slate-50 flex-col p-4 space-y-2 z-40">
                <div className="flex items-center px-4 py-6 space-x-3">
                    <div className="w-8 h-8 bg-[var(--hw-primary)] rounded-lg flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-[20px]">school</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-indigo-600 leading-none">HIT <span className="text-slate-800">AI/DATA</span></h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--hw-on-surface-variant)]/60 mt-1">
                            AI Workspace
                        </p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    <span className="flex items-center px-4 py-3 bg-white text-indigo-600 shadow-sm rounded-lg text-sm font-medium">
                        <span className="material-symbols-outlined mr-3">dashboard</span>
                        Overview
                    </span>
                    <Link href="#" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 hover:translate-x-1 transition-transform duration-200 text-sm font-medium">
                        <span className="material-symbols-outlined mr-3">assignment</span>
                        All Work
                    </Link>
                    {role === "admin" && (
                        <>
                            <Link href="#" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 hover:translate-x-1 transition-transform duration-200 text-sm font-medium">
                                <span className="material-symbols-outlined mr-3">group</span>
                                Students
                            </Link>
                            <Link href="#" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 hover:translate-x-1 transition-transform duration-200 text-sm font-medium">
                                <span className="material-symbols-outlined mr-3">menu_book</span>
                                Curriculum
                            </Link>
                            <Link href="#" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 hover:translate-x-1 transition-transform duration-200 text-sm font-medium">
                                <span className="material-symbols-outlined mr-3">monitoring</span>
                                Analytics
                            </Link>
                        </>
                    )}
                </nav>

                <div className="pt-4 border-t border-slate-200/50">
                    <Link href="#" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 text-sm font-medium">
                        <span className="material-symbols-outlined mr-3">help</span>
                        Help
                    </Link>
                    <form
                        action={async () => {
                            "use server";
                            await signOut({ redirectTo: "/login" });
                        }}
                    >
                        <button type="submit" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 text-sm font-medium w-full">
                            <span className="material-symbols-outlined mr-3">logout</span>
                            Logout
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="md:ml-64 min-h-screen pb-24 md:pb-12 bg-[var(--hw-surface)] flex-1">
                {/* Top Bar */}
                <header className="fixed top-0 right-0 left-0 md:left-64 z-30 bg-white/80 backdrop-blur-md shadow-sm flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-8">
                        <span className="text-xl font-bold tracking-tight">HIT <span className="text-indigo-600">AI/DATA</span></span>
                        <div className="hidden md:flex items-center gap-6">
                            <span className="text-indigo-600 font-semibold border-b-2 border-indigo-600">Dashboard</span>
                            <Link href="#" className="text-slate-500 hover:text-slate-900 transition-colors">Assignments</Link>
                            <Link href="#" className="text-slate-500 hover:text-slate-900 transition-colors">Classroom</Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {role === "admin" && (
                            <Link
                                href="/admin/create-assignment"
                                className="hidden md:flex items-center gap-2 px-4 py-2 bg-[var(--hw-primary)] text-white font-medium rounded-lg hover:brightness-110 transition-all text-sm"
                            >
                                <span className="material-symbols-outlined text-lg">add</span>
                                New Assignment
                            </Link>
                        )}
                        <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-all">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-all">
                            <span className="material-symbols-outlined">settings</span>
                        </button>
                        <div className="flex items-center gap-2">
                            {user.image && (
                                <Image
                                    src={user.image}
                                    alt={user.name ?? "Avatar"}
                                    width={32}
                                    height={32}
                                    className="rounded-full border border-[var(--hw-outline-variant)]/50"
                                />
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="pt-20 px-6 max-w-5xl mx-auto">
                    {/* Welcome Header */}
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold tracking-tight mb-2">
                            Welcome back, {user.name?.split(" ")[0] ?? user.githubUsername}
                        </h2>
                        <p className="text-[var(--hw-on-surface-variant)]">
                            {role === "admin" ? "Manage your classroom and assignments" : "Track your assignments and progress"}
                        </p>
                        <div className="mt-3">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${role === "admin"
                                ? "bg-[var(--hw-primary-fixed)] text-[var(--hw-on-primary-fixed)]"
                                : "bg-emerald-100 text-emerald-800"
                                }`}>
                                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    {role === "admin" ? "shield_person" : "school"}
                                </span>
                                {role === "admin" ? "Admin / Giáo viên" : "Học viên"}
                            </span>
                        </div>
                    </div>

                    {/* Assignments or Empty State */}
                    {weeks.length === 0 ? (
                        <EmptyAssignments />
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
                </div>
            </main>
        </div>
    );
}
