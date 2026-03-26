export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-[var(--hw-surface)] antialiased animate-pulse">
            {/* ═══ TOP NAV SKELETON ═══ */}
            <nav className="fixed top-0 w-full z-50 bg-white shadow-sm h-16 flex items-center justify-between px-6">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-slate-200 rounded-lg"></div>
                        <div className="h-6 w-32 bg-slate-200 rounded-sm"></div>
                    </div>
                    <div className="hidden md:flex h-9 w-72 bg-slate-100 rounded-lg"></div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-6 w-6 bg-slate-200 rounded-full"></div>
                    <div className="h-6 w-6 bg-slate-200 rounded-full"></div>
                    <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block" />
                    <div className="h-4 w-16 bg-slate-200 rounded-sm hidden md:block"></div>
                    <div className="h-8 w-8 bg-slate-200 rounded-full border border-slate-100"></div>
                </div>
            </nav>

            <div className="flex pt-16">
                {/* ═══ SIDEBAR SKELETON ═══ */}
                <aside className="fixed left-0 h-[calc(100vh-64px)] w-64 bg-slate-50 flex-col p-4 space-y-2 hidden md:flex">
                    <div className="mb-6 px-2">
                        <div className="h-5 w-32 bg-slate-200 rounded-sm mb-2"></div>
                        <div className="h-3 w-20 bg-slate-200 rounded-sm"></div>
                    </div>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${i === 1 ? 'bg-white shadow-sm' : ''}`}>
                            <div className="w-5 h-5 bg-slate-200 rounded-sm"></div>
                            <div className="h-4 w-24 bg-slate-200 rounded-sm"></div>
                        </div>
                    ))}
                    <div className="mt-8 px-2">
                        <div className="w-full h-10 bg-slate-200 rounded-lg"></div>
                    </div>
                    <div className="mt-auto pt-4 space-y-1">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg">
                                <div className="w-5 h-5 bg-slate-200 rounded-sm"></div>
                                <div className="h-4 w-20 bg-slate-200 rounded-sm"></div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* ═══ MAIN CONTENT SKELETON ═══ */}
                <main className="ml-0 md:ml-64 w-full p-4 sm:p-6 md:p-8 min-h-screen xl:mr-80 pb-24">
                    <header className="mb-6 md:mb-12">
                        <div className="hidden md:block">
                            <div className="h-8 w-64 bg-slate-200 rounded-md mb-3"></div>
                            <div className="h-4 w-48 bg-slate-200 rounded-sm"></div>
                        </div>
                        {/* Mobile 'CURRENT FOCUS' Banner Skeleton */}
                        <div className="md:hidden h-40 bg-slate-200 rounded-xl w-full"></div>
                    </header>

                    <div className="space-y-16">
                        {[1, 2].map((week) => (
                            <section key={week}>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-6 w-24 bg-slate-200 rounded-md"></div>
                                    <div className="h-px flex-1 bg-slate-200"></div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {[1, 2].map((card) => (
                                        <div key={card} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between h-56">
                                            <div>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="h-3 w-16 bg-slate-200 rounded-sm"></div>
                                                    <div className="h-5 w-24 bg-slate-200 rounded-full"></div>
                                                </div>
                                                <div className="h-6 w-3/4 bg-slate-200 rounded-md mb-3"></div>
                                                <div className="space-y-2">
                                                    <div className="h-3 w-full bg-slate-100 rounded-sm"></div>
                                                    <div className="h-3 w-5/6 bg-slate-100 rounded-sm"></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4">
                                                <div className="h-4 w-24 bg-slate-200 rounded-sm"></div>
                                                <div className="h-4 w-20 bg-slate-300 rounded-sm"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </main>

                {/* ═══ STATS SIDEBAR SKELETON ═══ */}
                <aside className="hidden xl:block w-80 p-8 border-l border-slate-200 bg-white fixed right-0 top-16 h-[calc(100vh-64px)]">
                    <div className="h-3 w-32 bg-slate-200 rounded-sm mb-8"></div>

                    <div className="mb-10">
                        <div className="flex items-baseline gap-2 mb-3">
                            <div className="h-10 w-20 bg-slate-200 rounded-md"></div>
                            <div className="h-3 w-16 bg-slate-200 rounded-sm"></div>
                        </div>
                        <div className="h-3 w-32 bg-slate-200 rounded-sm mb-4"></div>
                        <div className="h-3 w-full bg-slate-100 rounded-full"></div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-4 bg-slate-50 rounded-lg h-32"></div>
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 h-64"></div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
