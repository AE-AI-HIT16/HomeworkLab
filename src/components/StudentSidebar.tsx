"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface StudentSidebarProps {
    role: "admin" | "student" | "guest";
}

export function StudentSidebar({ role }: StudentSidebarProps) {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === "/dashboard") return pathname === "/dashboard";
        return pathname === path || pathname.startsWith(`${path}/`);
    };

    const linkClass = (path: string) =>
        isActive(path)
            ? "flex items-center gap-3 px-3 py-2.5 bg-white text-[var(--hw-primary)] shadow-sm rounded-lg font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hw-primary)] focus-visible:ring-offset-2"
            : "flex items-center gap-3 px-3 py-2.5 text-[var(--hw-on-surface-variant)] hover:bg-[var(--hw-surface-container-low)] rounded-lg hover:translate-x-1 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hw-primary)] focus-visible:ring-offset-2";

    return (
        <aside className="fixed left-0 h-[calc(100vh-64px)] w-64 bg-slate-50 flex-col p-4 space-y-2 text-sm hidden md:flex">
            <div className="mb-6 px-2">
                <h2 className="text-lg font-semibold text-[var(--hw-primary)]">Learning Space</h2>
                <p className="text-xs text-[var(--hw-on-surface-variant)]">Active Session</p>
            </div>
            <nav aria-label="Student sidebar navigation" className="space-y-2">
                <Link href="/dashboard" aria-current={isActive("/dashboard") ? "page" : undefined} className={linkClass("/dashboard")}>
                    <span className="material-symbols-outlined">dashboard</span>
                    Dashboard
                </Link>
                <Link href="/courses" aria-current={isActive("/courses") ? "page" : undefined} className={linkClass("/courses")}>
                    <span className="material-symbols-outlined">auto_stories</span>
                    Courses
                </Link>
                <Link href="/leaderboard" aria-current={isActive("/leaderboard") ? "page" : undefined} className={linkClass("/leaderboard")}>
                    <span className="material-symbols-outlined">emoji_events</span>
                    Leaderboard
                </Link>
            </nav>

            {role === "admin" && (
                <div className="mt-8 px-2">
                    <Link href="/admin/create-assignment" className="block w-full bg-[var(--hw-primary)] text-white py-2.5 rounded-lg font-medium shadow-sm hover:brightness-110 active:scale-[0.98] transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hw-primary)] focus-visible:ring-offset-2">
                        New Assignment
                    </Link>
                </div>
            )}
        </aside>
    );
}
