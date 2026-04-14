import Link from "next/link";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[var(--hw-surface)] text-[var(--hw-on-surface)]">
            <div className="max-w-3xl mx-auto px-6 py-16">
                <h1 className="text-3xl font-bold tracking-tight mb-4">About HIT AI/DATA</h1>
                <p className="text-sm text-[var(--hw-on-surface-variant)] leading-relaxed mb-8">
                    HIT AI/DATA is a focused learning workspace for AI and Data classes. Students can track assignments,
                    submit work, and review feedback in one place.
                </p>
                <Link href="/" className="text-sm font-semibold text-[var(--hw-primary)] hover:underline">
                    Back to Home
                </Link>
            </div>
        </main>
    );
}
