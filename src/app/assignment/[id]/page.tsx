import { requireSession } from "@/lib/auth";
import { getAssignmentById, getSubmission } from "@/lib/google-sheets";
import { PromptFileList } from "@/components/PromptFileList";
import { SubmissionForm } from "@/components/SubmissionForm";
import { notFound } from "next/navigation";
import Link from "next/link";

interface AssignmentPageProps {
    params: Promise<{ id: string }>;
}

function formatDate(iso?: string): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default async function AssignmentPage({ params }: AssignmentPageProps) {
    const { id } = await params;
    const session = await requireSession();
    const user = session.user;

    const assignment = await getAssignmentById(id);
    if (!assignment || !assignment.published) {
        notFound();
    }

    const existingSubmission = await getSubmission(id, user.githubUsername);
    const isPastDue = assignment.dueAt ? new Date(assignment.dueAt) < new Date() : false;

    return (
        <main className="min-h-screen p-8 max-w-3xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm text-gray-400">
                <Link href="/dashboard" className="hover:text-blue-500 transition">
                    Dashboard
                </Link>
                <span className="mx-2">›</span>
                <span className="text-gray-700">
                    Tuần {assignment.week} / Bài {assignment.lesson}
                </span>
            </nav>

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md">
                        Tuần {assignment.week}
                    </span>
                    <span className="text-xs text-gray-400">Bài {assignment.lesson}</span>
                    {isPastDue && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                            Quá hạn
                        </span>
                    )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
                {assignment.description && (
                    <p className="text-gray-600 mt-2">{assignment.description}</p>
                )}
                <p className="text-sm text-gray-400 mt-3">
                    🕐 Hạn nộp: {formatDate(assignment.dueAt)}
                </p>
            </div>

            {/* Prompt files */}
            <section className="mb-8">
                <h2 className="text-lg font-semibold mb-3">📄 File đề bài</h2>
                <PromptFileList files={assignment.promptFiles} />
            </section>

            {/* Submission form */}
            <section className="border-t pt-6">
                <h2 className="text-lg font-semibold mb-4">📤 Nộp bài</h2>
                <SubmissionForm
                    assignmentId={assignment.id}
                    existingSubmission={existingSubmission}
                    isPastDue={isPastDue}
                />
            </section>
        </main>
    );
}
