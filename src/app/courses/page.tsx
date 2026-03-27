import { requireSession } from "@/lib/auth";
import { getCurrentUserRole } from "@/lib/roles";
import Link from "next/link";
import { TopNav } from "@/components/TopNav";

export const dynamic = "force-dynamic";

interface Course {
    id: string;
    name: string;
    tagline: string;
    description: string;
    lessons: number;
    assignments: number;
    progress: number;
    status: "active" | "coming-soon";
    gradient: string;
    icon: string;
    accentColor: string;
    buttonClass: string;
}

const courses: Course[] = [
    {
        id: "ai-core",
        name: "AI Core",
        tagline: "Foundations of Artificial Intelligence",
        description:
            "Master the fundamentals of AI including linear algebra, probability, machine learning algorithms, and neural network architectures.",
        lessons: 8,
        assignments: 4,
        progress: 60,
        status: "active",
        gradient: "from-indigo-600 via-violet-600 to-purple-700",
        icon: "psychology",
        accentColor: "text-indigo-600",
        buttonClass:
            "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25",
    },
    {
        id: "data-engineer",
        name: "Data Engineer",
        tagline: "Build Scalable Data Pipelines",
        description:
            "Learn to design, build, and maintain robust data architectures using modern tools like Spark, Airflow, and cloud platforms.",
        lessons: 12,
        assignments: 6,
        progress: 30,
        status: "active",
        gradient: "from-teal-500 via-cyan-600 to-emerald-600",
        icon: "storage",
        accentColor: "text-teal-600",
        buttonClass:
            "bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/25",
    },
    {
        id: "aiml-engineer",
        name: "AI/ML Engineer",
        tagline: "Production Machine Learning Systems",
        description:
            "Deploy and scale ML models in production. Cover MLOps, model serving, monitoring, and end-to-end ML pipelines.",
        lessons: 10,
        assignments: 5,
        progress: 0,
        status: "coming-soon",
        gradient: "from-amber-500 via-orange-500 to-rose-500",
        icon: "smart_toy",
        accentColor: "text-amber-600",
        buttonClass:
            "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
    },
];

function CourseCard({ course }: { course: Course }) {
    const isComingSoon = course.status === "coming-soon";

    return (
        <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 overflow-hidden flex flex-col">
            {/* Gradient Header */}
            <div
                className={`relative h-40 bg-gradient-to-br ${course.gradient} flex items-center justify-center overflow-hidden`}
            >
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />
                <div className="absolute top-4 left-4 w-8 h-8 bg-white/10 rounded-full" />

                <div className="relative z-10 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-white text-[32px]">
                        {course.icon}
                    </span>
                </div>

                {isComingSoon && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-amber-700 rounded-full shadow-sm">
                        Coming Soon
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 p-6 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-700 transition-colors">
                    {course.name}
                </h3>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${course.accentColor}`}>
                    {course.tagline}
                </p>
                <p className="text-sm text-slate-500 leading-relaxed mb-5 flex-1">
                    {course.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="material-symbols-outlined text-[14px] text-slate-400">menu_book</span>
                        <span className="font-medium">{course.lessons} Lessons</span>
                    </div>
                    <div className="w-px h-3 bg-slate-200" />
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="material-symbols-outlined text-[14px] text-slate-400">assignment</span>
                        <span className="font-medium">{course.assignments} Assignments</span>
                    </div>
                </div>

                {/* Progress */}
                {!isComingSoon && (
                    <div className="mb-5">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Progress</span>
                            <span className={`text-xs font-bold ${course.accentColor}`}>{course.progress}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full bg-gradient-to-r ${course.gradient} transition-all duration-500`}
                                style={{ width: `${course.progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {isComingSoon && (
                    <div className="mb-5 flex items-center gap-2 p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                        <span className="material-symbols-outlined text-amber-500 text-[16px]">schedule</span>
                        <span className="text-xs text-amber-700 font-medium">
                            This course will be available soon. Stay tuned!
                        </span>
                    </div>
                )}

                {/* CTA */}
                {isComingSoon ? (
                    <button
                        disabled
                        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${course.buttonClass}`}
                    >
                        Notify Me
                    </button>
                ) : (
                    <Link
                        href={`/courses/${course.id}`}
                        className={`w-full py-3 rounded-xl text-sm font-semibold text-center transition-all active:scale-[0.98] block ${course.buttonClass}`}
                    >
                        Enter Course →
                    </Link>
                )}
            </div>
        </div>
    );
}

export default async function CoursesPage() {
    const session = await requireSession();
    const { role } = await getCurrentUserRole();
    const user = session.user;

    const activeCourses = courses.filter((c) => c.status === "active").length;
    const totalLessons = courses.reduce((sum, c) => sum + c.lessons, 0);

    return (
        <div className="min-h-screen bg-[var(--hw-surface)] text-[var(--hw-on-surface)] antialiased">
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

            <div className="flex pt-16">
                {/* ═══ SIDEBAR ═══ */}
                <aside className="fixed left-0 h-[calc(100vh-64px)] w-64 bg-slate-50 flex-col p-4 space-y-2 text-sm hidden md:flex">
                    <div className="mb-6 px-2">
                        <h2 className="text-lg font-semibold text-indigo-600">Learning Space</h2>
                        <p className="text-xs text-slate-500">Active Session</p>
                    </div>
                    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg hover:translate-x-1 transition-transform">
                        <span className="material-symbols-outlined">dashboard</span>
                        Dashboard
                    </Link>
                    <Link href="/courses" className="flex items-center gap-3 px-3 py-2.5 bg-white text-indigo-600 shadow-sm rounded-lg font-semibold">
                        <span className="material-symbols-outlined">auto_stories</span>
                        Courses
                    </Link>
                    <Link href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg hover:translate-x-1 transition-transform">
                        <span className="material-symbols-outlined">local_library</span>
                        Library
                    </Link>
                    <Link href="#" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg hover:translate-x-1 transition-transform">
                        <span className="material-symbols-outlined">psychology</span>
                        AI Tutor
                    </Link>

                    {role === "admin" && (
                        <div className="mt-8 px-2">
                            <Link href="/admin/create-assignment" className="block w-full bg-[var(--hw-primary)] text-white py-2.5 rounded-lg font-medium shadow-sm hover:brightness-110 active:scale-[0.98] transition-all text-center">
                                New Assignment
                            </Link>
                        </div>
                    )}

                    <div className="mt-auto pt-4 space-y-1">
                        <Link href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg hover:translate-x-1 transition-transform">
                            <span className="material-symbols-outlined">help_outline</span>
                            Help
                        </Link>
                        <Link href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg hover:translate-x-1 transition-transform">
                            <span className="material-symbols-outlined">settings</span>
                            Settings
                        </Link>
                    </div>
                </aside>

                {/* ═══ MAIN CONTENT ═══ */}
                <main className="ml-0 md:ml-64 w-full min-w-0 overflow-hidden p-4 sm:p-6 md:p-8 min-h-screen bg-[var(--hw-surface)] pb-24">
                    {/* Header */}
                    <div className="mb-10">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                                    Courses
                                </h1>
                                <p className="text-sm text-slate-500">
                                    Explore your learning paths · {activeCourses} active courses · {totalLessons} total lessons
                                </p>
                            </div>
                            {role === "admin" && (
                                <button className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 active:scale-[0.98]">
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    New Course
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Total Courses</p>
                            <p className="text-2xl font-bold text-slate-900">{courses.length}</p>
                        </div>
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 shadow-sm">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-500 mb-1">Active</p>
                            <p className="text-2xl font-bold text-indigo-700">{activeCourses}</p>
                        </div>
                        <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 shadow-sm">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-teal-500 mb-1">Total Lessons</p>
                            <p className="text-2xl font-bold text-teal-700">{totalLessons}</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 shadow-sm">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-amber-500 mb-1">Coming Soon</p>
                            <p className="text-2xl font-bold text-amber-700">
                                {courses.filter((c) => c.status === "coming-soon").length}
                            </p>
                        </div>
                    </div>

                    {/* Course Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                </main>
            </div>

            {/* ═══ MOBILE BOTTOM NAV ═══ */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[var(--hw-surface-container-lowest)] border-t border-[var(--hw-outline-variant)]/20 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] h-[72px] flex items-center justify-around px-2 z-50">
                <Link href="/dashboard" className="flex flex-col items-center justify-center text-[var(--hw-outline)] gap-1 w-[22%] pb-2">
                    <span className="material-symbols-outlined text-[20px]">dashboard</span>
                    <span className="text-[9px] font-bold tracking-wider uppercase">Dashboard</span>
                </Link>
                <Link href="/courses" className="flex flex-col items-center justify-center text-[var(--hw-primary)] gap-1 w-[22%] py-2 rounded-xl bg-[var(--hw-primary)]/5">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
                    <span className="text-[9px] font-bold tracking-wider uppercase text-[var(--hw-primary)]">Courses</span>
                </Link>
                <Link href="#" className="flex flex-col items-center justify-center text-[var(--hw-outline)] gap-1 w-[22%] pb-2">
                    <span className="material-symbols-outlined text-[20px]">local_library</span>
                    <span className="text-[9px] font-bold tracking-wider uppercase">Library</span>
                </Link>
                <Link href="#" className="flex flex-col items-center justify-center text-[var(--hw-outline)] gap-1 w-[22%] pb-2">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                    <span className="text-[9px] font-bold tracking-wider uppercase">Profile</span>
                </Link>
            </nav>
        </div>
    );
}
