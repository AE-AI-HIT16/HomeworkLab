"use client";

import { useState, useTransition } from "react";
import type { QuizQuestion, Submission } from "@/types";
import { submitQuizAction } from "@/server/quiz-actions";

interface QuizFormProps {
    assignmentId: string;
    questions: QuizQuestion[];
    existingSubmission?: Submission;
    isPastDue: boolean;
}

type QuizView = "idle" | "submitting" | "result";

export function QuizForm({ assignmentId, questions, existingSubmission, isPastDue }: QuizFormProps) {
    const [isPending, startTransition] = useTransition();

    // If there's an existing quiz submission, show results
    const hasExistingQuiz = existingSubmission?.type === "quiz" && existingSubmission.quizAnswers;

    const [view, setView] = useState<QuizView>(hasExistingQuiz ? "result" : "idle");
    const [answers, setAnswers] = useState<number[]>(
        hasExistingQuiz && existingSubmission?.quizAnswers
            ? existingSubmission.quizAnswers
            : new Array(questions.length).fill(-1)
    );
    const [result, setResult] = useState<{
        score: number;
        correctCount: number;
        totalCount: number;
    } | null>(
        hasExistingQuiz
            ? {
                  score: existingSubmission?.quizScore ?? 0,
                  correctCount: existingSubmission?.quizScore
                      ? Math.round((existingSubmission.quizScore / 100) * questions.length)
                      : 0,
                  totalCount: questions.length,
              }
            : null
    );
    const [error, setError] = useState("");

    const answeredCount = answers.filter((a) => a >= 0).length;
    const progressPercent = Math.round((answeredCount / questions.length) * 100);

    const handleSelect = (qIndex: number, oIndex: number) => {
        if (view === "result") return;
        setAnswers((prev) => {
            const next = [...prev];
            next[qIndex] = oIndex;
            return next;
        });
    };

    const handleSubmit = () => {
        if (answeredCount < questions.length) {
            setError(`You still have ${questions.length - answeredCount} unanswered question(s).`);
            return;
        }
        setError("");
        startTransition(async () => {
            const res = await submitQuizAction(assignmentId, answers);
            if (!res.success) {
                setError(res.error ?? "Something went wrong.");
                return;
            }
            setResult({
                score: res.score!,
                correctCount: res.correctCount!,
                totalCount: res.totalCount!,
            });
            setView("result");
        });
    };

    const handleRetake = () => {
        setAnswers(new Array(questions.length).fill(-1));
        setResult(null);
        setError("");
        setView("idle");
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-600";
        if (score >= 60) return "text-amber-600";
        return "text-red-600";
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return "bg-emerald-50 border-emerald-200";
        if (score >= 60) return "bg-amber-50 border-amber-200";
        return "bg-red-50 border-red-200";
    };

    /** Render text with code blocks preserved (monospace for lines that look like code) */
    const renderContent = (text: string) => {
        // Simple heuristic: if it contains common code patterns, render in monospace
        const lines = text.split("\n");
        if (lines.length === 1 && !text.includes("  ") && !text.match(/[{}();=<>]/)) {
            return <span>{text}</span>;
        }
        return <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed">{text}</pre>;
    };

    return (
        <div className="w-full space-y-6">
            {/* Result Banner — only score, no answers */}
            {view === "result" && result && (
                <div className={`rounded-xl border-2 p-6 ${getScoreBg(result.score)}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                                result.score >= 80 ? "bg-emerald-500" : result.score >= 60 ? "bg-amber-500" : "bg-red-500"
                            } text-white shadow-lg`}>
                                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    {result.score >= 80 ? "emoji_events" : result.score >= 60 ? "thumb_up" : "sentiment_dissatisfied"}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-[var(--hw-on-surface-variant)]">Result</p>
                                <p className={`text-3xl font-black ${getScoreColor(result.score)}`}>
                                    {result.score}<span className="text-lg font-bold">/100</span>
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-[var(--hw-on-surface)]">
                                {result.correctCount}/{result.totalCount} correct
                            </p>
                            <p className="text-xs text-[var(--hw-on-surface-variant)]">
                                {result.score >= 80 ? "Excellent! 🎉" : result.score >= 60 ? "Great job! 👍" : "Review and try again 📚"}
                            </p>
                        </div>
                    </div>

                    {/* Score bar */}
                    <div className="h-2 w-full bg-white/60 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${
                                result.score >= 80 ? "bg-emerald-500" : result.score >= 60 ? "bg-amber-500" : "bg-red-500"
                            }`}
                            style={{ width: `${result.score}%` }}
                        />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-xs text-[var(--hw-on-surface-variant)] italic">
                            {existingSubmission?.isLate ? "⚠️ Submitted late" : "✓ On time"}
                        </p>
                        <button
                            onClick={handleRetake}
                            className="flex items-center gap-1.5 text-xs font-bold text-[var(--hw-primary)] bg-white/80 px-3 py-1.5 rounded-lg hover:bg-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">refresh</span>
                            Retake
                        </button>
                    </div>

                    {/* Info: improved instruction */}
                    <div className="mt-4 flex items-start gap-2.5 p-3 bg-white/50 rounded-lg">
                        <span className="material-symbols-outlined text-[var(--hw-on-surface-variant)] text-sm flex-shrink-0 mt-0.5">info</span>
                        <p className="text-[11px] text-[var(--hw-on-surface-variant)] leading-relaxed">
                            You can review your selected answers below. Retake the quiz anytime to improve your score.
                        </p>
                    </div>
                </div>
            )}

            {/* Progress Bar (quiz in progress) */}
            {view === "idle" && (
                <div className="bg-white rounded-xl border border-[var(--hw-surface-container-high)] p-4 flex items-center gap-4">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-[var(--hw-on-surface-variant)] uppercase tracking-widest">Progress</span>
                            <span className="text-xs font-bold text-[var(--hw-primary)]">{answeredCount}/{questions.length}</span>
                        </div>
                        <div className="h-2 w-full bg-[var(--hw-surface-container-low)] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[var(--hw-primary)] rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                    {isPastDue && (
                        <span className="px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider bg-amber-100 text-amber-700">
                            LATE
                        </span>
                    )}
                </div>
            )}

            {/* Questions — reveal correct/wrong status, but not the correct answers for wrong ones */}
            {(view === "idle" || view === "result") && (
                <div className="space-y-4">
                    {questions.map((q, qIdx) => {
                        const isCorrect = answers[qIdx] === q.correctIndex;
                        const hasAnswered = answers[qIdx] >= 0;

                        return (
                            <div
                                key={q.id}
                                className={`bg-white rounded-xl border overflow-hidden transition-all ${
                                    view === "result"
                                        ? isCorrect
                                            ? "border-emerald-500/50"
                                            : "border-red-500/50 shadow-sm shadow-red-500/5"
                                        : hasAnswered
                                            ? "border-[var(--hw-primary)]/30"
                                            : "border-[var(--hw-surface-container-high)]"
                                }`}
                            >
                                {/* Question Header */}
                                <div className={`px-5 py-3 flex items-start gap-3 ${
                                    view === "result" 
                                        ? isCorrect ? "bg-emerald-50" : "bg-red-50"
                                        : "bg-[var(--hw-surface-container-lowest)]"
                                }`}>
                                    <div className="relative mt-0.5 flex-shrink-0">
                                        <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                                            view === "result"
                                                ? isCorrect ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                                                : hasAnswered
                                                    ? "bg-[var(--hw-primary)] text-white"
                                                    : "bg-[var(--hw-surface-container-high)] text-[var(--hw-on-surface-variant)]"
                                        }`}>
                                            {qIdx + 1}
                                        </span>
                                        {view === "result" && (
                                            <span className={`absolute -right-1 -top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[10px] ${
                                                isCorrect ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                                            }`}>
                                                <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                    {isCorrect ? "check" : "close"}
                                                </span>
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 text-sm font-medium text-[var(--hw-on-surface)]">
                                        {renderContent(q.question)}
                                    </div>
                                </div>

                                {/* Options */}
                                <div className="p-4 space-y-2 text-sm">
                                    {q.options.map((opt, oIdx) => {
                                        if (!opt.trim()) return null;
                                        const isSelected = answers[qIdx] === oIdx;

                                        let optionClasses = "bg-[var(--hw-surface-container-lowest)] border-[var(--hw-outline-variant)]/20 hover:border-[var(--hw-primary)]/40";
                                        let labelClasses = "bg-[var(--hw-surface-container-high)] text-[var(--hw-on-surface-variant)]";
                                        let textClasses = "text-[var(--hw-on-surface)]";

                                        if (isSelected) {
                                            if (view === "result") {
                                                if (isCorrect) {
                                                    optionClasses = "bg-emerald-500 text-white border-emerald-500 shadow-sm";
                                                    labelClasses = "bg-white/20 text-white";
                                                    textClasses = "text-white font-medium";
                                                } else {
                                                    optionClasses = "bg-red-500 text-white border-red-500 shadow-sm";
                                                    labelClasses = "bg-white/20 text-white";
                                                    textClasses = "text-white font-medium";
                                                }
                                            } else {
                                                optionClasses = "bg-[var(--hw-primary)]/5 border-[var(--hw-primary)] shadow-sm";
                                                labelClasses = "bg-[var(--hw-primary)] text-white";
                                            }
                                        }

                                        return (
                                            <button
                                                key={oIdx}
                                                type="button"
                                                disabled={view === "result"}
                                                onClick={() => handleSelect(qIdx, oIdx)}
                                                className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${optionClasses}`}
                                            >
                                                <span className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${labelClasses}`}>
                                                    {String.fromCharCode(65 + oIdx)}
                                                </span>
                                                <div className={`flex-1 text-sm ${textClasses}`}>
                                                    {renderContent(opt)}
                                                </div>
                                                {isSelected && view === "result" && (
                                                    <span className="material-symbols-outlined text-sm pt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                        {isCorrect ? "check_circle" : "cancel"}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                    <span className="material-symbols-outlined text-sm">error</span>
                    {error}
                </div>
            )}

            {/* Submit Button */}
            {view === "idle" && (
                <div className="fixed md:static left-0 bottom-0 w-full md:w-auto p-4 md:p-0 bg-white/95 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none border-t border-[var(--hw-outline-variant)]/20 md:border-none z-40 md:mt-6 flex flex-col items-center shadow-[0_-10px_20px_rgba(0,0,0,0.05)] md:shadow-none">
                    {isPastDue && (
                        <p className="text-[10px] text-amber-600 font-medium mb-2 md:mb-3 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded w-full md:w-auto justify-center">
                            <span className="material-symbols-outlined text-[14px]">warning</span>
                            Late submissions may lose points.
                        </p>
                    )}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isPending || answeredCount === 0}
                        className="w-full bg-emerald-500 text-white text-[15px] md:text-sm font-semibold py-3.5 md:py-2.5 rounded-xl md:rounded-lg hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(16,185,129,0.25)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                Submitting...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-sm">send</span>
                                Submit Quiz ({answeredCount}/{questions.length})
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
