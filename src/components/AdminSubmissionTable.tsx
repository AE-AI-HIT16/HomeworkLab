"use client";

import type { StudentSubmissionRow } from "@/lib/google-sheets";

interface AdminSubmissionTableProps {
    rows: StudentSubmissionRow[];
}

export function AdminSubmissionTable({ rows }: AdminSubmissionTableProps) {
    if (rows.length === 0) {
        return (
            <div className="text-center py-10 border rounded-lg bg-gray-50">
                <p className="text-gray-500">Chưa có học viên nào trong lớp.</p>
            </div>
        );
    }

    return (
        <div className="bg-white border text-sm rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b text-gray-500 font-medium text-xs uppercase tracking-wider">
                            <th className="p-4 w-1/4">Học viên</th>
                            <th className="p-4 w-1/4">Trạng thái</th>
                            <th className="p-4 w-1/6">Thời gian nộp</th>
                            <th className="p-4 w-auto">Link nộp bài</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {rows.map(({ student, submission }) => {
                            const isSubmitted = !!submission;
                            const isLate = submission ? submission.isLate : false;

                            return (
                                <tr key={student.githubUsername} className="hover:bg-gray-50 transition">
                                    <td className="p-4 align-top">
                                        <div className="font-semibold text-gray-900">{student.name}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">@{student.githubUsername}</div>
                                    </td>
                                    <td className="p-4 align-top">
                                        {!isSubmitted ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                                Chưa nộp
                                            </span>
                                        ) : isLate ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                                                Nộp trễ
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                                Đã nộp
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 align-top text-gray-600">
                                        {isSubmitted
                                            ? new Date(submission.submittedAt).toLocaleDateString("vi-VN", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })
                                            : "—"}
                                    </td>
                                    <td className="p-4 align-top">
                                        {!isSubmitted ? (
                                            <span className="text-gray-400">—</span>
                                        ) : submission.type === "file" ? (
                                            <div className="flex items-center gap-1.5 text-blue-600 font-medium break-all">
                                                📁 <span>{submission.file?.name}</span>
                                                {/* In a real app we would link to the Google Drive file directly here using driveFileId */}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 break-all">
                                                🔗{" "}
                                                <a
                                                    href={submission.repoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline font-medium"
                                                >
                                                    {submission.repoUrl}
                                                </a>
                                            </div>
                                        )}
                                        {isSubmitted && submission.grade !== undefined && (
                                            <div className="mt-2 text-xs font-semibold text-blue-800">
                                                Điểm: {submission.grade}/10
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
