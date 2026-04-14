export default function AdminLoading() {
    return (
        <main className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto pb-24 md:pb-20 overflow-y-auto w-full animate-pulse">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between mb-6 md:mb-8">
                <div>
                    <div className="h-3 w-24 bg-slate-200 rounded-sm mb-2"></div>
                    <div className="h-8 w-64 bg-slate-200 rounded-md"></div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-8 w-32 bg-slate-100 border border-slate-200 rounded-lg"></div>
                    <div className="h-8 w-20 bg-slate-100 border border-slate-200 rounded-lg"></div>
                </div>
            </div>

            {/* Metrics Row Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-center h-28">
                        <div className="h-2 w-32 bg-slate-100 rounded-sm mb-4"></div>
                        <div className="flex items-baseline gap-2">
                            <div className="h-10 w-16 bg-slate-200 rounded-md"></div>
                            <div className="h-4 w-24 bg-slate-100 rounded-sm"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Assignment Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm h-52 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <div className="h-6 w-12 bg-slate-100 rounded-md"></div>
                                <div className="h-6 w-6 bg-slate-100 rounded-full"></div>
                            </div>
                            <div className="h-5 w-3/4 bg-slate-200 rounded-sm mb-2"></div>
                            <div className="h-3 w-1/2 bg-slate-100 rounded-sm"></div>
                        </div>
                        <div>
                            <div className="h-2 w-full bg-slate-100 rounded-sm mb-2"></div>
                            <div className="flex justify-between">
                                <div className="h-3 w-16 bg-slate-100 rounded-sm"></div>
                                <div className="h-3 w-10 bg-slate-100 rounded-sm"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Visuals Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-50 border border-slate-100 rounded-2xl p-6 shadow-sm h-64">
                    <div className="h-6 w-48 bg-slate-200 rounded-sm mb-8"></div>
                    <div className="flex items-end justify-between px-4 pb-2 border-b border-slate-200/50 mb-6 gap-2 h-24">
                        <div className="w-1/5 bg-slate-200 rounded-t-lg h-[40%]"></div>
                        <div className="w-1/5 bg-slate-200 rounded-t-lg h-[60%]"></div>
                        <div className="w-1/5 bg-slate-200 rounded-t-lg h-[35%]"></div>
                        <div className="w-1/5 bg-slate-200 rounded-t-lg h-[75%]"></div>
                        <div className="w-1/5 bg-slate-200 rounded-t-lg h-[55%]"></div>
                    </div>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm h-64">
                    <div className="h-5 w-32 bg-slate-200 rounded-sm mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0"></div>
                                <div className="flex-1">
                                    <div className="h-4 w-32 bg-slate-200 rounded-sm mb-1.5"></div>
                                    <div className="h-2 w-24 bg-slate-100 rounded-sm"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
