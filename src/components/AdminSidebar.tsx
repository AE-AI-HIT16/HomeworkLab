"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminSidebar() {
    const pathname = usePathname();

    const navClass = (path: string) => {
        const isActive = path === "/admin" ? pathname === "/admin" : pathname === path || pathname.startsWith(path + "/");
        return isActive
            ? "flex items-center gap-3 px-3 py-2 bg-indigo-50 text-indigo-700 shadow-sm rounded-lg font-medium border border-indigo-100"
            : "flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors";
    };

    return (
        <aside className="fixed left-0 top-14 h-[calc(100vh-56px)] w-56 bg-slate-50 flex-col p-4 text-sm hidden md:flex border-r border-slate-200 z-40">
            <div className="mb-6 px-2">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Workspace</p>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-[14px]">school</span>
                    </div>
                    <h2 className="text-sm font-semibold text-slate-900 tracking-tight">HIT AI/DATA</h2>
                </div>
            </div>

            <nav className="flex-1 space-y-1">
                <Link href="/admin" className={navClass("/admin")}>
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
                    Analytics
                </Link>
                <Link href="/admin/students" className={navClass("/admin/students")}>
                    <span className="material-symbols-outlined text-[18px]">group</span>
                    Students
                </Link>
                <Link href="/admin/grading" className={navClass("/admin/grading")}>
                    <span className="material-symbols-outlined text-[18px]">grade</span>
                    Grading
                </Link>
                <Link href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-[18px]">folder</span>
                    Resources
                </Link>
            </nav>

            <div className="pt-4 space-y-1 mt-auto border-t border-slate-200">
                <Link href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                    Archive
                </Link>
                <Link href="/admin/settings" className={`${navClass("/admin/settings")} mb-4`}>
                    <span className="material-symbols-outlined text-[18px]">settings</span>
                    Settings
                </Link>
            </div>
        </aside>
    );
}
