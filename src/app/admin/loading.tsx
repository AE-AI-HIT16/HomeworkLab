export default function AdminLoading() {
    return (
        <main className="max-w-5xl mx-auto p-4 md:p-8 animate-pulse">
            <header className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-40"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
            </header>

            <div className="flex items-center justify-between mb-6">
                <div className="h-4 bg-gray-200 rounded w-48"></div>
                <div className="h-9 bg-gray-200 rounded w-36"></div>
            </div>

            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex gap-2 mb-2">
                                    <div className="h-5 bg-gray-100 rounded w-20"></div>
                                    <div className="h-5 bg-gray-100 rounded w-16"></div>
                                </div>
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                                <div className="flex gap-4">
                                    <div className="h-4 bg-gray-100 rounded w-24"></div>
                                    <div className="h-4 bg-gray-100 rounded w-32"></div>
                                </div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
