export default function DashboardLoading() {
    return (
        <main className="max-w-5xl mx-auto p-4 md:p-8 animate-pulse">
            <header className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-32"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="h-32 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                                    <div className="h-4 bg-gray-100 rounded w-1/2 mb-4"></div>
                                    <div className="h-6 bg-gray-100 rounded w-20"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div>
                        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                            {[1].map((i) => (
                                <div key={i} className="h-32 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                                    <div className="h-4 bg-gray-100 rounded w-1/2 mb-4"></div>
                                    <div className="h-6 bg-gray-100 rounded w-20"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
