import { requireSession } from "@/lib/auth";
import { getCurrentUserRole } from "@/lib/roles";
import { getAssignmentById, getSubmission } from "@/lib/google-sheets";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SubmissionForm } from "@/components/SubmissionForm";

interface AssignmentPageProps {
    params: Promise<{ id: string }>;
}

function formatDate(iso?: string): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatDateTime(iso?: string): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export default async function AssignmentPage({ params }: AssignmentPageProps) {
    const { id } = await params;
    const session = await requireSession();
    const { role } = await getCurrentUserRole();
    const user = session.user;

    const assignment = await getAssignmentById(id);
    if (!assignment || !assignment.published) {
        notFound();
    }

    const submission = await getSubmission(id, user.githubUsername);
    const isPastDue = assignment.dueAt ? new Date(assignment.dueAt) < new Date() : false;
    const isSubmitted = !!submission;
    const isLate = submission?.isLate ?? false;
    const submissionType = submission?.type; // "file" | "repo_link"

    return (
        <div className="min-h-screen bg-[var(--hw-surface)] text-[var(--hw-on-surface)] antialiased">
            {/* ═══ TOP NAV ═══ */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm h-14 flex items-center justify-between px-6">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[var(--hw-primary)] rounded-md flex items-center justify-center text-white">
                            <span className="material-symbols-outlined text-[14px]">school</span>
                        </div>
                        <span className="text-lg font-bold tracking-tight">HIT <span className="text-indigo-600">AI/DATA</span></span>
                    </div>
                    <div className="hidden md:flex items-center gap-6 text-sm">
                        <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 transition-colors">Dashboard</Link>
                        <span className="text-indigo-600 font-semibold border-b-2 border-indigo-600 pb-0.5">Curriculum</span>
                        <Link href="#" className="text-slate-500 hover:text-slate-900 transition-colors">Resources</Link>
                        <Link href="#" className="text-slate-500 hover:text-slate-900 transition-colors">Settings</Link>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="text-slate-500 hover:text-indigo-500 transition-colors">
                        <span className="material-symbols-outlined text-xl">notifications</span>
                    </button>
                    <button className="text-slate-500 hover:text-indigo-500 transition-colors">
                        <span className="material-symbols-outlined text-xl">help_outline</span>
                    </button>
                    {user.image && (
                        <Image src={user.image} alt={user.name ?? "Avatar"} width={28} height={28} className="rounded-full border border-[var(--hw-surface-container-high)]" />
                    )}
                </div>
            </nav>

            <div className="flex pt-14">
                {/* ═══ LEFT SIDEBAR — Curriculum Nav ═══ */}
                <aside className="fixed left-0 h-[calc(100vh-56px)] w-56 bg-slate-50 flex-col p-4 text-sm hidden md:flex">
                    <div className="mb-6 px-2">
                        <h2 className="text-base font-semibold text-[var(--hw-on-surface)]">Curriculum</h2>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-0.5">AI Foundations 2024</p>
                    </div>
                    <nav className="flex-1 space-y-1">
                        <Link href="#" className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg hover:translate-x-1 transition-transform">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Introduction to LLMs
                        </Link>
                        <span className="flex items-center gap-2 px-3 py-2 bg-white text-indigo-600 shadow-sm rounded-lg font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            Prompt Engineering
                        </span>
                        <Link href="#" className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg hover:translate-x-1 transition-transform">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            Neural Architectures
                        </Link>
                        <Link href="#" className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg hover:translate-x-1 transition-transform">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            Ethics in AI
                        </Link>
                        <Link href="#" className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg hover:translate-x-1 transition-transform">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            Final Capstone
                        </Link>
                    </nav>

                    {isSubmitted && (
                        <div className="mt-auto">
                            <Link href="/dashboard" className="w-full flex items-center justify-center gap-2 bg-[var(--hw-primary)] text-white py-2.5 rounded-lg font-medium shadow-sm hover:brightness-110 active:scale-[0.98] transition-all text-sm">
                                <span className="material-symbols-outlined text-lg">trending_up</span>
                                View Progress
                            </Link>
                        </div>
                    )}

                    <div className="pt-4 space-y-1 mt-auto">
                        <Link href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                            <span className="material-symbols-outlined text-lg">support</span>
                            Support
                        </Link>
                        <Link href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                            <span className="material-symbols-outlined text-lg">inventory_2</span>
                            Archive
                        </Link>
                    </div>
                </aside>

                {/* ═══ MAIN CONTENT ═══ */}
                <main className="ml-0 md:ml-56 w-full p-8 min-h-screen bg-[var(--hw-surface)] xl:mr-80">
                    {/* Breadcrumb */}
                    <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--hw-outline)] mb-4">
                        Week {assignment.week} → Lesson {assignment.lesson}
                    </div>

                    {/* Title + Status */}
                    <h1 className="text-3xl font-medium tracking-tight text-[var(--hw-on-surface)] mb-4">{assignment.title}</h1>

                    <div className="flex items-center gap-3 mb-8">
                        {isSubmitted ? (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${isLate
                                ? "bg-amber-50 text-amber-700"
                                : "bg-emerald-50 text-emerald-700"
                                }`}>
                                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    {isLate ? "schedule" : "check_circle"}
                                </span>
                                {isLate ? "Late Submission" : "Submitted"}
                            </span>
                        ) : isPastDue ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 bg-red-50 text-red-700">
                                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                                Overdue
                            </span>
                        ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 bg-[var(--hw-primary-fixed)] text-[var(--hw-on-primary-fixed)]">
                                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                                AI Engineering
                            </span>
                        )}
                        {!isSubmitted && (
                            <span className="text-xs text-[var(--hw-outline)]">
                                {assignment.dueAt ? `Due: ${formatDate(assignment.dueAt)}` : "No deadline"}
                            </span>
                        )}
                        {isSubmitted && submission?.submittedAt && (
                            <span className="text-xs text-[var(--hw-outline)]">
                                Assignment due {formatDate(assignment.dueAt)}, {formatDateTime(submission.submittedAt)}
                            </span>
                        )}
                    </div>

                    {/* Assignment Brief */}
                    <section className="mb-12">
                        <h2 className="text-lg font-medium text-[var(--hw-on-surface)] mb-4">
                            {isSubmitted ? "Assignment Overview" : "Assignment Brief"}
                        </h2>
                        <div className="bg-[var(--hw-surface-container-lowest)] p-6 rounded-xl shadow-[0_12px_40px_rgba(26,28,29,0.04)]">
                            <p className="text-[var(--hw-on-surface-variant)] leading-relaxed mb-6">
                                {assignment.description || "No description provided for this assignment."}
                            </p>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-[var(--hw-primary)] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                <span className="font-medium text-sm">Key Requirements</span>
                            </div>
                            <ul className="space-y-2 text-sm text-[var(--hw-on-surface-variant)] ml-8 list-disc">
                                <li>Complete the assigned tasks following the provided guidelines.</li>
                                <li>Submit all required files or repository links before the deadline.</li>
                                <li>Ensure your submission includes documentation where applicable.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Assignment Submission Module */}
                    <section className="mb-12">
                        <h2 className="text-lg font-medium text-[var(--hw-on-surface)] mb-4">
                            Assignment Submission
                        </h2>
                        <SubmissionForm
                            assignmentId={assignment.id}
                            existingSubmission={submission ?? undefined}
                            isPastDue={isPastDue}
                        />
                    </section>

                    {/* Resources */}
                    {assignment.promptFiles.length > 0 && (
                        <section className="mb-12">
                            <h2 className="text-lg font-medium text-[var(--hw-on-surface)] mb-4">Resources</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {assignment.promptFiles.map((file, i) => (
                                    <a
                                        key={i}
                                        href={`https://drive.google.com/file/d/${file.driveFileId}/view`}
                                        target="_blank"
                                        rel="noopener"
                                        className="flex items-center gap-3 p-4 bg-[var(--hw-surface-container-lowest)] rounded-xl shadow-[0_12px_40px_rgba(26,28,29,0.04)] hover:shadow-[0_12px_40px_rgba(26,28,29,0.08)] transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-[var(--hw-primary)]/10 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-[var(--hw-primary)]">description</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{file.name}</p>
                                            <p className="text-[10px] text-[var(--hw-outline)]">
                                                {file.mimeType ?? "Document"}
                                            </p>
                                        </div>
                                        <span className="material-symbols-outlined text-[var(--hw-outline)] group-hover:text-[var(--hw-primary)] transition-colors">download</span>
                                    </a>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Instructor Notes (submitted state) */}
                    {isSubmitted && submission?.feedback && (
                        <section className="mb-12">
                            <h2 className="text-lg font-medium text-[var(--hw-on-surface)] mb-4">Instructor&apos;s Notes</h2>
                            <div className="bg-[var(--hw-surface-container-lowest)] p-6 rounded-xl shadow-[0_12px_40px_rgba(26,28,29,0.04)] border-l-4 border-l-[var(--hw-primary)]">
                                <p className="text-sm text-[var(--hw-on-surface-variant)] leading-relaxed italic">
                                    &ldquo;{submission.feedback}&rdquo;
                                </p>
                            </div>
                        </section>
                    )}
                </main>

                {/* ═══ RIGHT SIDEBAR ═══ */}
                <aside className="hidden xl:block w-80 p-6 border-l border-[var(--hw-surface-container-high)] bg-white/50 fixed right-0 top-14 h-[calc(100vh-56px)] overflow-y-auto">
                    {isSubmitted ? (
                        /* ═══ SUBMITTED STATE: Sidebar ═══ */
                        <div className="space-y-6">
                            {/* Assignment Brief condensed */}
                            <div>
                                <h3 className="text-xs font-bold tracking-widest text-[var(--hw-outline)] uppercase mb-4">Assignment Brief</h3>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2 text-xs text-[var(--hw-on-surface-variant)]">
                                        <span className="material-symbols-outlined text-[var(--hw-primary)] text-[14px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        Complete all required tasks
                                    </li>
                                    <li className="flex items-start gap-2 text-xs text-[var(--hw-on-surface-variant)]">
                                        <span className="material-symbols-outlined text-[var(--hw-primary)] text-[14px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        Include documentation
                                    </li>
                                    <li className="flex items-start gap-2 text-xs text-[var(--hw-on-surface-variant)]">
                                        <span className="material-symbols-outlined text-[var(--hw-primary)] text-[14px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        Follow submission guidelines
                                    </li>
                                </ul>
                            </div>

                            {/* Performance */}
                            <div className="p-4 bg-[var(--hw-surface-container-low)] rounded-lg">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--hw-outline)] mb-3">Your Performance</h4>
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-2xl font-bold">{submission?.grade ?? "—"}</span>
                                    <span className="text-xs text-[var(--hw-outline)]">/ 100</span>
                                </div>
                                <div className="h-2 w-full bg-[var(--hw-surface-container-high)] rounded-full">
                                    <div className="h-full bg-[var(--hw-primary)] rounded-full transition-all" style={{ width: `${submission?.grade ?? 0}%` }} />
                                </div>
                            </div>

                            {/* Grading Status */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--hw-outline)] mb-3">Grading</h4>
                                <p className="text-xs text-[var(--hw-on-surface-variant)]">
                                    {submission?.grade !== undefined
                                        ? "Grading complete."
                                        : "Instructor feedback typically arrives within 48 hours of the submission deadline."}
                                </p>
                                <span className={`mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold ${submission?.grade !== undefined ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                                    }`}>
                                    {submission?.grade !== undefined ? "Graded" : "Pending"}
                                </span>
                            </div>
                        </div>
                    ) : (
                        /* ═══ NOT SUBMITTED STATE: Sidebar ═══ */
                        <div className="space-y-6">
                            {/* Due Date & Points */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-[var(--hw-surface-container-lowest)] rounded-lg shadow-sm">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--hw-outline)] mb-1">Due Date</p>
                                    <p className="text-sm font-medium">{formatDate(assignment.dueAt)}</p>
                                </div>
                                <div className="p-4 bg-[var(--hw-surface-container-lowest)] rounded-lg shadow-sm">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--hw-outline)] mb-1">Points</p>
                                    <p className="text-sm font-medium">100 / 100</p>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                <span className={`text-sm font-medium ${isPastDue ? "text-red-600" : "text-amber-600"}`}>
                                    {isPastDue ? "Overdue" : "Not Submitted"}
                                </span>
                            </div>

                            <div className="mb-6">

                                {/* Grading Rubric */}
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--hw-outline)] mb-3">Grading Rubric</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-[var(--hw-on-surface-variant)]">Completeness</span>
                                            <span className="font-medium">40 pts</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-[var(--hw-on-surface-variant)]">Code Quality</span>
                                            <span className="font-medium">30 pts</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-[var(--hw-on-surface-variant)]">Documentation</span>
                                            <span className="font-medium">20 pts</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-[var(--hw-on-surface-variant)]">Format Compliance</span>
                                            <span className="font-medium">10 pts</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </aside>
            </div>

            {/* ═══ MOBILE BOTTOM NAV ═══ */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.05)] h-16 flex items-center justify-around px-4 z-50">
                <Link href="/dashboard" className="flex flex-col items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined">dashboard</span>
                    <span className="text-[10px] font-medium mt-1">Home</span>
                </Link>
                <span className="flex flex-col items-center justify-center text-indigo-600">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
                    <span className="text-[10px] font-medium mt-1">Curriculum</span>
                </span>
                <Link href="#" className="flex flex-col items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined">local_library</span>
                    <span className="text-[10px] font-medium mt-1">Library</span>
                </Link>
                <Link href="#" className="flex flex-col items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined">psychology</span>
                    <span className="text-[10px] font-medium mt-1">AI Tutor</span>
                </Link>
            </nav>
        </div>
    );
}
