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

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB (must match server validation)
const ALLOWED_EXTENSIONS = [".py", ".ipynb", ".zip", ".pdf", ".docx", ".csv", ".txt", ".md"];
const MAX_FILE_SIZE_MB = MAX_FILE_SIZE / (1024 * 1024);

type FormState = "idle" | "uploading" | "success" | "error" | "already_submitted";

export function SubmissionForm({ assignmentId, existingSubmission, isPastDue }: SubmissionFormProps) {
    const router = useRouter();
    const existingSubmissionLink =
        existingSubmission?.type === "repo_link"
            ? existingSubmission.repoUrl
            : existingSubmission?.file?.driveFileId
                ? `https://drive.google.com/file/d/${existingSubmission.file.driveFileId}/view`
                : undefined;

    // Determine initial state
    const [view, setView] = useState<FormState>(existingSubmission ? "already_submitted" : "idle");
    const [type, setType] = useState<SubmissionType>(existingSubmission?.type ?? "file");
    const [repoUrl, setRepoUrl] = useState(existingSubmission?.repoUrl ?? "");
    const [fileName, setFileName] = useState(existingSubmission?.file?.name ?? "");
    const [fileSize, setFileSize] = useState<number>(existingSubmission?.file?.sizeBytes ?? 0);
    const [fileObj, setFileObj] = useState<File | null>(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);

    // Format file size
    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / 1048576).toFixed(1) + " MB";
    };

    // Format date
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setErrorMsg("");
        if (!file) {
            setFileName("");
            setFileSize(0);
            setFileObj(null);
            return;
        }

        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            setView("error");
            setErrorMsg(`Invalid format. Please upload ${ALLOWED_EXTENSIONS.join(", ")}`);
            e.target.value = "";
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setView("error");
            setErrorMsg(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
            e.target.value = "";
            return;
        }

        setFileName(file.name);
        setFileSize(file.size);
        setFileObj(file);
        setView("idle");
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            // Re-use file logic by faking an event-like object (simplified)
            const input = document.getElementById("file-upload") as HTMLInputElement;
            if (input) {
                // In a real app we'd use DataTransfer to set files on input
                // but for React state we can just process the file directly
                const ext = "." + file.name.split(".").pop()?.toLowerCase();
                if (!ALLOWED_EXTENSIONS.includes(ext)) {
                    setView("error");
                    setErrorMsg(`Invalid format. Please upload ${ALLOWED_EXTENSIONS.join(", ")}`);
                    return;
                }
                if (file.size > MAX_FILE_SIZE) {
                    setView("error");
                    setErrorMsg(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
                    return;
                }
                setFileName(file.name);
                setFileSize(file.size);
                setFileObj(file);
                setView("idle");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (type === "repo_link") {
            if (!repoUrl.trim() || !isValidRepoUrl(repoUrl)) {
                setView("error");
                setErrorMsg("Invalid repository URL. Please check the link and try again.");
                return;
            }
        } else {
            if (!fileName) {
                setView("error");
                setErrorMsg("Please select a file to upload.");
                return;
            }
        }

        setView("uploading");
        setUploadProgress(0);

        // Simulate upload progress
        const interval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 10;
            });
        }, 100);

        try {
            const formData = new FormData();
            formData.append("assignmentId", assignmentId);
            formData.append("type", type);
            if (type === "repo_link") {
                formData.append("repoUrl", repoUrl);
            } else if (type === "file" && fileObj) {
                formData.append("file", fileObj);
            }

            const result = await submitAssignment(formData);

            clearInterval(interval);
            setUploadProgress(100);

            if (!result.success) {
                setTimeout(() => {
                    setView("error");
                    setErrorMsg(result.error ?? "An error occurred during submission.");
                }, 400);
                return;
            }

            setTimeout(() => {
                setView("success");
                router.refresh();
            }, 600);
        } catch {
            clearInterval(interval);
            setView("error");
            setErrorMsg("Network error. Please try again.");
        }
    };

    return (
        <div className="w-full">
            {/* ALREADY SUBMITTED STATE */}
            {view === "already_submitted" && existingSubmission && (
                <div className="bg-white rounded-xl shadow-sm border border-[var(--hw-surface-container-high)] overflow-hidden">
                    <div className="p-5 border-b border-[var(--hw-surface-container-high)] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                            </span>
                            <span className="font-semibold text-slate-900 text-sm">Submission Received</span>
                        </div>
                        {isPastDue && existingSubmission.isLate && (
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-amber-100 text-amber-700">LATE</span>
                        )}
                    </div>

                    <div className="p-5">
                        <div className="flex gap-4 p-4 rounded-lg bg-[var(--hw-surface-container-lowest)] border border-[var(--hw-outline-variant)] mb-5 shrink-0">
                            <div className="w-10 h-10 rounded bg-[var(--hw-primary-fixed)] text-[var(--hw-on-primary-fixed)] flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined">{existingSubmission.type === "repo_link" ? "code" : "folder_zip"}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                    {existingSubmission.type === "repo_link" ? existingSubmission.repoUrl : existingSubmission.file?.name}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {existingSubmission.type === "repo_link" ? "GITHUB REPOSITORY" : `${formatSize(existingSubmission.file?.sizeBytes ?? 0)} • FILE UPLOAD`}
                                </p>
                            </div>
                            {existingSubmissionLink ? (
                                <a
                                    href={existingSubmissionLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Open submitted work"
                                    title="Open submitted work"
                                    className="self-center text-slate-400 hover:text-[var(--hw-primary)] transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">open_in_new</span>
                                </a>
                            ) : (
                                <span className="self-center text-slate-300" aria-hidden="true">
                                    <span className="material-symbols-outlined text-xl">link_off</span>
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Status</p>
                                <p className="text-xs font-medium text-slate-900">Pending Review</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Submitted</p>
                                <p className="text-xs font-medium text-slate-900">{formatDate(existingSubmission.submittedAt)}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--hw-surface-container-high)]">
                            <span className="text-xs text-slate-500 italic">Next attempt will overwrite current files.</span>
                            <button
                                type="button"
                                onClick={() => setView("idle")}
                                className="bg-[var(--hw-primary)] text-white text-sm font-medium px-4 py-2 rounded-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
                            >
                                <span className="material-symbols-outlined text-[16px]">refresh</span>
                                Resubmit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SUCCESS STATE */}
            {view === "success" && (
                <div className="bg-white rounded-xl shadow-sm border border-[var(--hw-surface-container-high)] p-8 text-center flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-[var(--hw-primary)] flex items-center justify-center text-white mb-4 shadow-md shadow-[var(--hw-primary)]/20">
                        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Submission Successful</h3>
                    <p className="text-sm text-slate-500 mb-6 max-w-xs">
                        Your work for this assignment has been recorded and is ready for review.
                    </p>

                    <div className="w-full flex items-center justify-between border-t border-[var(--hw-surface-container-high)] pt-4 mt-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--hw-primary)] bg-[var(--hw-primary-fixed)] px-2 py-0.5 rounded">
                                {isPastDue ? "LATE" : "ON TIME"}
                            </span>
                            <span className="text-xs text-slate-500 italic">
                                Submitted just now
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setView("idle")}
                            className="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded flex items-center gap-1 hover:bg-slate-200 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[14px]">edit</span>
                            Edit
                        </button>
                    </div>
                </div>
            )}

            {/* UPLOADING STATE */}
            {view === "uploading" && (
                <div className="bg-white rounded-xl shadow-sm border border-indigo-200 overflow-hidden">
                    <div className="p-5 flex items-center justify-between bg-[var(--hw-primary-fixed)]/50">
                        <span className="font-semibold text-slate-900 text-sm">Active Upload</span>
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-[var(--hw-primary-fixed-dim)] text-[var(--hw-primary)]">PROCESSING</span>
                    </div>
                    <div className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded bg-[var(--hw-primary-fixed)] text-[var(--hw-primary)] flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-sm">{type === "repo_link" ? "code" : "description"}</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-sm font-medium text-slate-900">{type === "repo_link" ? repoUrl : fileName}</span>
                                    <span className="text-xs text-[var(--hw-primary)] font-bold">{uploadProgress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[var(--hw-primary)] rounded-full transition-all duration-200 ease-out"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1.5">
                                    <span className="text-[10px] text-slate-400">
                                        {type === "file" ? `${formatSize((fileSize * uploadProgress) / 100)} of ${formatSize(fileSize)}` : "Connecting to GitHub..."}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setView("idle")}
                                className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors px-3 py-1.5"
                            >
                                Cancel
                            </button>
                            <button disabled className="bg-indigo-300 text-white text-xs font-medium px-4 py-1.5 rounded-md flex items-center gap-1.5 opacity-90 cursor-not-allowed">
                                <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                                Finalizing...
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* IDLE / ERROR STATE */}
            {(view === "idle" || view === "error") && (
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-[var(--hw-surface-container-high)]">
                    {/* Tabs */}
                    <div className="flex border-b border-[var(--hw-surface-container-high)]">
                        <button
                            type="button"
                            onClick={() => { setType("file"); setView("idle"); }}
                            className={`flex-[0.5] py-3 text-sm font-medium transition-colors ${type === "file" ? "text-[var(--hw-primary)] border-b-2 border-[var(--hw-primary)]" : "text-slate-500 hover:bg-slate-50"}`}
                        >
                            File Upload
                        </button>
                        <button
                            type="button"
                            onClick={() => { setType("repo_link"); setView("idle"); }}
                            className={`flex-[0.5] py-3 text-sm font-medium transition-colors ${type === "repo_link" ? "text-[var(--hw-primary)] border-b-2 border-[var(--hw-primary)]" : "text-slate-500 hover:bg-slate-50"}`}
                        >
                            GitHub Link
                        </button>
                    </div>

                    <div className="p-6">
                        {/* File Upload Zone */}
                        {type === "file" && (
                            <div
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors relative ${view === "error" ? "border-red-300 bg-red-50/30" : "border-slate-200 hover:border-indigo-300 hover:bg-[var(--hw-primary-fixed)]/30"}`}
                                onDragOver={(e) => { e.preventDefault(); }}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    accept={ALLOWED_EXTENSIONS.join(",")}
                                    onChange={handleFileChange}
                                />

                                {fileName ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded bg-[var(--hw-primary-fixed-dim)] text-[var(--hw-primary)] flex items-center justify-center mb-3">
                                            <span className="material-symbols-outlined text-xl">draft</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-900">{fileName}</p>
                                        <p className="text-xs text-slate-500 mt-1 mb-4">{formatSize(fileSize)}</p>
                                        <button
                                            type="button"
                                            onClick={() => { setFileName(""); setFileObj(null); setView("idle"); }}
                                            className="text-xs text-red-600 hover:text-red-700 font-medium bg-red-50 px-3 py-1 rounded"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                            <span className="material-symbols-outlined text-[var(--hw-primary)]">cloud_upload</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-900">Drop your submission here</p>
                                        <p className="text-[10px] text-slate-500 mt-1 mb-4 max-w-[200px] leading-relaxed">
                                            Supported: {ALLOWED_EXTENSIONS.join(", ")} (Max: {MAX_FILE_SIZE_MB}MB)
                                        </p>
                                        <span className="border border-slate-200 text-slate-600 text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                                            Browse Files
                                        </span>
                                    </label>
                                )}
                            </div>
                        )}

                        {/* GitHub Repo Zone */}
                        {type === "repo_link" && (
                            <div className="py-4">
                                <label htmlFor="repo-url" className="block text-xs font-bold tracking-widest uppercase text-slate-500 mb-2">
                                    GitHub Repository URL
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className={`material-symbols-outlined text-[18px] ${view === "error" ? "text-red-400" : "text-slate-400"}`}>link</span>
                                    </span>
                                    <input
                                        id="repo-url"
                                        type="text"
                                        value={repoUrl}
                                        onChange={(e) => { setRepoUrl(e.target.value); setView("idle"); }}
                                        placeholder="github.com/username/project"
                                        aria-label="GitHub repository URL"
                                        className={`w-full bg-slate-50 border text-sm rounded-lg block pl-10 p-2.5 outline-none transition-colors ${view === "error"
                                            ? "border-red-300 text-red-900 placeholder:text-red-300 focus:ring-1 focus:ring-red-500 bg-red-50/50"
                                            : "border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                            }`}
                                    />
                                    {view === "error" && (
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            <span className="material-symbols-outlined text-[18px] text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                                        </span>
                                    )}
                                </div>
                                <div className="mt-4 flex items-start gap-2 bg-[var(--hw-surface-container-lowest)] border border-slate-200 p-3 rounded-lg text-xs text-slate-600 leading-relaxed">
                                    <span className="material-symbols-outlined text-[16px] text-slate-400 shrink-0">info</span>
                                    <p>Your repository must be <strong>public</strong> or accessible by the <strong>@homework-lab-bot</strong> account. We will pull the latest commit from your main branch.</p>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {view === "error" && errorMsg && (
                            <p className="text-xs text-red-600 font-medium mt-3" role="alert">
                                {errorMsg}
                            </p>
                        )}

                        {/* Submit Actions */}
                        <div className="fixed md:static left-0 bottom-0 w-full md:w-auto p-4 md:p-0 bg-white/95 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none border-t border-[var(--hw-outline-variant)]/20 md:border-none z-40 md:mt-6 flex flex-col items-center shadow-[0_-10px_20px_rgba(0,0,0,0.05)] md:shadow-none">
                            {isPastDue && (
                                <p className="text-[10px] text-amber-600 font-medium mb-2 md:mb-3 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded w-full md:w-auto justify-center">
                                    <span className="material-symbols-outlined text-[14px]">warning</span>
                                    Submitting late will incur a penalty.
                                </p>
                            )}
                            <button
                                type="submit"
                                className="w-full bg-[var(--hw-primary)] text-white text-[15px] md:text-sm font-semibold py-3.5 md:py-2.5 rounded-xl md:rounded-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(70,72,212,0.2)] md:shadow-[0_4px_12px_rgba(70,72,212,0.2)]"
                            >
                                Submit Assignment
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}
