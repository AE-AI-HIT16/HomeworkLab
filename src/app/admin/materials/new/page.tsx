"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { createMaterialAction, type CreateMaterialFormState } from "./actions";
import type { MaterialContentMode } from "@/types";
import { courses } from "@/lib/courses";

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
    { value: "link", label: "External Link", icon: "link", description: "URL to Notion, YouTube, Drive..." },
    { value: "file", label: "File Preview", icon: "description", description: "Embedded Google Drive file preview" },
    { value: "post", label: "Write Post", icon: "edit_note", description: "Write Markdown content directly" },
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
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");

    // Reset form on success
    useEffect(() => {
        if (state.success && formRef.current) {
            formRef.current.reset();
            const timer = window.setTimeout(() => {
                setPostContent("");
                setShowPreview(false);
                setContentMode("link");
                setSelectedCourseId("");
            }, 0);
            alert("✅ Material added successfully! You can add another one.");
            return () => window.clearTimeout(timer);
        }
    }, [state.success]);

    return (
        <main className="w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-16 bg-slate-50 text-[var(--hw-on-surface)] antialiased">
                <div className="mb-8">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 mb-1">Content Manager</p>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add Course Material</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Add references, files, videos, or written posts directly into course modules.
                    </p>
                </div>

                <div>
                    {/* Bento Header */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8 relative overflow-hidden">
                        <div className="relative z-10 md:w-2/3">
                            <span className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest mb-2 block">
                                Material Builder
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
                        <input type="hidden" name="courseId" value={selectedCourseId} />

                        {/* Section: Course Selector */}
                        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-500">school</span>
                                    Select Course
                                </h4>
                                <p className="text-xs text-slate-500 mt-1">Choose the course where this material should appear.</p>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {courses.map((course) => (
                                        <button
                                            key={course.id}
                                            type="button"
                                            onClick={() => setSelectedCourseId(course.id)}
                                            aria-pressed={selectedCourseId === course.id}
                                            className={`group flex items-center p-4 rounded-xl cursor-pointer transition-all border-2 overflow-hidden ${selectedCourseId === course.id
                                                    ? `bg-gradient-to-br ${course.gradient} text-white border-transparent shadow-lg`
                                                    : "bg-slate-50 border-slate-200 hover:border-slate-300"
                                                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2`}
                                        >
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${selectedCourseId === course.id
                                                    ? "bg-white/20 text-white"
                                                    : `bg-gradient-to-br ${course.gradient} text-white`
                                                }`}>
                                                <span className="material-symbols-outlined text-[20px]">{course.icon}</span>
                                            </div>
                                            <div className="ml-3 text-left flex-1">
                                                <p className={`text-sm font-bold ${selectedCourseId === course.id ? "text-white" : "text-slate-900"
                                                    }`}>{course.name}</p>
                                                <p className={`text-[10px] ${selectedCourseId === course.id ? "text-white/70" : "text-slate-400"
                                                    }`}>{course.tagline}</p>
                                            </div>
                                            {selectedCourseId === course.id && (
                                                <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                {!selectedCourseId && (
                                    <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">warning</span>
                                        Select a course before saving this material.
                                    </p>
                                )}
                            </div>
                        </section>

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
                                                <option value="theory">Theory / Reading</option>
                                                <option value="video">Video Lecture</option>
                                                <option value="slides">Slides</option>
                                                <option value="other">Other Link</option>
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
                                <p className="text-xs text-slate-500 mt-1">Choose how students will consume this material.</p>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Mode Tabs */}
                                <div className="grid grid-cols-3 gap-3">
                                    {contentModes.map((mode) => (
                                        <button
                                            key={mode.value}
                                            type="button"
                                            onClick={() => setContentMode(mode.value)}
                                            aria-pressed={contentMode === mode.value}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${contentMode === mode.value
                                                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm"
                                                    : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-slate-100"
                                                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2`}
                                        >
                                            <span
                                                className={`material-symbols-outlined text-[28px] ${contentMode === mode.value ? "text-indigo-600" : "text-slate-400"
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
                                                aria-pressed={showPreview}
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
                                                placeholder={"# Material title\n\nWrite your content in **Markdown**.\n\n## Section 1\n- Key point 1\n- Key point 2\n\n```python\nprint('Hello World')\n```"}
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
                                                Supports: headings (#), **bold**, *italic*, `code`, lists (-)
                                            </span>
                                            <span>{postContent.length} characters</span>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                                URL Link <span className="text-slate-400 font-normal">(optional)</span>
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
                                            <p className="text-xs text-slate-500 mt-1">Add a reference link if needed.</p>
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
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                            <Link
                                href="/admin/curriculum"
                                className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all text-center"
                            >
                                Cancel
                            </Link>
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
    );
}
