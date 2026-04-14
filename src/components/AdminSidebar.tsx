"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminSidebar() {
    const pathname = usePathname();

    const isPathActive = (path: string) =>
        path === "/admin" ? pathname === "/admin" : pathname === path || pathname.startsWith(path + "/");

    const navClass = (path: string) => {
        return isPathActive(path)
            ? "flex items-center gap-3 px-3 py-2 bg-[var(--hw-primary-fixed)] text-[var(--hw-primary)] shadow-sm rounded-lg font-medium border border-[var(--hw-primary-fixed-dim)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hw-primary)] focus-visible:ring-offset-2"
            : "flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hw-primary)] focus-visible:ring-offset-2";
    };

    return (
        <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-56 bg-slate-50 flex-col p-4 text-sm hidden md:flex border-r border-slate-200 z-40">
            <div className="mb-6 px-2">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Workspace</p>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[var(--hw-primary)] rounded-md flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-[14px]">school</span>
                    </div>
                    <h2 className="text-sm font-semibold text-slate-900 tracking-tight">HIT AI/DATA</h2>
                </div>
            </div>

            <nav aria-label="Admin sidebar navigation" className="flex-1 space-y-1">
                <Link href="/admin" aria-current={isPathActive("/admin") ? "page" : undefined} className={navClass("/admin")}>
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                    Dashboard
                </Link>
                <Link href="/admin/students" aria-current={isPathActive("/admin/students") ? "page" : undefined} className={navClass("/admin/students")}>
                    <span className="material-symbols-outlined text-[18px]">group</span>
                    Students
                </Link>
                <Link href="/admin/grading" aria-current={isPathActive("/admin/grading") ? "page" : undefined} className={navClass("/admin/grading")}>
                    <span className="material-symbols-outlined text-[18px]">grade</span>
                    Grading
                </Link>

                <Link href="/admin/curriculum" aria-current={isPathActive("/admin/curriculum") ? "page" : undefined} className={navClass("/admin/curriculum")}>
                    <span className="material-symbols-outlined text-[18px]">menu_book</span>
                    Curriculum
                </Link>

                <div className="pt-3 mt-3 border-t border-slate-200/50">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2 px-3">Content</p>
                    <Link href="/admin/create-assignment" aria-current={isPathActive("/admin/create-assignment") ? "page" : undefined} className={navClass("/admin/create-assignment")}>
                        <span className="material-symbols-outlined text-[18px]">add_task</span>
                        Add Assignment
                    </Link>
                    <Link href="/admin/materials/new" aria-current={isPathActive("/admin/materials/new") ? "page" : undefined} className={navClass("/admin/materials/new")}>
                        <span className="material-symbols-outlined text-[18px]">post_add</span>
                        Add Material
                    </Link>
                </div>

            </nav>


        </aside>
    );
}
