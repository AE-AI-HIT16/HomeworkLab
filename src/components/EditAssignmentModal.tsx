"use client";

import { useState, useTransition } from "react";
import { updateAssignmentAction } from "@/app/admin/assignments/[id]/actions";

interface EditAssignmentModalProps {
    assignmentId: string;
    currentWeek: number;
    currentLesson: number;
    currentTitle: string;
}

export function EditAssignmentModal({
    assignmentId,
    currentWeek,
    currentLesson,
    currentTitle,
}: EditAssignmentModalProps) {
    const [open, setOpen] = useState(false);
    const [week, setWeek] = useState(currentWeek);
    const [lesson, setLesson] = useState(currentLesson);
    const [title, setTitle] = useState(currentTitle);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSave = () => {
        setError(null);
        setSuccess(false);
        startTransition(async () => {
            const result = await updateAssignmentAction(assignmentId, {
                week,
                lesson,
                title,
            });
            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    setOpen(false);
                    setSuccess(false);
                }, 800);
            } else {
                setError(result.error || "Something went wrong.");
            }
        });
    };

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Edit
            </button>
        );
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-[fadeIn_0.15s_ease]"
                onClick={() => !isPending && setOpen(false)}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-[slideUp_0.2s_ease] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-indigo-600">edit_note</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Edit Assignment</h3>
                                <p className="text-xs text-gray-500">Update week, lesson, or title</p>
                            </div>
                        </div>
                        <button
                            onClick={() => !isPending && setOpen(false)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5 space-y-5">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">error</span>
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-sm text-emerald-600 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                Đã cập nhật thành công!
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Week
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    value={week}
                                    onChange={(e) => setWeek(parseInt(e.target.value) || 1)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Lesson
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    value={lesson}
                                    onChange={(e) => setLesson(parseInt(e.target.value) || 1)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                                />
                            </div>
                        </div>

                        <p className="text-[11px] text-gray-400 italic">
                            Thay đổi sẽ được cập nhật ngay trên Google Sheets và tất cả các trang.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
                        <button
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                            className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isPending || !title.trim()}
                            className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                        >
                            {isPending ? (
                                <>
                                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[18px]">save</span>
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
