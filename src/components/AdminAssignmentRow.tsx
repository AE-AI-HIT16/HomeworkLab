import Link from "next/link";
import type { Assignment, Submission } from "@/types";
import type { Student } from "@/types";

interface AdminAssignmentRowProps {
    assignment: Assignment;
    submissions: Submission[];
    totalStudents: number;
    missingStudents: Student[];
}

function formatDate(iso?: string): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function AdminAssignmentRow({
    assignment,
    submissions,
    totalStudents,
    missingStudents,
}: AdminAssignmentRowProps) {
    const submittedCount = submissions.length;
    const lateCount = submissions.filter((s) => s.isLate).length;
    const isPastDue = assignment.dueAt ? new Date(assignment.dueAt) < new Date() : false;

    return (
        <div className="border rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-medium text-gray-400">
                            Week {assignment.week} / Lesson {assignment.lesson}
                        </span>
                        <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${assignment.published
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                                }`}
                        >
                            {assignment.published ? "Published" : "Draft"}
                        </span>
                        {lateCount > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                                {lateCount} late
                            </span>
                        )}
                    </div>
                    <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className={isPastDue ? "text-red-500" : ""}>
                            🕐 {formatDate(assignment.dueAt)}
                        </span>
                        <span>
                            📝 {submittedCount}/{totalStudents} submitted
                            {submittedCount > 0 && ` (📁 ${submissions.filter((s) => s.type === "file").length} — 🔗 ${submissions.filter((s) => s.type === "repo_link").length})`}
                        </span>
                    </div>
                </div>
                <Link
                    href={`/assignment/${assignment.id}`}
                    className="shrink-0 text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                    View details →
                </Link>
            </div>

            {/* Missing students */}
            {isPastDue && missingStudents.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium text-red-600 mb-1">
                        Not submitted ({missingStudents.length}):
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {missingStudents.map((s) => (
                            <span
                                key={s.githubUsername}
                                className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded"
                            >
                                @{s.githubUsername}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
