"use client";

import { useState } from "react";
import type { Submission, SubmissionType } from "@/types";
import { submitAssignment } from "@/server/actions";
import { useRouter } from "next/navigation";
import { isValidRepoUrl } from "@/lib/validation";

interface SubmissionFormProps {
    assignmentId: string;
    existingSubmission?: Submission;
    isPastDue: boolean;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const ALLOWED_EXTENSIONS = [".py", ".ipynb", ".zip", ".pdf", ".docx", ".csv", ".txt", ".md"];


export function SubmissionForm({ assignmentId, existingSubmission, isPastDue }: SubmissionFormProps) {
    const router = useRouter();
    const [type, setType] = useState<SubmissionType>(existingSubmission?.type ?? "file");
    const [repoUrl, setRepoUrl] = useState(existingSubmission?.repoUrl ?? "");
    const [fileName, setFileName] = useState(existingSubmission?.file?.name ?? "");
    const [fileObj, setFileObj] = useState<File | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Validation
        if (type === "repo_link") {
            if (!repoUrl.trim()) {
                setError("Vui lòng nhập link GitHub repository.");
                return;
            }
            if (!isValidRepoUrl(repoUrl)) {
                setError("URL phải là link GitHub hợp lệ (https://github.com/user/repo).");
                return;
            }
        }

        if (type === "file" && !fileName) {
            setError("Vui lòng chọn file để nộp.");
            return;
        }

        setSubmitting(true);

        const formData = new FormData();
        formData.append("assignmentId", assignmentId);
        formData.append("type", type);

        if (type === "repo_link") {
            formData.append("repoUrl", repoUrl);
        } else if (type === "file" && fileObj) {
            formData.append("file", fileObj);
        }

        const result = await submitAssignment(formData);

        if (!result.success) {
            setError(result.error ?? "Có lỗi xảy ra khi nộp bài.");
            setSubmitting(false);
            return;
        }

        setSuccess("Nộp bài thành công!");
        setSubmitting(false);
        router.refresh(); // Refresh page to show the new submission status
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        setError("");
        if (!file) {
            setFileName("");
            setFileObj(null);
            return;
        }

        // Validate extension
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            setError(`File không hợp lệ. Chấp nhận: ${ALLOWED_EXTENSIONS.join(", ")}`);
            e.target.value = "";
            setFileName("");
            setFileObj(null);
            return;
        }

        // Validate size
        if (file.size > MAX_FILE_SIZE) {
            setError("File quá lớn. Tối đa 20 MB.");
            e.target.value = "";
            setFileName("");
            setFileObj(null);
            return;
        }

        setFileName(file.name);
        setFileObj(file);
    }

    return (
        <div>
            {/* Existing submission */}
            {existingSubmission && (
                <div className={`mb-4 p-3 rounded-lg border text-sm ${existingSubmission.isLate ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`}>
                    <p className="font-medium">
                        {existingSubmission.isLate ? "⚠️ Đã nộp (trễ hạn)" : "✅ Đã nộp"}
                    </p>
                    <div className="text-gray-600 mt-1 flex items-center gap-2">
                        {existingSubmission.type === "file" ? (
                            <span>📁 File: {existingSubmission.file?.name}</span>
                        ) : (
                            <span>
                                🔗 Repo:{" "}
                                <a
                                    href={existingSubmission.repoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline break-all"
                                >
                                    {existingSubmission.repoUrl}
                                </a>
                            </span>
                        )}
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                        Nộp lúc: {new Date(existingSubmission.submittedAt).toLocaleString("vi-VN")}
                    </p>
                    {existingSubmission.grade !== undefined && (
                        <p className="mt-2 font-semibold text-blue-700">
                            Điểm: {existingSubmission.grade}/10
                            {existingSubmission.feedback && (
                                <span className="font-normal text-gray-600"> — {existingSubmission.feedback}</span>
                            )}
                        </p>
                    )}
                </div>
            )}

            {isPastDue && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                    ⏰ Đã quá hạn nộp. Bài nộp sẽ được đánh dấu là trễ hạn.
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type selector */}
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => { setType("file"); setError(""); }}
                        className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition ${type === "file"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                            }`}
                    >
                        📁 Upload file
                    </button>
                    <button
                        type="button"
                        onClick={() => { setType("repo_link"); setError(""); }}
                        className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition ${type === "repo_link"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                            }`}
                    >
                        🔗 GitHub repo link
                    </button>
                </div>

                {/* File input */}
                {type === "file" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Chọn file
                        </label>
                        <input
                            type="file"
                            accept={ALLOWED_EXTENSIONS.join(",")}
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Chấp nhận: {ALLOWED_EXTENSIONS.join(", ")} — tối đa 50 MB
                        </p>
                    </div>
                )}

                {/* Repo URL input */}
                {type === "repo_link" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Link GitHub Repository
                        </label>
                        <input
                            type="url"
                            value={repoUrl}
                            onChange={(e) => { setRepoUrl(e.target.value); setError(""); }}
                            placeholder="https://github.com/username/repo-name"
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        />
                    </div>
                )}

                {/* Error / Success */}
                {error && (
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>
                )}
                {success && (
                    <p className="text-sm text-green-600 bg-green-50 p-2 rounded-lg">{success}</p>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? "Đang nộp..." : existingSubmission ? "Nộp lại" : "Nộp bài"}
                </button>
            </form>
        </div>
    );
}
