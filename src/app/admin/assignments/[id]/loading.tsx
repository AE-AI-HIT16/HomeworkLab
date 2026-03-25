export default function AdminAssignmentDetailLoading() {
    return (
        <main className="max-w-5xl mx-auto p-6 md:p-8 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>

            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </div>
                <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>

                <div className="bg-white border rounded-xl p-5 mt-6 shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-24 bg-gray-50 rounded-lg p-4">
                                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                                <div className="h-6 bg-gray-300 rounded w-16 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-24"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>

            <div className="bg-white border rounded-xl overflow-hidden h-64">
                <div className="bg-gray-50 h-10 border-b"></div>
                {[1, 2, 3].map(i => (
                    <div key={i} className="border-b h-16 flex items-center p-4">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                ))}
            </div>
        </main>
    );
}
