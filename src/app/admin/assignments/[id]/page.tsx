import { getCurrentUserRole } from "@/lib/roles";
import { getAssignmentDetailsWithSubmissions } from "@/lib/google-sheets";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { AdminSubmissionTable } from "@/components/AdminSubmissionTable";

interface AdminAssignmentDetailPageProps {
    params: Promise<{ id: string }>;
}

function formatDate(iso?: string): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default async function AdminAssignmentDetailPage({ params }: AdminAssignmentDetailPageProps) {
    const { id } = await params;

    const { role, session } = await getCurrentUserRole();
    if (role !== "admin" || !session) redirect("/dashboard");

    const data = await getAssignmentDetailsWithSubmissions(id);
    if (!data) notFound();

    const { assignment, stats, rows } = data;
    const isPastDue = assignment.dueAt ? new Date(assignment.dueAt) < new Date() : false;

    return (
        <main className="max-w-5xl mx-auto p-6 md:p-8">
            <Link
                href="/admin"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium mb-6 inline-block"
            >
                ← Back to Dashboard
            </Link>

            {/* Header */}
            <header className="mb-8">
                <div className="flex items-start gap-4 justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                Week {assignment.week} / Lesson {assignment.lesson}
                            </span>
                            <span
                                className={`text-sm px-3 py-1 rounded-full font-medium ${assignment.published
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-500"
                                    }`}
                            >
                                {assignment.published ? "Published" : "Draft"}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
                    </div>
                </div>

                <div className="bg-white border rounded-xl p-5 mt-6 shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500 font-medium">Due Date</p>
                            <p className={`text-lg font-semibold mt-1 ${isPastDue ? "text-red-600" : "text-gray-900"}`}>
                                {formatDate(assignment.dueAt)}
                            </p>
                            {isPastDue && <p className="text-xs text-red-500 mt-1">Overdue</p>}
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-600 font-medium">Progress</p>
                            <p className="text-lg font-bold text-blue-900 mt-1">
                                {stats.submitted} / {stats.total}
                            </p>
                            <p className="text-xs text-blue-500 mt-1">Students submitted</p>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-lg">
                            <p className="text-sm text-amber-600 font-medium">Late</p>
                            <p className="text-lg font-bold text-amber-900 mt-1">{stats.late}</p>
                            <p className="text-xs text-amber-500 mt-1">Submitted late</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-600 font-medium">Content</p>
                            <p className="text-lg font-bold text-green-900 mt-1">
                                {stats.files} <span className="text-sm font-normal">Files</span> · {stats.repos} <span className="text-sm font-normal">Repos</span>
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* List */}
            <h2 className="text-xl font-bold text-gray-900 mb-4">Detailed Submission Status</h2>
            <AdminSubmissionTable assignmentId={assignment.id} rows={rows} />
        </main>
    );
}
