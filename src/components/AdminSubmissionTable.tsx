"use client";

import { useState } from "react";
import type { StudentSubmissionRow } from "@/lib/google-sheets";
import GradeSubmissionModal from "./GradeSubmissionModal";

interface AdminSubmissionTableProps {
    assignmentId: string;
    rows: StudentSubmissionRow[];
}

export function AdminSubmissionTable({ assignmentId, rows }: AdminSubmissionTableProps) {
    const [gradingRow, setGradingRow] = useState<StudentSubmissionRow | null>(null);

    if (rows.length === 0) {
        return (
            <div className="text-center py-10 border rounded-lg bg-gray-50">
                <p className="text-gray-500">No students found for this assignment.</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white border text-sm rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b text-gray-500 font-medium text-xs uppercase tracking-wider">
                                <th className="p-4 w-[20%]">Student</th>
                                <th className="p-4 w-[15%]">Status</th>
                                <th className="p-4 w-[20%]">Submitted At</th>
                                <th className="p-4 w-[30%]">Submission / Feedback</th>
                                <th className="p-4 w-[15%] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.map((row) => {
                                const { student, submission } = row;
                                const isSubmitted = !!submission;
                                const isLate = submission ? submission.isLate : false;

                                return (
                                    <tr key={student.githubUsername} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-4 align-top">
                                            <div className="font-semibold text-slate-900">{student.name}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">@{student.githubUsername}</div>
                                        </td>
                                        <td className="p-4 align-top">
                                            {!isSubmitted ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-100">
                                                    Missing
                                                </span>
                                            ) : isLate ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100">
                                                    Late
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                    Submitted
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 align-top text-slate-500 text-xs mt-1">
                                            {isSubmitted
                                                ? new Date(submission.submittedAt).toLocaleDateString("en-US", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })
                                                : "—"}
                                        </td>
                                        <td className="p-4 align-top">
                                            {!isSubmitted ? (
                                                <span className="text-slate-300">—</span>
                                            ) : (
                                                <div className="space-y-2">
                                                    {submission.type === "file" ? (
                                                        <div className="flex items-center gap-2 text-[var(--hw-primary)] font-medium">
                                                            <span className="material-symbols-outlined text-lg">description</span>
                                                            <span className="truncate max-w-[200px]">{submission.file?.name}</span>
                                                        </div>
                                                    ) : (
                                                        <a
                                                            href={submission.repoUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 text-[var(--hw-primary)] hover:underline font-medium"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">link</span>
                                                            <span className="truncate max-w-[200px]">GitHub Repository</span>
                                                        </a>
                                                    )}

                                                    {submission.grade !== undefined && (
                                                        <div className="flex flex-col gap-1 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-sm font-bold text-slate-900">{submission.grade}</span>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase">/ 100</span>
                                                            </div>
                                                                <p className="text-[10px] text-slate-500 italic line-clamp-2">
                                                                    &ldquo;{submission.feedback}&rdquo;
                                                                </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 align-top text-right">
                                            {isSubmitted && (
                                                <button
                                                    onClick={() => setGradingRow(row)}
                                                    className="flex items-center gap-1 ml-auto text-[var(--hw-primary)] hover:text-[var(--hw-on-primary-fixed)] font-bold text-xs uppercase tracking-wider transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">
                                                        {submission.grade !== undefined ? "edit" : "grading"}
                                                    </span>
                                                    {submission.grade !== undefined ? "Edit Grade" : "Grade"}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {gradingRow && (
                <GradeSubmissionModal
                    assignmentId={assignmentId}
                    studentName={gradingRow.student.name}
                    githubUsername={gradingRow.student.githubUsername}
                    currentGrade={gradingRow.submission?.grade}
                    currentFeedback={gradingRow.submission?.feedback}
                    onClose={() => setGradingRow(null)}
                />
            )}
        </>
    );
}
