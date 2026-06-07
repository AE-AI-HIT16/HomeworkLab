import Link from "next/link";
import type { Assignment, Submission } from "@/types";

type SubmissionStatus = "not_submitted" | "submitted" | "late";

function getStatus(assignment: Assignment, submission?: Submission): SubmissionStatus {
    if (!submission) return "not_submitted";
    return submission.isLate ? "late" : "submitted";
}

const statusConfig: Record<SubmissionStatus, { label: string; className: string }> = {
    not_submitted: {
        label: "Not submitted",
        className: "bg-gray-100 text-gray-600",
    },
    submitted: {
        label: "Submitted",
        className: "bg-green-100 text-green-700",
    },
    late: {
        label: "Late submission",
        className: "bg-amber-100 text-amber-700",
    },
};

function formatDeadline(dueAt?: string): string {
    if (!dueAt) return "No deadline";
    return new Date(dueAt).toLocaleString("en-US", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

interface AssignmentCardProps {
    assignment: Assignment;
    submission?: Submission;
}

export function AssignmentCard({ assignment, submission }: AssignmentCardProps) {
    const status = getStatus(assignment, submission);
    const badge = statusConfig[status];
    const isPastDue = assignment.dueAt ? new Date(assignment.dueAt) < new Date() : false;

    return (
        <Link
            href={`/assignment/${assignment.id}`}
            className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hw-primary)] focus-visible:ring-offset-2"
        >
            <div className="border border-[var(--hw-outline-variant)]/40 rounded-lg p-4 transition-all hover:border-[var(--hw-primary)]/50 hover:shadow-sm active:scale-[0.99] group cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-400">
                                Lesson {assignment.lesson}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.className}`}>
                                {badge.label}
                            </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-[var(--hw-primary)] transition-colors truncate">
                            {assignment.title}
                        </h3>
                        {assignment.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {assignment.description}
                            </p>
                        )}
                    </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                    <span className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">description</span>
                        {assignment.promptFiles.length} prompt file
                        {assignment.promptFiles.length === 1 ? "" : "s"}
                    </span>
                    <span className={`inline-flex items-center gap-1 ${isPastDue && status === "not_submitted" ? "text-red-500 font-medium" : ""}`}>
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {formatDeadline(assignment.dueAt)}
                    </span>
                </div>
            </div>
        </Link>
    );
}
