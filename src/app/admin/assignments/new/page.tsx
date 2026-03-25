"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAssignment } from "@/server/actions";

export default function NewAssignmentPage() {
    const router = useRouter();
    const [week, setWeek] = useState(1);
    const [lesson, setLesson] = useState(1);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueAt, setDueAt] = useState("");
    const [published, setPublished] = useState(false);
    const [promptFileNames, setPromptFileNames] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        // Client-side validation
        if (!title.trim()) {
            setError("Tiêu đề không được để trống.");
            return;
        }
        if (week < 1 || !Number.isInteger(week)) {
            setError("Tuần phải là số nguyên ≥ 1.");
            return;
        }
        if (lesson < 1 || !Number.isInteger(lesson)) {
            setError("Bài phải là số nguyên ≥ 1.");
            return;
        }

        setSubmitting(true);

        const fileNames = promptFileNames
            .split("\n")
            .map((n) => n.trim())
            .filter(Boolean);

        const result = await createAssignment({
            week,
            lesson,
            title,
            description,
            dueAt: dueAt || undefined,
            published,
            promptFileNames: fileNames.length > 0 ? fileNames : undefined,
        });

        if (!result.success) {
            setError(result.error ?? "Có lỗi xảy ra.");
            setSubmitting(false);
            return;
        }

        // Redirect to admin page
        router.push("/admin");
    }

    return (
        <main className="min-h-screen p-8 max-w-2xl mx-auto">
            <nav className="mb-6 text-sm text-gray-400">
                <a href="/admin" className="hover:text-blue-500 transition">
                    Quản trị
                </a>
                <span className="mx-2">›</span>
                <span className="text-gray-700">Tạo bài tập mới</span>
            </nav>

            <h1 className="text-2xl font-bold mb-6">Tạo bài tập mới</h1>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Week & Lesson */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tuần <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={week}
                            onChange={(e) => setWeek(Number(e.target.value))}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bài <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={lesson}
                            onChange={(e) => setLesson(Number(e.target.value))}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                </div>

                {/* ID preview */}
                <p className="text-xs text-gray-400">
                    ID sẽ được tạo: <code className="bg-gray-100 px-1.5 py-0.5 rounded">w{week}-l{lesson}</code>
                </p>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tiêu đề <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="VD: Giới thiệu Python & NumPy"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        placeholder="Mô tả ngắn về nội dung bài tập..."
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
                    />
                </div>

                {/* Deadline */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hạn nộp
                    </label>
                    <input
                        type="datetime-local"
                        value={dueAt}
                        onChange={(e) => setDueAt(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                {/* Prompt files */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên file đề bài (mỗi dòng một file)
                    </label>
                    <textarea
                        value={promptFileNames}
                        onChange={(e) => setPromptFileNames(e.target.value)}
                        rows={3}
                        placeholder={"VD:\nBai_tap_1.pdf\ndata.csv\ntemplate.ipynb"}
                        className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        File thật sẽ upload lên Google Drive sau. Hiện tại chỉ lưu tên.
                    </p>
                </div>

                {/* Published */}
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={published}
                        onChange={(e) => setPublished(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400"
                    />
                    <span className="text-sm font-medium text-gray-700">
                        Publish ngay (học viên sẽ thấy bài tập)
                    </span>
                </label>

                {/* Error */}
                {error && (
                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? "Đang tạo..." : "Tạo bài tập"}
                    </button>
                    <a
                        href="/admin"
                        className="px-6 py-2.5 rounded-lg border text-sm font-medium text-gray-600 hover:bg-gray-50 transition text-center"
                    >
                        Huỷ
                    </a>
                </div>
            </form>
        </main>
    );
}
