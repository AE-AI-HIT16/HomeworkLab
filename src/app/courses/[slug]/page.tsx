import { notFound } from "next/navigation";
import Link from "next/link";
import { getCourseById } from "@/lib/courses";
import { requireSession } from "@/lib/auth";
import { getCurrentUserRole } from "@/lib/roles";
import { getAssignments, getSubmissionsByStudent, getMaterials } from "@/lib/google-sheets";
import { TopNav } from "@/components/TopNav";
import type { Assignment, Submission, Material } from "@/types";

export const dynamic = "force-dynamic";

function getSubmissionStatus(assignment: Assignment, submission?: Submission) {
    if (submission) {
        return { label: "Completed", type: "completed" as const, icon: "check_circle" };
    }
    if (assignment.dueAt) {
        const due = new Date(assignment.dueAt);
        const now = new Date();
        const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
            return { label: "Overdue", type: "overdue" as const, icon: "error" };
        }
        if (diffDays <= 3) {
            return { label: `Due Soon (${diffDays}d)`, type: "due-soon" as const, icon: "priority_high" };
        }
    }
    return { label: "Pending", type: "pending" as const, icon: "schedule" };
}

function formatDueDate(dueAt?: string) {
    if (!dueAt) return "No due date";
    const d = new Date(dueAt);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const course = getCourseById(slug);

    if (!course) {
        notFound();
    }

    const session = await requireSession();
    const { role } = await getCurrentUserRole();
    const user = session.user;

    // We only have real data for 'ai-core' right now.
    // In a real app, we'd filter assignments by courseId.
    const allAssignments = course.id === "ai-core" ? await getAssignments() : [];
    const publishedAssignments = allAssignments.filter((a) => a.published);
    const userSubmissions = course.id === "ai-core" ? await getSubmissionsByStudent(user.githubUsername) : [];

    const allMaterials = course.id === "ai-core" ? await getMaterials() : [];
    const publishedMaterials = allMaterials.filter((m) => m.published);

    const submissionMap = new Map<string, Submission>(
        userSubmissions.map((s) => [s.assignmentId, s])
    );

    // Group assignments and materials into Modules (Weeks)
    type ModuleItem = { kind: "assignment"; data: Assignment } | { kind: "material"; data: Material };
    const weekMap = new Map<number, { title: string; items: ModuleItem[] }>();

    for (const m of publishedMaterials) {
        const existing = weekMap.get(m.week);
        if (existing) {
            existing.items.push({ kind: "material", data: m });
        } else {
            weekMap.set(m.week, { title: `Module ${m.week}: Week ${m.week}`, items: [{ kind: "material", data: m }] });
        }
    }

    for (const a of publishedAssignments) {
        const existing = weekMap.get(a.week);
        if (existing) {
            existing.items.push({ kind: "assignment", data: a });
        } else {
            weekMap.set(a.week, { title: `Module ${a.week}: Week ${a.week}`, items: [{ kind: "assignment", data: a }] });
        }
    }

    // Sort items: Materials first, Assignments second ordered by lesson
    for (const [_, module] of weekMap) {
        module.items.sort((a, b) => {
            if (a.kind === "material" && b.kind === "assignment") return -1;
            if (a.kind === "assignment" && b.kind === "material") return 1;
            if (a.kind === "assignment" && b.kind === "assignment") return a.data.lesson - b.data.lesson;
            return 0; // Maintain original sheet order for materials
        });
    }

    const modules = Array.from(weekMap.entries()).sort(([a], [b]) => a - b);

    // Calculate Progress dynamically if data exists
    const totalAssignments = publishedAssignments.length;
    const submittedCount = userSubmissions.filter(s => publishedAssignments.some(a => a.id === s.assignmentId)).length;
    const progressPct = totalAssignments > 0 ? Math.round((submittedCount / totalAssignments) * 100) : course.progress;

    // Find next actionable assignment
    const pendingAssignments = publishedAssignments
        .filter((a) => !submissionMap.has(a.id))
        .sort((a, b) => {
            if (a.week !== b.week) return a.week - b.week;
            return a.lesson - b.lesson;
        });
    const nextUp = pendingAssignments.length > 0 ? pendingAssignments[0] : null;

    return (
        <div className="min-h-screen bg-[var(--hw-surface)] text-[var(--hw-on-surface)] antialiased pb-24">
            <TopNav
                user={{
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    githubUsername: user.githubUsername,
                }}
                role={role}
                showSearch={false}
            />

            <main className="pt-16">
                {/* ═══ HERO SECTION ═══ */}
                <div className={`relative bg-gradient-to-br ${course.gradient} pt-20 pb-12 px-6 md:px-12 overflow-hidden`}>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] mix-blend-overlay" />
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

                    <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 text-white">
                        <div className="max-w-2xl">
                            <Link href="/courses" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-6 transition-colors">
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                Back to Courses
                            </Link>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                                    <span className="material-symbols-outlined text-[28px]">{course.icon}</span>
                                </div>
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-1">
                                        {course.name}
                                    </h1>
                                    <p className="text-sm md:text-base font-medium text-white/80 uppercase tracking-widest">
                                        {course.tagline}
                                    </p>
                                </div>
                            </div>
                            <p className="text-white/90 text-lg leading-relaxed mb-8 max-w-xl">
                                {course.description}
                            </p>
                        </div>

                        {/* Progress Card */}
                        <div className="w-full md:w-80 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl shrink-0">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-white/80">Your Progress</span>
                                <span className="text-lg font-bold">{progressPct}%</span>
                            </div>
                            <div className="h-2.5 bg-black/20 rounded-full overflow-hidden mb-6">
                                <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${progressPct}%` }} />
                            </div>
                            {nextUp ? (
                                <Link
                                    href={`/assignment/${nextUp.id}`}
                                    className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 py-3 rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Resume Learning
                                    <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                                </Link>
                            ) : (
                                <button disabled className="w-full py-3 rounded-xl font-bold bg-white/20 text-white/50 cursor-not-allowed">
                                    Course Completed
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ═══ TWO COLUMN LAYOUT ═══ */}
                <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* LEFT: SYLLABUS */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined">menu_book</span>
                            Course Syllabus
                        </h2>

                        {modules.length === 0 ? (
                            <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center">
                                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-[32px]">construction</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Under Construction</h3>
                                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                                    The curriculum for {course.name} is currently being finalized. Please check back later.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {modules.map(([weekNum, { title, items }]) => {
                                    // Calculate module progress (only assignments count towards completion)
                                    const moduleAssignments = items.filter((i) => i.kind === "assignment");
                                    const moduleTotal = moduleAssignments.length;
                                    const moduleCompleted = moduleAssignments.filter(i => i.kind === "assignment" && submissionMap.has(i.data.id)).length;
                                    const isModuleDone = moduleTotal > 0 && moduleCompleted === moduleTotal;

                                    return (
                                        <div key={weekNum} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                            {/* Module Header */}
                                            <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        {isModuleDone ? (
                                                            <div className={`w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center`}>
                                                                <span className="material-symbols-outlined text-[14px]">done</span>
                                                            </div>
                                                        ) : (
                                                            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                                                                {weekNum}
                                                            </div>
                                                        )}
                                                        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                                                    </div>
                                                    <p className="text-sm text-slate-500 ml-9">
                                                        {moduleCompleted}/{moduleTotal} assignments completed
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Module Content (Lessons & Materials) */}
                                            <div className="divide-y divide-slate-100">
                                                {items.map((item, idx) => {
                                                    if (item.kind === "material") {
                                                        const m = item.data;
                                                        let iconName = "article";
                                                        if (m.type === "video") iconName = "play_circle";
                                                        if (m.type === "slides") iconName = "slideshow";

                                                        // Mode-specific icon & behavior
                                                        let modeIcon = "open_in_new"; // link default
                                                        let modeLabel = "";
                                                        if (m.contentMode === "file") {
                                                            modeIcon = "visibility";
                                                            modeLabel = "Preview";
                                                        } else if (m.contentMode === "post") {
                                                            iconName = "edit_note";
                                                            modeIcon = "arrow_forward";
                                                            modeLabel = "Read";
                                                        }

                                                        // Post and File modes: navigate to internal page
                                                        const isInternal = m.contentMode === "post" || m.contentMode === "file";
                                                        const href = isInternal ? `/materials/${m.id}` : m.url;
                                                        const Tag = isInternal ? Link : "a" as any;
                                                        const extraProps = isInternal ? {} : { target: "_blank", rel: "noopener noreferrer" };

                                                        return (
                                                            <Tag href={href} key={`mat-${m.id}-${idx}`} className="group flex items-start sm:items-center justify-between p-4 md:px-6 hover:bg-slate-50 transition-colors gap-4" {...extraProps}>
                                                                <div className="flex items-start sm:items-center gap-4">
                                                                    <div className="shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center text-slate-500 bg-slate-50 border-slate-200">
                                                                        <span className="material-symbols-outlined text-[20px]">{iconName}</span>
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 capitalize">{m.type}</span>
                                                                            {m.contentMode !== "link" && (
                                                                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                                                                    m.contentMode === "post" 
                                                                                        ? "bg-violet-100 text-violet-700" 
                                                                                        : "bg-sky-100 text-sky-700"
                                                                                }`}>
                                                                                    {m.contentMode === "post" ? "Post" : "File"}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                                            {m.title}
                                                                        </h4>
                                                                    </div>
                                                                </div>
                                                                <div className="hidden sm:flex flex-col items-end gap-1">
                                                                    {modeLabel && (
                                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{modeLabel}</span>
                                                                    )}
                                                                    <span className="material-symbols-outlined text-slate-300 group-hover:text-indigo-400">{modeIcon}</span>
                                                                </div>
                                                            </Tag>
                                                        );
                                                    } else {
                                                        const a = item.data;
                                                        const sub = submissionMap.get(a.id);
                                                        const status = getSubmissionStatus(a, sub);

                                                        let statusColor = "text-slate-400 bg-slate-50 border-slate-200";
                                                        if (status.type === "completed") statusColor = "text-emerald-700 bg-emerald-50 border-emerald-100";
                                                        if (status.type === "due-soon") statusColor = "text-amber-700 bg-amber-50 border-amber-100";
                                                        if (status.type === "overdue") statusColor = "text-red-700 bg-red-50 border-red-100";
                                                        if (status.type === "pending" && a.id === nextUp?.id) statusColor = "text-indigo-700 bg-indigo-50 border-indigo-100 ring-1 ring-indigo-500/20"; // Active highlight

                                                        return (
                                                            <Link href={`/assignment/${a.id}`} key={`ast-${a.id}`} className="group flex items-start sm:items-center justify-between p-4 md:px-6 hover:bg-slate-50 transition-colors gap-4">
                                                                <div className="flex items-start sm:items-center gap-4">
                                                                    {/* Icon */}
                                                                    <div className={`shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center ${statusColor}`}>
                                                                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: status.type === 'completed' ? "'FILL' 1" : "" }}>
                                                                            {status.icon}
                                                                        </span>
                                                                    </div>

                                                                    {/* Lesson Details */}
                                                                    <div>
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lesson {a.lesson}</span>
                                                                            {a.id === nextUp?.id && (
                                                                                <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-bold uppercase tracking-wider rounded">Next Up</span>
                                                                            )}
                                                                        </div>
                                                                        <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                                                                            {a.title}
                                                                            {a.assignmentType === "quiz" && (
                                                                                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase tracking-wider rounded flex-shrink-0">Quiz</span>
                                                                            )}
                                                                        </h4>
                                                                    </div>
                                                                </div>

                                                                {/* Right Side Status */}
                                                                <div className="hidden sm:flex flex-col items-end gap-1">
                                                                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusColor.replace('border', '')}`}>
                                                                        {status.label}
                                                                    </span>
                                                                    {a.dueAt && status.type !== "completed" && (
                                                                        <span className="text-xs text-slate-400 font-medium">
                                                                            Due {formatDueDate(a.dueAt)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </Link>
                                                        );
                                                    }
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: SIDEBAR */}
                    <div className="space-y-6">
                        {/* Course Information */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-4">Course Info</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                    <span className="flex items-center gap-2 text-sm text-slate-600">
                                        <span className="material-symbols-outlined text-[18px]">menu_book</span>
                                        Total Lessons
                                    </span>
                                    <span className="font-semibold text-slate-900">{totalAssignments > 0 ? totalAssignments : course.lessons}</span>
                                </div>
                                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                    <span className="flex items-center gap-2 text-sm text-slate-600">
                                        <span className="material-symbols-outlined text-[18px]">group</span>
                                        Mentorship
                                    </span>
                                    <span className="font-semibold text-slate-900">HIT Support Team</span>
                                </div>
                                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                    <span className="flex items-center gap-2 text-sm text-slate-600">
                                        <span className="material-symbols-outlined text-[18px]">verified</span>
                                        Prerequisites
                                    </span>
                                    <span className="font-semibold text-slate-900 text-right text-xs">
                                        Basic Programming<br />High School Math
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Useful Links */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                            <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-4">Resources</h3>
                            <div className="space-y-2">
                                <a href="#" className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-colors group">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" className="w-5 h-5 opacity-70 group-hover:opacity-100" alt="Notion" />
                                    <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600">Course Materials</span>
                                </a>
                                <a href="https://m.me/j/AbZAVqiI0kPWfa3X/?send_source=gc:copy_invite_link_c" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-colors group">
                                    <span className="material-symbols-outlined text-slate-400 group-hover:text-indigo-600">forum</span>
                                    <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600">Discussion Group</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
