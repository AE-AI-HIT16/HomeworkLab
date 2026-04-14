import Link from "next/link";
import type { Assignment, Submission, Student } from "@/types";

interface AdminAssignmentCardProps {
    assignment: Assignment;
    submissions: Submission[];
    totalStudents: number;
    missingStudents: Student[];
}

function formatDate(iso?: string): string {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function AdminAssignmentCard({
    assignment,
    submissions,
    totalStudents,
    missingStudents,
}: AdminAssignmentCardProps) {
    const submittedCount = submissions.length;
    const isPastDue = assignment.dueAt ? new Date(assignment.dueAt) < new Date() : false;

    // Determine card state logic similar to the Figma designs
    const progressPercent = totalStudents > 0 ? (submittedCount / totalStudents) * 100 : 0;
    const isLowSubmissions = isPastDue && progressPercent < 50 && assignment.published;

    if (!assignment.published) {
        return (
            <div className="bg-white border text-sm border-slate-200 rounded-xl p-6 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-slate-200" />
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 bg-slate-100 px-2 py-0.5 rounded">DRAFT</span>
                </div>
                <h3 className="font-semibold text-base text-slate-900 leading-snug mb-2">
                    {assignment.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-3 mb-6 flex-1">
                    {assignment.description || "No description provided."}
                </p>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        Last edited recently
                    </span>
                    <Link href={`/admin/assignments/${assignment.id}`} className="text-xs font-semibold text-[var(--hw-primary)] hover:text-[var(--hw-on-primary-fixed)] transition-colors flex items-center gap-1">
                        Resume <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                </div>
            </div>
        );
    }

    if (isLowSubmissions) {
        return (
            <div className="bg-white border text-sm border-red-100 rounded-xl p-6 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-400" />
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-red-600 bg-red-50 flex items-center gap-1 px-2 py-0.5 rounded">
                        <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                        LOW SUBMISSIONS
                    </span>
                </div>
                <h3 className="font-semibold text-base text-slate-900 leading-snug mb-3">
                    {assignment.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-6">
                    {assignment.description || "Review submission statistics."}
                </p>

                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                        <span>Missing Students</span>
                        <span>{missingStudents.length}/{totalStudents}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${progressPercent}%` }} />
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-red-600">
                        NEEDS ATTENTION
                    </span>
                    <Link
                        href={`/admin/assignments/${assignment.id}`}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                        Review Missing List
                    </Link>
                </div>
            </div>
        );
    }

    // Default Published Grid Card
    return (
        <div className="bg-white border text-sm border-slate-200 rounded-xl p-5 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden group">
            {isPastDue && !isLowSubmissions && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400" />}

            <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    Week {assignment.week} - Lesson {assignment.lesson}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Published
                </span>
            </div>

            <Link href={`/admin/assignments/${assignment.id}`} className="font-semibold text-[15px] text-slate-900 leading-snug hover:text-[var(--hw-primary)] transition-colors mb-2 block min-h-[44px]">
                {assignment.title}
            </Link>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-6 font-medium border-b border-slate-100 pb-4">
                <span className="material-symbols-outlined text-[14px]">event</span>
                Due {formatDate(assignment.dueAt)}
            </div>

            <div className="mt-auto">
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Submission Progress</span>
                    <span>{submittedCount}/{totalStudents}</span>
                </div>

                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                    <div
                        className={`h-full rounded-full transition-all ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-[var(--hw-primary)]'}`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${progressPercent === 100 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {progressPercent === 100 ? 'COMPLETED' : isPastDue ? 'GRADING IN PROGRESS' : 'ACTIVE'}
                    </span>
                    <Link href={`/admin/assignments/${assignment.id}`} className="text-[11px] font-bold text-[var(--hw-primary)] hover:text-[var(--hw-on-primary-fixed)] transition-colors">
                        View All
                    </Link>
                </div>
            </div>
        </div>
    );
}
