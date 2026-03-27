"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Legacy route — redirects to the canonical create-assignment page.
 */
export default function NewAssignmentRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/admin/create-assignment");
    }, [router]);

    return (
        <main className="min-h-screen flex items-center justify-center">
            <p className="text-sm text-gray-500">Redirecting...</p>
        </main>
    );
}
