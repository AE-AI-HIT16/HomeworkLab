"use client";

import { useState, useTransition } from "react";
import { gradeSubmissionAction } from "@/app/admin/assignments/[id]/actions";

interface GradeSubmissionModalProps {
    assignmentId: string;
    studentName: string;
    githubUsername: string;
    currentGrade?: number;
    currentFeedback?: string;
    onClose: () => void;
}

export default function GradeSubmissionModal({
    assignmentId,
    studentName,
    githubUsername,
    currentGrade,
    currentFeedback,
    onClose,
}: GradeSubmissionModalProps) {
    const [grade, setGrade] = useState<string>(currentGrade?.toString() ?? "");
    const [feedback, setFeedback] = useState<string>(currentFeedback ?? "");
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const gradeNum = parseInt(grade);
        if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
            setError("Score must be a number between 0 and 100");
            return;
        }

        startTransition(async () => {
            const result = await gradeSubmissionAction(
                assignmentId,
                githubUsername,
                gradeNum,
                feedback
            );

            if (result.success) {
                onClose();
            } else {
                setError(result.error ?? "An error occurred");
            }
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold text-slate-900">Grade Submission</h3>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                        disabled={isPending}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Student</p>
                        <p className="font-semibold text-slate-900">{studentName} <span className="text-slate-400 font-normal">(@{githubUsername})</span></p>
                    </div>

                    <div>
                        <label htmlFor="grade" className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                            Score (0-100)
                        </label>
                        <input
                            id="grade"
                            type="number"
                            min="0"
                            max="100"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-semibold text-lg"
                            placeholder="Enter score..."
                            required
                            autoFocus
                        />
                    </div>

                    <div>
                        <label htmlFor="feedback" className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                            Instructor&apos;s Feedback
                        </label>
                        <textarea
                            id="feedback"
                            rows={4}
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm resize-none"
                            placeholder="Write a brief feedback for the student..."
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">error</span>
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                            disabled={isPending}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-2.5 px-4 rounded-xl bg-[var(--hw-primary)] text-white font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-70"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Grade & Feedback"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
