"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global Error Caught:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 max-w-md w-full rounded-2xl shadow-xl border border-gray-100 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                    ⚠️
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    A system error occurred
                </h1>
                <p className="text-gray-600 mb-8 text-sm break-words line-clamp-3">
                    {error.message || "Sorry, something went wrong while processing your request. Please try again shortly."}
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => reset()}
                        className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-500 transition"
                    >
                        Try again
                    </button>
                    <Link
                        href="/dashboard"
                        className="block w-full bg-white text-gray-700 font-medium py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                    >
                        Go to dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
