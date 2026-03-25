import Link from "next/link";

export function AdminSidebar() {
    return (
        <aside className="fixed left-0 top-14 h-[calc(100vh-56px)] w-56 bg-slate-50 flex-col p-4 text-sm hidden md:flex border-r border-slate-200 z-40">
            <div className="mb-6 px-2">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Workspace</p>
                <h2 className="text-sm font-semibold text-slate-900 tracking-tight">HomeworkLab AI</h2>
            </div>

            <nav className="flex-1 space-y-1">
                <Link href="/admin" className="flex items-center gap-3 px-3 py-2 bg-white text-indigo-600 shadow-sm rounded-lg font-medium border border-slate-100">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
                    Overview
                </Link>
                <Link href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-[18px]">group</span>
                    Students
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
                <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors mb-4">
                    <span className="material-symbols-outlined text-[18px]">settings</span>
                    Settings
                </Link>

                {/* Promo Card */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 mt-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full blur-2xl opacity-50 -mr-8 -mt-8" />
                    <h4 className="font-semibold text-indigo-800 tracking-tight text-xs mb-1">HomeworkLab AI</h4>
                    <p className="text-[10px] text-indigo-600/80 leading-relaxed mb-3">
                        Your workspace is powered by curated AI tools.
                    </p>
                    <button className="w-full bg-indigo-600 text-white rounded-lg py-1.5 text-xs font-medium hover:bg-indigo-500 transition-colors shadow-sm relative z-10">
                        New Module
                    </button>
                </div>
            </div>
        </aside>
    );
}
