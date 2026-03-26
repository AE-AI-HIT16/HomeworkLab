export default function AssignmentDetailLoading() {
    return (
        <div className="min-h-screen bg-[var(--hw-surface)] antialiased animate-pulse">
            {/* ═══ TOP NAV SKELETON ═══ */}
            <nav className="fixed top-0 w-full z-50 bg-white shadow-sm h-14 flex items-center justify-between px-6">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-200 rounded-md"></div>
                        <div className="h-5 w-24 bg-slate-200 rounded-sm"></div>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                        <div className="h-4 w-20 bg-slate-200 rounded-sm"></div>
                        <div className="h-4 w-24 bg-indigo-100 rounded-sm"></div>
                        <div className="h-4 w-20 bg-slate-200 rounded-sm"></div>
                        <div className="h-4 w-16 bg-slate-200 rounded-sm"></div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-6 w-6 bg-slate-200 rounded-full"></div>
                    <div className="h-6 w-6 bg-slate-200 rounded-full"></div>
                    <div className="h-7 w-7 bg-slate-200 rounded-full border border-slate-100"></div>
                </div>
            </nav>

            <div className="flex pt-14">
                {/* ═══ LEFT SIDEBAR SKELETON ═══ */}
                <aside className="fixed left-0 h-[calc(100vh-56px)] w-56 bg-slate-50 flex-col p-4 space-y-2 hidden md:flex">
                    <div className="mb-6 px-2">
                        <div className="h-5 w-24 bg-slate-200 rounded-sm mb-2"></div>
                        <div className="h-2 w-32 bg-slate-200 rounded-sm"></div>
                    </div>
                    <div className="flex-1 space-y-2 text-sm mt-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${i === 2 ? 'bg-white shadow-sm' : ''}`}>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                <div className="h-4 w-32 bg-slate-200 rounded-sm"></div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-auto space-y-2">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg">
                                <div className="w-5 h-5 bg-slate-200 rounded-sm"></div>
                                <div className="h-4 w-16 bg-slate-200 rounded-sm"></div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* ═══ MAIN CONTENT SKELETON ═══ */}
                <main className="ml-0 md:ml-56 w-full p-4 sm:p-6 md:p-8 min-h-screen xl:mr-80 pb-32 md:pb-8">
                    {/* Breadcrumb */}
                    <div className="h-3 w-40 bg-slate-200 rounded-sm mb-4"></div>

                    {/* Title + Status */}
                    <div className="h-8 w-3/4 max-w-lg bg-slate-200 rounded-md mb-4"></div>

                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
                        <div className="h-6 w-32 bg-slate-200 rounded-full"></div>
                        <div className="h-6 w-28 bg-slate-200 rounded-full"></div>
                    </div>

                    <div className="w-full h-px bg-slate-200 mb-8" />

                    {/* Description Paragraphs */}
                    <div className="space-y-4 mb-10 max-w-3xl">
                        <div className="h-4 w-full bg-slate-200 rounded-sm"></div>
                        <div className="h-4 w-full bg-slate-200 rounded-sm"></div>
                        <div className="h-4 w-5/6 bg-slate-200 rounded-sm"></div>
                        <div className="h-4 w-3/4 bg-slate-200 rounded-sm"></div>
                    </div>

                    {/* Resources Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white border text-sm border-slate-200 rounded-xl p-4 flex gap-4 h-24 shadow-sm items-center">
                                <div className="w-12 h-12 bg-slate-100 rounded-lg shrink-0"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-32 bg-slate-200 rounded-sm"></div>
                                    <div className="h-3 w-16 bg-slate-100 rounded-sm"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>

                {/* ═══ RIGHT SIDEBAR (Submission) SKELETON ═══ */}
                <aside className="hidden xl:block w-80 p-6 xl:p-8 border-l border-slate-200 bg-white fixed right-0 top-14 h-[calc(100vh-56px)] overflow-y-auto">
                    <div className="h-3 w-32 bg-slate-200 rounded-sm mb-6"></div>

                    {/* Upload Card */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 mb-6 h-64">
                        <div className="h-4 w-24 bg-slate-200 rounded-sm mb-4"></div>
                        <div className="h-32 bg-slate-100 border-2 border-dashed border-slate-200 rounded-lg mb-4 flex flex-col items-center justify-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                            <div className="h-3 w-32 bg-slate-200 rounded-sm"></div>
                        </div>
                        <div className="h-10 w-full bg-slate-200 rounded-lg"></div>
                    </div>

                    {/* Notes Box */}
                    <div className="bg-amber-50 rounded-xl p-5 border border-amber-100/50">
                        <div className="flex gap-2 mb-2">
                            <div className="w-4 h-4 rounded-full bg-amber-200"></div>
                            <div className="h-4 w-24 bg-amber-200 rounded-sm"></div>
                        </div>
                        <div className="h-3 w-full bg-amber-100 rounded-sm mb-2"></div>
                        <div className="h-3 w-5/6 bg-amber-100 rounded-sm"></div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
