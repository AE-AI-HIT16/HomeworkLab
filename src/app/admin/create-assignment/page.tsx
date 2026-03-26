"use client";

import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import { useActionState } from "react";
import { createAssignmentAction, type CreateAssignmentFormState } from "./actions";
import type { PromptFile } from "@/types";

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".zip", ".ipynb"];
const MAX_FILE_SIZE_MB = 20;

function getFileIcon(name: string): string {
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "ipynb") return "data_object";
    if (ext === "pdf") return "picture_as_pdf";
    if (ext === "docx") return "article";
    if (ext === "zip") return "folder_zip";
    return "description";
}

function getFileColor(name: string): string {
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "ipynb") return "text-orange-500";
    if (ext === "pdf") return "text-red-500";
    if (ext === "docx") return "text-blue-500";
    if (ext === "zip") return "text-purple-500";
    return "text-[var(--hw-primary)]";
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface PendingFile {
    file: File;
    status: "pending" | "uploading" | "done" | "error";
    promptFile?: PromptFile;
    error?: string;
}

export default function CreateAssignmentPage() {
    const [state, formAction, isPending] = useActionState<CreateAssignmentFormState, FormData>(
        createAssignmentAction,
        {}
    );

    const [fileUpload, setFileUpload] = useState(true);
    const [githubLink, setGithubLink] = useState(false);

    // Prompt file upload state
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploadingFiles, setIsUploadingFiles] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const addFiles = useCallback((newFiles: FileList | File[]) => {
        const filesArray = Array.from(newFiles);
        const valid: PendingFile[] = [];

        for (const file of filesArray) {
            const ext = "." + file.name.split(".").pop()?.toLowerCase();
            if (!ALLOWED_EXTENSIONS.includes(ext)) {
                alert(`File "${file.name}" không được hỗ trợ. Chỉ nhận: ${ALLOWED_EXTENSIONS.join(", ")}`);
                continue;
            }
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                alert(`File "${file.name}" quá lớn (tối đa ${MAX_FILE_SIZE_MB}MB)`);
                continue;
            }
            valid.push({ file, status: "pending" });
        }

        setPendingFiles((prev) => [...prev, ...valid]);
    }, []);

    const removeFile = useCallback((index: number) => {
        setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length > 0) {
            addFiles(e.dataTransfer.files);
        }
    }, [addFiles]);

    // Upload pending files, then submit the form via server action
    const handlePublish = useCallback(async () => {
        const form = formRef.current;
        if (!form) return;

        setIsUploadingFiles(true);

        try {
            // Upload any unuploaded files
            const toUpload = pendingFiles.filter((f) => f.status === "pending" || f.status === "error");
            let uploadedPromptFiles: PromptFile[] = pendingFiles
                .filter((f) => f.status === "done" && f.promptFile)
                .map((f) => f.promptFile!);

            if (toUpload.length > 0) {
                // Mark all as uploading
                setPendingFiles((prev) =>
                    prev.map((f) =>
                        f.status === "pending" || f.status === "error"
                            ? { ...f, status: "uploading" }
                            : f
                    )
                );

                // Upload each file
                const results = await Promise.all(
                    toUpload.map(async (pf) => {
                        const uploadForm = new FormData();
                        uploadForm.append("file", pf.file);
                        try {
                            const res = await fetch("/api/assignments/upload-prompt", {
                                method: "POST",
                                body: uploadForm,
                            });
                            if (!res.ok) {
                                const err = await res.json();
                                return { file: pf.file, error: err.error ?? "Upload thất bại" };
                            }
                            const promptFile: PromptFile = await res.json();
                            return { file: pf.file, promptFile };
                        } catch {
                            return { file: pf.file, error: "Lỗi kết nối" };
                        }
                    })
                );

                // Merge results back
                setPendingFiles((prev) => {
                    const updated = [...prev];
                    for (const result of results) {
                        const idx = updated.findIndex((f) => f.file === result.file);
                        if (idx >= 0) {
                            if (result.promptFile) {
                                updated[idx] = { ...updated[idx], status: "done", promptFile: result.promptFile };
                            } else {
                                updated[idx] = { ...updated[idx], status: "error", error: result.error };
                            }
                        }
                    }
                    return updated;
                });

                // Check for errors
                const hasError = results.some((r) => !r.promptFile);
                if (hasError) {
                    return; // Stop — show errors
                }

                // Merge newly uploaded files
                uploadedPromptFiles = [
                    ...uploadedPromptFiles,
                    ...results.filter((r) => r.promptFile).map((r) => r.promptFile!),
                ];
            }

            // Build FormData from form inputs + inject promptFilesJson
            const fd = new FormData(form);
            fd.set("promptFilesJson", JSON.stringify(uploadedPromptFiles));

            // Call server action directly
            formAction(fd);
        } finally {
            setIsUploadingFiles(false);
        }
    }, [pendingFiles, formAction]);

    const isUploading = isUploadingFiles || pendingFiles.some((f) => f.status === "uploading");

    return (
        <div className="min-h-screen flex bg-[var(--hw-surface)] text-[var(--hw-on-surface)] antialiased">
            {/* Sidebar */}
            <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 bg-slate-50 flex-col p-4 space-y-2 z-40">
                <div className="flex items-center px-4 py-6 space-x-3">
                    <div className="w-8 h-8 bg-[var(--hw-primary)] rounded-lg flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-[20px]">school</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-indigo-600 leading-none">HIT <span className="text-slate-800">AI/DATA</span></h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--hw-on-surface-variant)]/60 mt-1">
                            AI Workspace
                        </p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    <Link href="/dashboard" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 hover:translate-x-1 transition-transform duration-200 text-sm font-medium">
                        <span className="material-symbols-outlined mr-3">dashboard</span>
                        Overview
                    </Link>
                    <span className="flex items-center px-4 py-3 bg-white text-indigo-600 shadow-sm rounded-lg text-sm font-medium">
                        <span className="material-symbols-outlined mr-3">assignment</span>
                        All Work
                    </span>
                    <Link href="#" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 hover:translate-x-1 transition-transform duration-200 text-sm font-medium">
                        <span className="material-symbols-outlined mr-3">group</span>
                        Students
                    </Link>
                    <Link href="#" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 hover:translate-x-1 transition-transform duration-200 text-sm font-medium">
                        <span className="material-symbols-outlined mr-3">menu_book</span>
                        Curriculum
                    </Link>
                    <Link href="#" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 hover:translate-x-1 transition-transform duration-200 text-sm font-medium">
                        <span className="material-symbols-outlined mr-3">monitoring</span>
                        Analytics
                    </Link>
                </nav>

                <div className="pt-4 border-t border-slate-200/50">
                    <Link href="#" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 text-sm font-medium">
                        <span className="material-symbols-outlined mr-3">help</span>
                        Help
                    </Link>
                    <Link href="/login" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 text-sm font-medium">
                        <span className="material-symbols-outlined mr-3">logout</span>
                        Logout
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="md:ml-64 min-h-screen pb-24 md:pb-12 bg-[var(--hw-surface)] flex-1">
                {/* Top Bar */}
                <header className="fixed top-0 right-0 left-0 md:left-64 z-30 bg-white/80 backdrop-blur-md shadow-sm flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <h2 className="text-xl font-bold tracking-tight">Create New Assignment</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-all">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <div className="w-8 h-8 rounded-full bg-[var(--hw-surface-container-high)] overflow-hidden" />
                    </div>
                </header>

                {/* Content Area */}
                <div className="pt-24 px-6 max-w-5xl mx-auto">
                    {/* Bento Header */}
                    <div className="grid grid-cols-12 gap-6 mb-10">
                        <div className="col-span-12 lg:col-span-8 bg-[var(--hw-surface-container-lowest)] p-8 rounded-xl shadow-[0_12px_40px_rgba(26,28,29,0.04)]">
                            <span className="text-[var(--hw-primary)] font-bold text-[10px] uppercase tracking-widest mb-2 block">
                                Curator Mode
                            </span>
                            <h3 className="text-3xl font-semibold tracking-tight mb-4">
                                Drafting Assignment:{" "}
                                <span className="text-[var(--hw-primary-container)]">CS-201 Fundamentals</span>
                            </h3>
                            <p className="text-[var(--hw-on-surface-variant)] max-w-2xl leading-relaxed">
                                Create a structured learning module with AI-assisted grading capabilities. Your assignments are automatically optimized for clarity and academic integrity.
                            </p>
                        </div>
                        <div className="col-span-12 lg:col-span-4 bg-[var(--hw-primary)] text-white p-8 rounded-xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <span className="material-symbols-outlined text-4xl mb-4">auto_awesome</span>
                                <h4 className="font-bold text-lg mb-1">AI Assistant Ready</h4>
                                <p className="text-xs text-white/80 leading-snug">
                                    Generate rubrics or scaffold instructions based on your lesson plan.
                                </p>
                                <button className="mt-6 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-xs font-bold transition-all border border-white/10 backdrop-blur-sm">
                                    Launch Guide
                                </button>
                            </div>
                            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        </div>
                    </div>

                    {/* Error Message */}
                    {state.error && (
                        <div className="mb-6 p-4 bg-[var(--hw-error-container)] text-[var(--hw-on-error-container)] rounded-lg flex items-center gap-3">
                            <span className="material-symbols-outlined">error</span>
                            <p className="text-sm font-medium">{state.error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form ref={formRef} className="space-y-12 pb-20">
                        {/* Hidden input for prompt files */}
                        <input type="hidden" name="promptFilesJson" defaultValue="[]" />

                        {/* Section 1: Core Identity */}
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-1.5 h-6 bg-[var(--hw-primary)] rounded-full" />
                                <h5 className="text-sm font-bold uppercase tracking-widest text-[var(--hw-on-surface-variant)]">
                                    01. Core Identity
                                </h5>
                            </div>
                            <div className="bg-[var(--hw-surface-container-low)] p-1 rounded-xl">
                                <div className="bg-[var(--hw-surface-container-lowest)] p-8 rounded-lg space-y-8">
                                    <div>
                                        <label className="block text-xs font-bold text-[var(--hw-on-surface-variant)] uppercase tracking-wider mb-2">
                                            Assignment Title
                                        </label>
                                        <input
                                            name="title"
                                            className="w-full bg-[var(--hw-surface-container-low)] border-none rounded-lg p-4 text-[var(--hw-on-surface)] focus:ring-2 focus:ring-[var(--hw-primary)]/10 transition-all placeholder:text-[var(--hw-on-surface-variant)]/40"
                                            placeholder="e.g. Introduction to Recursive Functions"
                                            type="text"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-[var(--hw-on-surface-variant)] uppercase tracking-wider mb-2">
                                                Week / Module
                                            </label>
                                            <select
                                                name="week"
                                                className="w-full bg-[var(--hw-surface-container-low)] border-none rounded-lg p-4 text-[var(--hw-on-surface)] focus:ring-2 focus:ring-[var(--hw-primary)]/10 transition-all"
                                            >
                                                <option>Week 1: Fundamentals</option>
                                                <option>Week 2: Advanced Logic</option>
                                                <option>Week 3: Data Structures</option>
                                                <option>Week 4: Algorithms</option>
                                                <option>Week 5: Projects</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-[var(--hw-on-surface-variant)] uppercase tracking-wider mb-2">
                                                Lesson Context
                                            </label>
                                            <select
                                                name="lesson"
                                                className="w-full bg-[var(--hw-surface-container-low)] border-none rounded-lg p-4 text-[var(--hw-on-surface)] focus:ring-2 focus:ring-[var(--hw-primary)]/10 transition-all"
                                            >
                                                <option>Lecture 01: Setup</option>
                                                <option>Lecture 02: Syntax</option>
                                                <option>Lecture 03: Functions</option>
                                                <option>Practical 01: Debugging</option>
                                                <option>Practical 02: Testing</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Instructions & Details */}
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-1.5 h-6 bg-[var(--hw-primary)] rounded-full" />
                                <h5 className="text-sm font-bold uppercase tracking-widest text-[var(--hw-on-surface-variant)]">
                                    02. Instructions &amp; Details
                                </h5>
                            </div>
                            <div className="bg-[var(--hw-surface-container-low)] p-1 rounded-xl">
                                <div className="bg-[var(--hw-surface-container-lowest)] p-8 rounded-lg space-y-8">
                                    <div>
                                        <label className="block text-xs font-bold text-[var(--hw-on-surface-variant)] uppercase tracking-wider mb-2">
                                            Description &amp; Rich Text
                                        </label>
                                        <div className="border border-[var(--hw-outline-variant)]/20 rounded-lg overflow-hidden">
                                            <div className="bg-[var(--hw-surface-container-low)] px-4 py-2 border-b border-[var(--hw-outline-variant)]/10 flex gap-4">
                                                <button type="button" className="text-[var(--hw-on-surface-variant)] hover:text-[var(--hw-primary)]">
                                                    <span className="material-symbols-outlined text-xl">format_bold</span>
                                                </button>
                                                <button type="button" className="text-[var(--hw-on-surface-variant)] hover:text-[var(--hw-primary)]">
                                                    <span className="material-symbols-outlined text-xl">format_italic</span>
                                                </button>
                                                <button type="button" className="text-[var(--hw-on-surface-variant)] hover:text-[var(--hw-primary)]">
                                                    <span className="material-symbols-outlined text-xl">format_list_bulleted</span>
                                                </button>
                                                <button type="button" className="text-[var(--hw-on-surface-variant)] hover:text-[var(--hw-primary)]">
                                                    <span className="material-symbols-outlined text-xl">link</span>
                                                </button>
                                                <div className="flex-1" />
                                                <button type="button" className="text-[var(--hw-primary)] text-xs font-bold flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">spellcheck</span>
                                                    AI Review
                                                </button>
                                            </div>
                                            <textarea
                                                name="description"
                                                className="w-full border-none p-4 focus:ring-0 text-[var(--hw-on-surface-variant)] leading-relaxed bg-transparent"
                                                placeholder="Outline the learning objectives, requirements, and resources for this assignment..."
                                                rows={8}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-[var(--hw-on-surface-variant)] uppercase tracking-wider mb-2">
                                                Due Date &amp; Time
                                            </label>
                                            <input
                                                name="dueDate"
                                                className="w-full bg-[var(--hw-surface-container-low)] border-none rounded-lg p-4 text-[var(--hw-on-surface)] focus:ring-2 focus:ring-[var(--hw-primary)]/10 transition-all"
                                                type="datetime-local"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-[var(--hw-on-surface-variant)] uppercase tracking-wider mb-2">
                                                Potential Points
                                            </label>
                                            <div className="relative">
                                                <input
                                                    name="points"
                                                    className="w-full bg-[var(--hw-surface-container-low)] border-none rounded-lg p-4 text-[var(--hw-on-surface)] focus:ring-2 focus:ring-[var(--hw-primary)]/10 transition-all"
                                                    placeholder="100"
                                                    type="number"
                                                    defaultValue="100"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--hw-on-surface-variant)]/40">
                                                    PTS
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Prompt Files (NEW) */}
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
                                <h5 className="text-sm font-bold uppercase tracking-widest text-[var(--hw-on-surface-variant)]">
                                    03. Đề Bài &amp; Tài Liệu
                                </h5>
                            </div>
                            <div className="bg-[var(--hw-surface-container-low)] p-1 rounded-xl">
                                <div className="bg-[var(--hw-surface-container-lowest)] p-8 rounded-lg space-y-6">
                                    <div>
                                        <p className="text-xs text-[var(--hw-on-surface-variant)] mb-4">
                                            Đính kèm file đề bài. File <code className="bg-orange-50 text-orange-700 px-1 py-0.5 rounded text-xs">.ipynb</code> sẽ được preview trực tiếp với syntax highlight cho học viên.
                                        </p>

                                        {/* Dropzone */}
                                        <div
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all
                                                ${isDragging
                                                    ? "border-[var(--hw-primary)] bg-[var(--hw-primary)]/5 scale-[1.01]"
                                                    : "border-[var(--hw-outline-variant)]/40 hover:border-[var(--hw-primary)]/50 hover:bg-[var(--hw-surface-container-low)]"
                                                }`}
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? "bg-[var(--hw-primary)]/15" : "bg-[var(--hw-surface-container-low)]"}`}>
                                                <span className={`material-symbols-outlined text-3xl transition-colors ${isDragging ? "text-[var(--hw-primary)]" : "text-[var(--hw-on-surface-variant)]"}`}>
                                                    {isDragging ? "file_download" : "upload_file"}
                                                </span>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-semibold text-[var(--hw-on-surface)]">
                                                    {isDragging ? "Thả file vào đây" : "Kéo thả hoặc click để chọn file"}
                                                </p>
                                                <p className="text-xs text-[var(--hw-on-surface-variant)] mt-1">
                                                    Hỗ trợ: <strong>.ipynb</strong>, .pdf, .docx, .zip — tối đa {MAX_FILE_SIZE_MB}MB/file
                                                </p>
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                multiple
                                                accept=".pdf,.docx,.zip,.ipynb,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip,application/x-ipynb+json"
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files) addFiles(e.target.files);
                                                    e.target.value = "";
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* File List */}
                                    {pendingFiles.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-xs font-bold text-[var(--hw-on-surface-variant)] uppercase tracking-wider">
                                                {pendingFiles.length} file đã chọn
                                            </p>
                                            {pendingFiles.map((pf, i) => (
                                                <div
                                                    key={i}
                                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${pf.status === "done"
                                                        ? "bg-emerald-50 border-emerald-200"
                                                        : pf.status === "error"
                                                            ? "bg-red-50 border-red-200"
                                                            : pf.status === "uploading"
                                                                ? "bg-[var(--hw-primary)]/5 border-[var(--hw-primary)]/20"
                                                                : "bg-[var(--hw-surface-container-low)] border-transparent"
                                                        }`}
                                                >
                                                    {/* File icon */}
                                                    <div className="w-9 h-9 rounded-lg bg-white/80 flex items-center justify-center flex-shrink-0 shadow-sm">
                                                        {pf.status === "uploading" ? (
                                                            <span className="material-symbols-outlined text-[var(--hw-primary)] text-lg animate-spin">progress_activity</span>
                                                        ) : pf.status === "done" ? (
                                                            <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                                                        ) : pf.status === "error" ? (
                                                            <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                                                        ) : (
                                                            <span className={`material-symbols-outlined text-lg ${getFileColor(pf.file.name)}`}>
                                                                {getFileIcon(pf.file.name)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* File info */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate text-[var(--hw-on-surface)]">{pf.file.name}</p>
                                                        <p className="text-[10px] text-[var(--hw-on-surface-variant)]">
                                                            {pf.status === "uploading" && "Đang upload..."}
                                                            {pf.status === "done" && `✓ Đã upload · ${formatBytes(pf.file.size)}`}
                                                            {pf.status === "error" && `✗ Lỗi: ${pf.error}`}
                                                            {pf.status === "pending" && formatBytes(pf.file.size)}
                                                        </p>
                                                    </div>

                                                    {/* Remove button */}
                                                    {pf.status !== "uploading" && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile(i)}
                                                            className="p-1 text-[var(--hw-on-surface-variant)] hover:text-red-500 transition-colors flex-shrink-0"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">close</span>
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Badge info for ipynb */}
                                    <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-100">
                                        <span className="material-symbols-outlined text-orange-500 text-xl flex-shrink-0 mt-0.5">tips_and_updates</span>
                                        <div>
                                            <p className="text-xs font-bold text-orange-700 mb-1">Jupyter Notebook Preview</p>
                                            <p className="text-xs text-orange-600 leading-relaxed">
                                                File <code className="bg-white/60 px-1 rounded">.ipynb</code> sẽ được render trực tiếp trên trang bài tập của học viên với syntax highlight Python, giúp sinh viên đọc đề mà không cần tải file về.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 4: Submission Methods */}
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-1.5 h-6 bg-[var(--hw-primary)] rounded-full" />
                                <h5 className="text-sm font-bold uppercase tracking-widest text-[var(--hw-on-surface-variant)]">
                                    04. Submission Methods
                                </h5>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="group flex items-center p-6 bg-[var(--hw-surface-container-lowest)] rounded-xl cursor-pointer hover:bg-[var(--hw-primary)]/5 transition-all border border-transparent hover:border-[var(--hw-primary)]/10">
                                    <div className="w-12 h-12 rounded-lg bg-[var(--hw-surface-container-low)] group-hover:bg-[var(--hw-primary)]/10 flex items-center justify-center text-[var(--hw-primary)] transition-colors">
                                        <span className="material-symbols-outlined">upload_file</span>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <p className="text-sm font-bold">File Upload</p>
                                        <p className="text-xs text-[var(--hw-on-surface-variant)]">Allow PDF, DOCX, or ZIP files</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        name="fileUpload"
                                        checked={fileUpload}
                                        onChange={(e) => setFileUpload(e.target.checked)}
                                        className="rounded border-[var(--hw-outline)] text-[var(--hw-primary)] focus:ring-[var(--hw-primary)]"
                                    />
                                </label>
                                <label className="group flex items-center p-6 bg-[var(--hw-surface-container-lowest)] rounded-xl cursor-pointer hover:bg-[var(--hw-primary)]/5 transition-all border border-transparent hover:border-[var(--hw-primary)]/10">
                                    <div className="w-12 h-12 rounded-lg bg-[var(--hw-surface-container-low)] group-hover:bg-[var(--hw-primary)]/10 flex items-center justify-center text-[var(--hw-primary)] transition-colors">
                                        <span className="material-symbols-outlined">code</span>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <p className="text-sm font-bold">GitHub Link</p>
                                        <p className="text-xs text-[var(--hw-on-surface-variant)]">Direct repository integration</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        name="githubLink"
                                        checked={githubLink}
                                        onChange={(e) => setGithubLink(e.target.checked)}
                                        className="rounded border-[var(--hw-outline)] text-[var(--hw-primary)] focus:ring-[var(--hw-primary)]"
                                    />
                                </label>
                            </div>
                        </section>

                        {/* Footer Actions */}
                        <div className="pt-8 border-t border-[var(--hw-surface-container)] flex flex-col sm:flex-row justify-between items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="w-full sm:w-auto px-8 py-3 rounded-lg text-sm font-bold text-[var(--hw-on-surface-variant)] hover:bg-[var(--hw-surface-container)] transition-all text-center"
                            >
                                Cancel
                            </Link>
                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={handlePublish}
                                    disabled={isPending || isUploading}
                                    className="w-full sm:w-auto px-10 py-3 rounded-lg text-sm font-bold text-white bg-[var(--hw-primary)] hover:bg-[var(--hw-primary-container)] shadow-lg shadow-[var(--hw-primary)]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isUploading ? (
                                        <>
                                            <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                            Đang upload file...
                                        </>
                                    ) : isPending ? (
                                        <>
                                            <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                            Publishing...
                                        </>
                                    ) : (
                                        <>
                                            Publish Assignment
                                            <span className="material-symbols-outlined text-sm">send</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
