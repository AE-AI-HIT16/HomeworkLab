"use client";

import { useState, useTransition, useCallback } from "react";
import { updateAssignmentAction } from "@/app/admin/assignments/[id]/actions";
import type { QuizQuestion } from "@/types";

interface EditAssignmentModalProps {
    assignmentId: string;
    currentWeek: number;
    currentLesson: number;
    currentTitle: string;
    currentDescription?: string;
    currentDriveLink?: string;
    currentQuizData?: QuizQuestion[];
    assignmentType?: string;
}

export function EditAssignmentModal({
    assignmentId,
    currentWeek,
    currentLesson,
    currentTitle,
    currentDescription,
    currentDriveLink,
    currentQuizData,
    assignmentType,
}: EditAssignmentModalProps) {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<"general" | "quiz">("general");
    const [week, setWeek] = useState(currentWeek);
    const [lesson, setLesson] = useState(currentLesson);
    const [title, setTitle] = useState(currentTitle);
    const [description, setDescription] = useState(currentDescription ?? "");
    const [driveLink, setDriveLink] = useState(currentDriveLink ?? "");
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Quiz state
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(currentQuizData ?? []);

    const isQuiz = assignmentType === "quiz";

    const addQuestion = useCallback(() => {
        setQuizQuestions((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                question: "",
                options: ["", "", "", ""],
                correctIndex: -1,
            },
        ]);
    }, []);

    const removeQuestion = useCallback((index: number) => {
        setQuizQuestions((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const updateQuestion = useCallback((index: number, value: string) => {
        setQuizQuestions((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], question: value };
            return updated;
        });
    }, []);

    const updateOption = useCallback((qIndex: number, oIndex: number, value: string) => {
        setQuizQuestions((prev) => {
            const updated = [...prev];
            const options = [...updated[qIndex].options];
            options[oIndex] = value;
            updated[qIndex] = { ...updated[qIndex], options };
            return updated;
        });
    }, []);

    const setCorrectAnswer = useCallback((qIndex: number, oIndex: number) => {
        setQuizQuestions((prev) => {
            const updated = [...prev];
            updated[qIndex] = { ...updated[qIndex], correctIndex: oIndex };
            return updated;
        });
    }, []);

    const handleSave = () => {
        setError(null);
        setSuccess(false);

        const fields: Record<string, unknown> = { week, lesson, title, description, driveLink };
        if (isQuiz) {
            fields.quizData = quizQuestions;
        }

        startTransition(async () => {
            const result = await updateAssignmentAction(assignmentId, fields as { week: number; lesson: number; title: string; quizData?: QuizQuestion[] });
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
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-[slideUp_0.2s_ease] overflow-hidden max-h-[90vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-indigo-600">edit_note</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Edit Assignment</h3>
                                <p className="text-xs text-gray-500">Update assignment details{isQuiz ? " & quiz questions" : ""}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => !isPending && setOpen(false)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>

                    {/* Tabs */}
                    {isQuiz && (
                        <div className="px-6 pt-4 flex gap-1 shrink-0">
                            <button
                                onClick={() => setTab("general")}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "general" ? "bg-indigo-100 text-indigo-700" : "text-gray-500 hover:bg-gray-100"}`}
                            >
                                General
                            </button>
                            <button
                                onClick={() => setTab("quiz")}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${tab === "quiz" ? "bg-emerald-100 text-emerald-700" : "text-gray-500 hover:bg-gray-100"}`}
                            >
                                <span className="material-symbols-outlined text-[16px]">quiz</span>
                                Quiz ({quizQuestions.length} câu)
                            </button>
                        </div>
                    )}

                    {/* Body */}
                    <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
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

                        {/* General Tab */}
                        {tab === "general" && (
                            <>
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

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                        Description / Link
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Mô tả hoặc link tài liệu..."
                                        rows={3}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                        🔗 Drive / Resource Link
                                    </label>
                                    <input
                                        type="url"
                                        value={driveLink}
                                        onChange={(e) => setDriveLink(e.target.value)}
                                        placeholder="https://drive.google.com/..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all text-sm"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Link Google Drive hoặc link tài liệu bên ngoài</p>
                                </div>
                            </>
                        )}

                        {/* Quiz Tab */}
                        {tab === "quiz" && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-700">
                                        {quizQuestions.length} câu hỏi
                                    </p>
                                    <button
                                        type="button"
                                        onClick={addQuestion}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">add</span>
                                        Thêm câu
                                    </button>
                                </div>

                                {quizQuestions.map((q, qIdx) => (
                                    <div key={q.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center">
                                                    {qIdx + 1}
                                                </span>
                                                <span className="text-xs font-bold text-gray-500 uppercase">Câu {qIdx + 1}</span>
                                            </div>
                                            {quizQuestions.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeQuestion(qIdx)}
                                                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                                    title="Xóa câu hỏi"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            )}
                                        </div>

                                        <textarea
                                            value={q.question}
                                            onChange={(e) => updateQuestion(qIdx, e.target.value)}
                                            placeholder="Nhập câu hỏi..."
                                            rows={2}
                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all resize-none"
                                        />

                                        <div className="space-y-2">
                                            {q.options.map((opt, oIdx) => (
                                                <div key={oIdx} className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setCorrectAnswer(qIdx, oIdx)}
                                                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                                            q.correctIndex === oIdx
                                                                ? "bg-emerald-500 border-emerald-500 text-white"
                                                                : "border-gray-300 hover:border-emerald-400 text-transparent"
                                                        }`}
                                                        title={q.correctIndex === oIdx ? "Đáp án đúng" : "Chọn làm đáp án đúng"}
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">check</span>
                                                    </button>
                                                    <input
                                                        type="text"
                                                        value={opt}
                                                        onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                                                        placeholder={`Đáp án ${String.fromCharCode(65 + oIdx)}`}
                                                        className={`flex-1 bg-white border rounded-lg px-3 py-2 text-sm transition-all ${
                                                            q.correctIndex === oIdx
                                                                ? "border-emerald-300 ring-1 ring-emerald-200"
                                                                : "border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                                                        }`}
                                                    />
                                                    {q.correctIndex === oIdx && (
                                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                                                            ✓ Đúng
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {quizQuestions.length === 0 && (
                                    <div className="text-center py-8 text-gray-400">
                                        <span className="material-symbols-outlined text-4xl mb-2 block">quiz</span>
                                        <p className="text-sm">Chưa có câu hỏi nào.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <p className="text-[11px] text-gray-400 italic">
                            Thay đổi sẽ được cập nhật ngay trên Google Sheets và tất cả các trang.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50 shrink-0">
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
