import { requireSession } from "@/lib/auth";
import { getCurrentUserRoleWithContext } from "@/lib/roles";
import Link from "next/link";
import { TopNav } from "@/components/TopNav";
import { StudentSidebar } from "@/components/StudentSidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";

export const dynamic = "force-dynamic";

import { Course, courses } from "@/lib/courses";

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
                        Coming Soon
                    </button>
                ) : (
                    <Link
                        href={`/courses/${course.id}`}
                        className={`w-full py-3 rounded-xl text-sm font-semibold text-center transition-all active:scale-[0.98] block ${course.buttonClass}`}
                    >
                        Open Course
                    </Link>
                )}
            </div>
        </div>
    );
}

export default async function CoursesPage() {
    const session = await requireSession();
    const { role } = await getCurrentUserRoleWithContext({ session });
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
                <StudentSidebar role={role} />

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
                                <Link href="/admin/curriculum" className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 active:scale-[0.98]">
                                    <span className="material-symbols-outlined text-[18px]">tune</span>
                                    Manage Curriculum
                                </Link>
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

            <MobileBottomNav variant="student" />
        </div>
    );
}
