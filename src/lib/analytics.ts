import type { Submission } from "@/types";

export function groupSubmissionsByAssignment(submissions: Submission[]): Map<string, Submission[]> {
    const grouped = new Map<string, Submission[]>();
    for (const submission of submissions) {
        const current = grouped.get(submission.assignmentId) ?? [];
        current.push(submission);
        grouped.set(submission.assignmentId, current);
    }
    return grouped;
}

export function groupSubmissionsByStudent(submissions: Submission[]): Map<string, Submission[]> {
    const grouped = new Map<string, Submission[]>();
    for (const submission of submissions) {
        const key = submission.githubUsername.toLowerCase();
        const current = grouped.get(key) ?? [];
        current.push(submission);
        grouped.set(key, current);
    }
    return grouped;
}
