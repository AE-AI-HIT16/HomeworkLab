"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignTeacherCourse, removeTeacherCourse } from "@/app/admin/students/actions";

interface TeacherOption {
    githubUsername: string;
    name: string;
}

interface CourseOption {
    id: string;
    name: string;
}

interface TeacherAssignment {
    githubUsername: string;
    name: string;
    courseIds: string[];
}

interface TeacherCourseManagerProps {
    teacherOptions: TeacherOption[];
    courseOptions: CourseOption[];
    teacherAssignments: TeacherAssignment[];
}

export function TeacherCourseManager({
    teacherOptions,
    courseOptions,
    teacherAssignments,
}: TeacherCourseManagerProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [selectedTeacher, setSelectedTeacher] = useState(teacherOptions[0]?.githubUsername ?? "");
    const [selectedCourse, setSelectedCourse] = useState(courseOptions[0]?.id ?? "");
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const courseNameById = useMemo(
        () => new Map(courseOptions.map((course) => [course.id, course.name])),
        [courseOptions]
    );

    const canAssign = selectedTeacher !== "" && selectedCourse !== "" && !isPending;

    const handleAssign = () => {
        if (!canAssign) return;

        startTransition(async () => {
            setFeedback(null);
            const result = await assignTeacherCourse(selectedTeacher, selectedCourse);
            if (!result.success) {
                setFeedback({ type: "error", text: result.error ?? "Failed to assign teacher." });
                return;
            }
            setFeedback({ type: "success", text: "Teacher assigned to course successfully." });
            router.refresh();
        });
    };

    const handleRemove = (githubUsername: string, courseId: string) => {
        startTransition(async () => {
            setFeedback(null);
            const result = await removeTeacherCourse(githubUsername, courseId);
            if (!result.success) {
                setFeedback({ type: "error", text: result.error ?? "Failed to remove teacher access." });
                return;
            }
            setFeedback({ type: "success", text: "Teacher access removed." });
            router.refresh();
        });
    };

    return (
        <section className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
                <div>
                    <h2 className="font-semibold text-slate-800 text-sm">Teacher Course Access</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Assign each teacher to one or multiple courses.</p>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                    {teacherAssignments.length} teachers
                </span>
            </div>

            <div className="p-5 border-b border-slate-100 bg-slate-50/70">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-slate-600">Teacher</span>
                        <select
                            value={selectedTeacher}
                            onChange={(event) => setSelectedTeacher(event.target.value)}
                            disabled={isPending || teacherOptions.length === 0}
                            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--hw-primary)]"
                        >
                            {teacherOptions.length === 0 ? (
                                <option value="">No active users available</option>
                            ) : (
                                teacherOptions.map((teacher) => (
                                    <option key={teacher.githubUsername} value={teacher.githubUsername}>
                                        {teacher.name} (@{teacher.githubUsername})
                                    </option>
                                ))
                            )}
                        </select>
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-slate-600">Course</span>
                        <select
                            value={selectedCourse}
                            onChange={(event) => setSelectedCourse(event.target.value)}
                            disabled={isPending || courseOptions.length === 0}
                            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--hw-primary)]"
                        >
                            {courseOptions.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <button
                        type="button"
                        disabled={!canAssign}
                        onClick={handleAssign}
                        className="h-10 self-end inline-flex items-center justify-center gap-1.5 px-4 rounded-lg text-sm font-semibold bg-[var(--hw-primary)] text-white hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                        {isPending ? "Assigning..." : "Assign"}
                    </button>
                </div>

                {feedback && (
                    <p className={`mt-3 text-xs font-medium ${feedback.type === "success" ? "text-emerald-700" : "text-red-600"}`}>
                        {feedback.text}
                    </p>
                )}
            </div>

            <div className="p-5">
                {teacherAssignments.length === 0 ? (
                    <p className="text-sm text-slate-500">No teacher-course assignments yet.</p>
                ) : (
                    <div className="space-y-4">
                        {teacherAssignments.map((teacher) => (
                            <div key={teacher.githubUsername} className="rounded-lg border border-slate-100 p-4">
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <span className="text-sm font-semibold text-slate-900">{teacher.name}</span>
                                    <span className="text-xs text-slate-400">@{teacher.githubUsername}</span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {teacher.courseIds.length === 0 ? (
                                        <span className="text-xs text-slate-400">No courses assigned</span>
                                    ) : (
                                        teacher.courseIds.map((courseId) => (
                                            <button
                                                key={`${teacher.githubUsername}-${courseId}`}
                                                type="button"
                                                disabled={isPending}
                                                onClick={() => handleRemove(teacher.githubUsername, courseId)}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Remove teacher access from this course"
                                            >
                                                {courseNameById.get(courseId) ?? courseId}
                                                <span className="material-symbols-outlined text-[12px]">close</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
