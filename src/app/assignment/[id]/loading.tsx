export default function AssignmentDetailLoading() {
    return (
        <main className="max-w-3xl mx-auto p-6 md:p-8 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>

            <header className="mb-8">
                <div className="h-5 bg-gray-200 rounded w-24 mb-3"></div>
                <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                    <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-100 rounded w-4/6"></div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="h-24 bg-gray-50 border rounded-xl p-4"></div>
                <div className="h-24 bg-gray-50 border rounded-xl p-4"></div>
            </div>

            <div className="bg-white border text-sm rounded-xl overflow-hidden mt-8 p-6">
                <div className="flex gap-2 mb-4">
                    <div className="h-10 bg-gray-100 rounded flex-1"></div>
                    <div className="h-10 bg-gray-100 rounded flex-1"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-48 mb-6"></div>
                <div className="h-12 bg-gray-300 rounded w-full"></div>
            </div>
        </main>
    );
}
