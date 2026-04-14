import Link from "next/link";

export default function HelpPage() {
    return (
        <main className="min-h-screen bg-[var(--hw-surface)] text-[var(--hw-on-surface)]">
            <div className="max-w-3xl mx-auto px-6 py-16">
                <h1 className="text-3xl font-bold tracking-tight mb-4">Help Center</h1>
                <p className="text-sm text-[var(--hw-on-surface-variant)] leading-relaxed mb-6">
                    Common issues:
                </p>
                <ul className="list-disc pl-5 text-sm text-[var(--hw-on-surface-variant)] space-y-2 mb-8">
                    <li>Cannot log in with GitHub: verify your account is enrolled in class.</li>
                    <li>Cannot upload files: check file type and size limits.</li>
                    <li>Cannot view Drive material: ensure link sharing permissions are valid.</li>
                </ul>
                <div className="flex items-center gap-4">
                    <Link href="/contact" className="text-sm font-semibold text-[var(--hw-primary)] hover:underline">
                        Contact Support
                    </Link>
                    <Link href="/" className="text-sm font-semibold text-[var(--hw-primary)] hover:underline">
                        Back to Home
                    </Link>
                </div>
            </div>
        </main>
    );
}
