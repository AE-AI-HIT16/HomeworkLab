"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { createMaterialAction, type CreateMaterialFormState } from "./actions";
import type { MaterialContentMode } from "@/types";

function MarkdownPreview({ content }: { content: string }) {
    // Simple markdown-to-html for preview (headings, bold, italic, code, lists)
    const rendered = content
        .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-slate-800 mb-2 mt-4">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-slate-900 mb-3 mt-6">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-extrabold text-slate-900 mb-4 mt-6">$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
        .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-slate-700">$1</li>')
        .replace(/^(\d+\.) (.+)$/gm, '<li class="ml-4 list-decimal text-slate-700">$2</li>')
        .replace(/\n\n/g, '<br/><br/>')
        .replace(/\n/g, '<br/>');

    return (
        <div
            className="prose prose-sm prose-slate max-w-none p-4 bg-white border border-slate-200 rounded-xl min-h-[200px]"
            dangerouslySetInnerHTML={{ __html: rendered }}
        />
    );
}

const contentModes: { value: MaterialContentMode; label: string; icon: string; description: string }[] = [
    { value: "link", label: "Gắn Link", icon: "link", description: "URL đến Notion, YouTube, Drive..." },
    { value: "file", label: "File Preview", icon: "description", description: "Google Drive file xem trước" },
    { value: "post", label: "Viết Post", icon: "edit_note", description: "Viết bài Markdown trực tiếp" },
];

export default function CreateMaterialPage() {
    const [state, formAction, isPending] = useActionState<CreateMaterialFormState, FormData>(
        createMaterialAction,
        {}
    );

    const formRef = useRef<HTMLFormElement>(null);
    const [contentMode, setContentMode] = useState<MaterialContentMode>("link");
    const [postContent, setPostContent] = useState("");
    const [showPreview, setShowPreview] = useState(false);

    // Reset form on success
    useEffect(() => {
        if (state.success && formRef.current) {
            formRef.current.reset();
            setPostContent("");
            setShowPreview(false);
            setContentMode("link");
            alert("✅ Material added successfully! You can add another one.");
        }
    }, [state.success]);

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
                    <Link href="/admin" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 hover:translate-x-1 transition-transform duration-200 text-sm font-medium">
                        <span className="material-symbols-outlined mr-3">monitoring</span>
                        Analytics
                    </Link>
                    <Link href="/admin/students" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 hover:translate-x-1 transition-transform duration-200 text-sm font-medium">
                        <span className="material-symbols-outlined mr-3">group</span>
                        Students
                    </Link>
                    <span className="flex items-center px-4 py-3 bg-white text-indigo-600 shadow-sm rounded-lg text-sm font-medium">
                        <span className="material-symbols-outlined mr-3" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
                        Curriculum
                    </span>
                    <Link href="/admin/create-assignment" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 hover:translate-x-1 transition-transform duration-200 text-sm font-medium pl-10">
                        <span className="material-symbols-outlined mr-3 text-[18px]">add_task</span>
                        Add Assignment
                    </Link>
                    <span className="flex items-center px-4 py-3 bg-indigo-50/50 text-indigo-600 rounded-lg text-sm font-bold pl-10 border border-indigo-100">
                        <span className="material-symbols-outlined mr-3 text-[18px]">post_add</span>
                        Add Material
                    </span>
                </nav>

                <div className="pt-4 border-t border-slate-200/50">
                    <Link href="/courses/ai-core" className="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 text-sm font-medium">
                        <span className="material-symbols-outlined mr-3">school</span>
                        View Course
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="md:ml-64 min-h-screen pb-24 md:pb-12 bg-slate-50 flex-1">
                {/* Top Bar */}
                <header className="fixed top-0 right-0 left-0 md:left-64 z-30 bg-white/80 backdrop-blur-md shadow-sm flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <h2 className="text-xl font-bold tracking-tight text-slate-800">Add Course Material</h2>
                    </div>
                </header>

                {/* Content Area */}
                <div className="pt-24 px-6 max-w-4xl mx-auto">
                    {/* Bento Header */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8 relative overflow-hidden">
                        <div className="relative z-10 md:w-2/3">
                            <span className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest mb-2 block">
                                Curator Mode
                            </span>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
                                Enrich Syllabus with <span className="text-indigo-600">Materials</span>
                            </h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                Materials are theory documents, lecture slides, or video recordings that help students learn before attempting assignments. They will be displayed at the top of each Module.
                            </p>
                        </div>
                        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-50 to-transparent pointer-events-none" />
                        <span className="hidden md:block material-symbols-outlined absolute right-8 top-1/2 -translate-y-1/2 text-[120px] text-indigo-500/10 pointer-events-none select-none">
                            auto_stories
                        </span>
                    </div>

                    {/* Error Message */}
                    {state.error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-3">
                            <span className="material-symbols-outlined">error</span>
                            <p className="text-sm font-medium">{state.error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form ref={formRef} action={formAction} className="space-y-8 pb-20">
                        {/* Hidden field for contentMode */}
                        <input type="hidden" name="contentMode" value={contentMode} />

                        {/* Section: Material Details */}
                        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-indigo-500">edit_document</span>
                                    Material Details
                                </h4>
                            </div>

                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        Title
                                    </label>
                                    <input
                                        name="title"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-sm"
                                        placeholder="e.g., Intro to Linear Algebra Slides"
                                        type="text"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                            Parent Module (Week)
                                        </label>
                                        <div className="relative">
                                            <input
                                                name="week"
                                                type="number"
                                                min="1"
                                                placeholder="e.g., 2"
                                                required
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pl-11 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                            />
                                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">calendar_view_week</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                            Type
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="type"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pl-11 pr-10 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none text-sm font-medium"
                                                defaultValue="theory"
                                            >
                                                <option value="theory">Theory / Reading (Thuyết/Bài đọc)</option>
                                                <option value="video">Video Lecture (Bài giảng)</option>
                                                <option value="slides">Slides (Trang trình bày)</option>
                                                <option value="other">Other Link (Khác)</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">category</span>
                                            <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section: Content Mode Selector */}
                        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-indigo-500">format_paint</span>
                                    Content Mode
                                </h4>
                                <p className="text-xs text-slate-500 mt-1">Chọn cách muốn cung cấp tài liệu cho học sinh</p>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Mode Tabs */}
                                <div className="grid grid-cols-3 gap-3">
                                    {contentModes.map((mode) => (
                                        <button
                                            key={mode.value}
                                            type="button"
                                            onClick={() => setContentMode(mode.value)}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                                                contentMode === mode.value
                                                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm"
                                                    : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-slate-100"
                                            }`}
                                        >
                                            <span
                                                className={`material-symbols-outlined text-[28px] ${
                                                    contentMode === mode.value ? "text-indigo-600" : "text-slate-400"
                                                }`}
                                                style={{ fontVariationSettings: contentMode === mode.value ? "'FILL' 1" : "" }}
                                            >
                                                {mode.icon}
                                            </span>
                                            <span className="text-sm font-bold">{mode.label}</span>
                                            <span className="text-[10px] text-slate-400 leading-tight hidden sm:block">{mode.description}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* ── Mode: Link ── */}
                                {contentMode === "link" && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                            URL Link
                                        </label>
                                        <div className="relative">
                                            <input
                                                name="url"
                                                type="url"
                                                placeholder="https://notion.so/... or https://youtube.com/..."
                                                required
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pl-11 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                            />
                                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">link</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">
                                            Paste direct link to Notion page, Google Drive document, or YouTube video. Students will be redirected here.
                                        </p>
                                    </div>
                                )}

                                {/* ── Mode: File Preview ── */}
                                {contentMode === "file" && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                            Google Drive File URL
                                        </label>
                                        <div className="relative">
                                            <input
                                                name="url"
                                                type="url"
                                                placeholder="https://drive.google.com/file/d/... or https://docs.google.com/..."
                                                required
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pl-11 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                            />
                                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">cloud_upload</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">
                                            Paste the Google Drive sharing link. Students will see an embedded preview directly in the platform without leaving the page.
                                        </p>
                                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                                            <span className="material-symbols-outlined text-amber-500 text-[20px] mt-0.5">info</span>
                                            <div className="text-xs text-amber-800 space-y-1">
                                                <p className="font-bold">Tip: Set sharing to &quot;Anyone with the link can view&quot;</p>
                                                <p>Otherwise students won&apos;t be able to preview the file.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── Mode: Post ── */}
                                {contentMode === "post" && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-sm font-bold text-slate-700">
                                                Post Content (Markdown)
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setShowPreview(!showPreview)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-slate-200 hover:bg-slate-50"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">
                                                    {showPreview ? "edit" : "visibility"}
                                                </span>
                                                {showPreview ? "Edit" : "Preview"}
                                            </button>
                                        </div>

                                        {showPreview ? (
                                            <MarkdownPreview content={postContent} />
                                        ) : (
                                            <textarea
                                                name="postContent"
                                                value={postContent}
                                                onChange={(e) => setPostContent(e.target.value)}
                                                placeholder={"# Tiêu đề bài viết\n\nViết nội dung ở đây bằng **Markdown**.\n\n## Phần 1\n- Điểm 1\n- Điểm 2\n\n```python\nprint('Hello World')\n```"}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-mono min-h-[300px] resize-y"
                                            />
                                        )}

                                        {/* Hidden field to pass postContent when in preview mode */}
                                        {showPreview && (
                                            <input type="hidden" name="postContent" value={postContent} />
                                        )}

                                        <div className="flex items-center gap-4 text-xs text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">info</span>
                                                Hỗ trợ: headings (#), **bold**, *italic*, `code`, lists (-)
                                            </span>
                                            <span>{postContent.length} characters</span>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                                URL Link <span className="text-slate-400 font-normal">(tùy chọn)</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    name="url"
                                                    type="url"
                                                    placeholder="Optional: add a reference link"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pl-11 text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                                />
                                                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">link</span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">Thêm link tham khảo bên ngoài (nếu có).</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Section: Publish Toggle */}
                        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">Publish Immediately</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">Toggle to hide this material from the student syllabus for now.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="published" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </section>

                        {/* Footer Actions */}
                        <div className="flex justify-end gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPending ? (
                                    <>
                                        <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                        Adding to Syllabus...
                                    </>
                                ) : (
                                    <>
                                        Add Material
                                        <span className="material-symbols-outlined text-sm">add_box</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
