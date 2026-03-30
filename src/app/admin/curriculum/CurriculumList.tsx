"use client";

import { useState, useTransition, useRef } from "react";
import { deleteAssignmentAction, deleteMaterialAction, renameMaterialAction } from "./actions";
import type { Assignment, Material } from "@/types";

interface DeleteButtonProps {
    id: string;
    type: "assignment" | "material";
    title: string;
    onDeleted: () => void;
}

function DeleteButton({ id, type, title, onDeleted }: DeleteButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = () => {
        startTransition(async () => {
            const result = type === "assignment"
                ? await deleteAssignmentAction(id)
                : await deleteMaterialAction(id);

            if (result.success) {
                onDeleted();
            } else {
                alert(`Lỗi: ${result.error}`);
            }
            setShowConfirm(false);
        });
    };

    if (showConfirm) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-xs text-red-600 font-medium">Xóa?</span>
                <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="px-2 py-1 bg-red-600 text-white text-xs rounded-lg font-bold hover:bg-red-700 disabled:opacity-50"
                >
                    {isPending ? "..." : "Có"}
                </button>
                <button
                    onClick={() => setShowConfirm(false)}
                    className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded-lg font-bold hover:bg-slate-300"
                >
                    Hủy
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title={`Xóa "${title}"`}
        >
            <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
    );
}

interface EditTitleButtonProps {
    id: string;
    currentTitle: string;
    onRenamed: (newTitle: string) => void;
}

function EditTitleButton({ id, currentTitle, onRenamed }: EditTitleButtonProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(currentTitle);
    const [isPending, startTransition] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        if (!value.trim() || value.trim() === currentTitle) {
            setIsEditing(false);
            setValue(currentTitle);
            return;
        }
        startTransition(async () => {
            const result = await renameMaterialAction(id, value.trim());
            if (result.success) {
                onRenamed(value.trim());
            } else {
                alert(`Lỗi: ${result.error}`);
                setValue(currentTitle);
            }
            setIsEditing(false);
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSave();
        if (e.key === "Escape") {
            setIsEditing(false);
            setValue(currentTitle);
        }
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    autoFocus
                    disabled={isPending}
                    className="flex-1 min-w-0 text-sm font-semibold text-slate-800 bg-white border border-indigo-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                />
                {isPending && <span className="material-symbols-outlined text-[16px] text-indigo-500 animate-spin">progress_activity</span>}
            </div>
        );
    }

    return (
        <h4
            className="text-sm font-semibold text-slate-800 cursor-pointer hover:text-indigo-600 transition-colors group/edit inline-flex items-center gap-1"
            onClick={() => setIsEditing(true)}
            title="Click to edit title"
        >
            {currentTitle}
            <span className="material-symbols-outlined text-[14px] text-slate-300 opacity-0 group-hover/edit:opacity-100 transition-opacity">edit</span>
        </h4>
    );
}

interface CurriculumListProps {
    assignments: Assignment[];
    materials: Material[];
}

export function CurriculumList({ assignments: initialAssignments, materials: initialMaterials }: CurriculumListProps) {
    const [assignments, setAssignments] = useState(initialAssignments);
    const [materials, setMaterials] = useState(initialMaterials);

    // Group by week
    const weeks = new Set([
        ...assignments.map(a => a.week),
        ...materials.map(m => m.week),
    ]);
    const sortedWeeks = Array.from(weeks).sort((a, b) => a - b);

    return (
        <div className="space-y-6">
            {sortedWeeks.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
                    <span className="material-symbols-outlined text-[48px] text-slate-300 mb-3 block">inventory_2</span>
                    <h3 className="font-bold text-slate-900 mb-1">Chưa có nội dung nào</h3>
                    <p className="text-sm text-slate-500">Hãy thêm Bài tập hoặc Tài liệu từ sidebar bên trái.</p>
                </div>
            ) : (
                sortedWeeks.map(weekNum => {
                    const weekAssignments = assignments.filter(a => a.week === weekNum);
                    const weekMaterials = materials.filter(m => m.week === weekNum);

                    return (
                        <div key={weekNum} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            {/* Week Header */}
                            <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                                        {weekNum}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Module {weekNum}: Week {weekNum}</h3>
                                        <p className="text-xs text-slate-500">
                                            {weekMaterials.length} materials · {weekAssignments.length} assignments
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="divide-y divide-slate-100">
                                {/* Materials first */}
                                {weekMaterials.map(m => (
                                    <div key={`mat-${m.id}`} className="flex items-center justify-between p-4 px-5 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                                                <span className="material-symbols-outlined text-[18px]">
                                                    {m.type === "video" ? "play_circle" : m.type === "slides" ? "slideshow" : "article"}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{m.type}</span>
                                                    {!m.published && (
                                                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">Draft</span>
                                                    )}
                                                    {m.contentMode && m.contentMode !== "link" && (
                                                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                                            m.contentMode === "post" 
                                                                ? "bg-violet-100 text-violet-700" 
                                                                : "bg-sky-100 text-sky-700"
                                                        }`}>
                                                            {m.contentMode === "post" ? "Post" : "File"}
                                                        </span>
                                                    )}
                                                </div>
                                                <EditTitleButton
                                                    id={m.id}
                                                    currentTitle={m.title}
                                                    onRenamed={(newTitle) => setMaterials(prev => prev.map(x => x.id === m.id ? { ...x, title: newTitle } : x))}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a href={m.url} target="_blank" rel="noopener noreferrer"
                                                className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Open link"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                            </a>
                                            <DeleteButton
                                                id={m.id}
                                                type="material"
                                                title={m.title}
                                                onDeleted={() => setMaterials(prev => prev.filter(x => x.id !== m.id))}
                                            />
                                        </div>
                                    </div>
                                ))}

                                {/* Assignments */}
                                {weekAssignments.map(a => (
                                    <div key={`ast-${a.id}`} className="flex items-center justify-between p-4 px-5 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                                                <span className="material-symbols-outlined text-[18px]">assignment</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lesson {a.lesson}</span>
                                                    {!a.published && (
                                                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">Draft</span>
                                                    )}
                                                </div>
                                                <h4 className="text-sm font-semibold text-slate-800">{a.title}</h4>
                                                {a.dueAt && (
                                                    <p className="text-[10px] text-slate-400 mt-0.5">Due: {new Date(a.dueAt).toLocaleDateString("vi-VN")}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a href={`/admin/assignments/${a.id}`}
                                                className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="View details"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                                            </a>
                                            <DeleteButton
                                                id={a.id}
                                                type="assignment"
                                                title={a.title}
                                                onDeleted={() => setAssignments(prev => prev.filter(x => x.id !== a.id))}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
