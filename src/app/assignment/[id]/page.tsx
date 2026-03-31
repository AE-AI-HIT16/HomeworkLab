import { requireSession } from "@/lib/auth";
import { getCurrentUserRole } from "@/lib/roles";
import { getAssignmentById, getSubmission } from "@/lib/google-sheets";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SubmissionForm } from "@/components/SubmissionForm";
import { QuizForm } from "@/components/QuizForm";
import { NotebookPreview } from "@/components/NotebookPreview";
import { TopNav } from "@/components/TopNav";

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

/**
 * Helper to translate legacy Vietnamese resource names
 */
function translateResourceName(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes("link đề bài") || lower.includes("tài liệu")) return "🔗 Assignment Drive Link";
    if (lower === "de-bai") return "Course Materials";
    if (lower === "nop-bai") return "Student Submissions";
    return name;
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

    return (
        <div className="min-h-screen bg-[var(--hw-surface)] flex flex-col font-sans antialiased">
            <TopNav
                user={{
                    name: session.user.name,
                    email: session.user.email,
                    image: session.user.image,
                    githubUsername: session.user.githubUsername
                }}
                role={role}
                showSearch={false}
            />

            <div className="flex pt-16">
                {/* ═══ SIDEBAR ═══ */}
                <aside className="fixed left-0 h-[calc(100vh-64px)] w-56 bg-slate-50 flex-col p-4 text-sm hidden md:flex border-r border-slate-100">
                    <div className="mb-6 px-2">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 bg-[var(--hw-primary)] rounded-md flex items-center justify-center text-white">
                                <span className="material-symbols-outlined text-[14px]">school</span>
                            </div>
                            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">HIT AI/DATA</h2>
                        </div>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Week {assignment.week} • Lesson {assignment.lesson}</p>
                    </div>
                    <nav className="flex-1 space-y-1">
                        <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg hover:translate-x-1 transition-transform">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Back to Dashboard
                        </Link>
                        <span className="flex items-center gap-2 px-3 py-2 bg-[var(--hw-primary-fixed)] text-[var(--hw-primary)] shadow-sm rounded-lg font-semibold border border-[var(--hw-primary-fixed-dim)]/50">
                            <span className="material-symbols-outlined text-lg">{isSubmitted ? "check_circle" : "assignment"}</span>
                            {isSubmitted ? "Submitted" : "Not Submitted"}
                        </span>
                    </nav>

                    <div className="mt-auto px-2 pb-4">
                        <div className="p-4 bg-[var(--hw-primary-fixed)]/50 rounded-xl border border-[var(--hw-primary-fixed-dim)] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-200 rounded-full blur-xl opacity-30 -mr-6 -mt-6" />
                            <p className="text-[10px] font-bold text-indigo-800 uppercase mb-1 relative z-10">Performance</p>
                            <p className="text-xs text-[var(--hw-primary)] font-medium relative z-10">
                                {isSubmitted ? "Check your grades on the dashboard." : "Complete this task to improve your score."}
                            </p>
                        </div>
                    </div>
                </aside>

                {/* ═══ MAIN CONTENT ═══ */}
                <main className="ml-0 md:ml-56 w-full min-w-0 overflow-hidden p-4 sm:p-6 md:p-8 min-h-screen bg-[var(--hw-surface)] xl:mr-80 pb-32 md:pb-8">
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
                        {role === "admin" && (
                            <Link
                                href={`/admin/assignments/${id}`}
                                className="ml-auto flex items-center gap-1.5 text-xs font-bold text-[var(--hw-primary)] hover:text-[var(--hw-on-primary-fixed)] transition-colors bg-[var(--hw-primary-fixed)] px-3 py-1.5 rounded-lg border border-[var(--hw-primary-fixed-dim)]"
                            >
                                <span className="material-symbols-outlined text-[16px]">grading</span>
                                Grade this Assignment
                            </Link>
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
                            {assignment.assignmentType === "quiz" ? "Quiz — Trắc nghiệm" : "Assignment Submission"}
                        </h2>
                        {role === "guest" ? (
                            <div className="bg-white rounded-xl shadow-sm border border-teal-200 p-6 flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined">visibility</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 text-sm mb-1">Chế độ Khách mời</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Bạn đang xem bài tập với tư cách khách mời và không thể nộp bài. 
                                        Liên hệ giảng viên để được nâng cấp lên quyền Học sinh.
                                    </p>
                                </div>
                            </div>
                        ) : assignment.assignmentType === "quiz" && assignment.quizData ? (
                            <QuizForm
                                assignmentId={assignment.id}
                                questions={assignment.quizData}
                                existingSubmission={submission ?? undefined}
                                isPastDue={isPastDue}
                            />
                        ) : (
                            <SubmissionForm
                                assignmentId={assignment.id}
                                existingSubmission={submission ?? undefined}
                                isPastDue={isPastDue}
                            />
                        )}
                    </section>

                    {/* Resources */}
                    {assignment.promptFiles.length > 0 && (
                        <section className="mb-12">
                            <h2 className="text-lg font-medium text-[var(--hw-on-surface)] mb-4">Resources</h2>
                            <div className="space-y-3">
                                {assignment.promptFiles.map((file, i) => {
                                    const ext = file.name.split(".").pop()?.toLowerCase();
                                    const isNotebook = ext === "ipynb";
                                    const isExternalLink = file.mimeType === "text/uri-list" || file.name === "🔗 Assignment Drive Link";

                                    if (isNotebook) {
                                        return (
                                            <NotebookPreview
                                                key={i}
                                                driveFileId={file.driveFileId}
                                                name={file.name}
                                            />
                                        );
                                    }

                                    // External Link
                                    if (isExternalLink) {
                                        const href = file.driveFileId.startsWith("http")
                                            ? file.driveFileId
                                            : `https://drive.google.com/drive/folders/${file.driveFileId}`;

                                        return (
                                            <a
                                                key={i}
                                                href={href}
                                                target="_blank"
                                                rel="noopener"
                                                className="flex items-center gap-3 p-4 bg-orange-50/50 rounded-xl shadow-[0_12px_40px_rgba(26,28,29,0.04)] hover:shadow-[0_12px_40px_rgba(26,28,29,0.08)] transition-all group border border-orange-100"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                                                    <span className="material-symbols-outlined text-orange-600">link</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-orange-900 truncate">{translateResourceName(file.name)}</p>
                                                    <p className="text-[10px] text-orange-600/70 uppercase">
                                                        External Link
                                                    </p>
                                                </div>
                                                <span className="material-symbols-outlined text-orange-400 group-hover:text-orange-600 transition-colors">open_in_new</span>
                                            </a>
                                        );
                                    }

                                    // PDF / DOCX / ZIP — Drive link card
                                    const iconMap: Record<string, string> = {
                                        pdf: "picture_as_pdf",
                                        docx: "article",
                                        zip: "folder_zip",
                                    };
                                    const colorMap: Record<string, string> = {
                                        pdf: "text-red-500",
                                        docx: "text-blue-500",
                                        zip: "text-purple-500",
                                    };
                                    const icon = iconMap[ext ?? ""] ?? "description";
                                    const color = colorMap[ext ?? ""] ?? "text-[var(--hw-primary)]";

                                    return (
                                        <a
                                            key={i}
                                            href={`https://drive.google.com/file/d/${file.driveFileId}/view`}
                                            target="_blank"
                                            rel="noopener"
                                            className="flex items-center gap-3 p-4 bg-[var(--hw-surface-container-lowest)] rounded-xl shadow-[0_12px_40px_rgba(26,28,29,0.04)] hover:shadow-[0_12px_40px_rgba(26,28,29,0.08)] transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-[var(--hw-surface-container-low)] flex items-center justify-center flex-shrink-0">
                                                <span className={`material-symbols-outlined ${color}`}>{icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{file.name}</p>
                                                <p className="text-[10px] text-[var(--hw-outline)] uppercase">
                                                    {ext ?? file.mimeType ?? "Document"}
                                                </p>
                                            </div>
                                            <span className="material-symbols-outlined text-[var(--hw-outline)] group-hover:text-[var(--hw-primary)] transition-colors">download</span>
                                        </a>
                                    );
                                })}
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
        </div>
    );
}
