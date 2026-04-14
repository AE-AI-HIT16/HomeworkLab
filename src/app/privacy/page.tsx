import Link from "next/link";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-[var(--hw-surface)] text-[var(--hw-on-surface)]">
            <div className="max-w-3xl mx-auto px-6 py-16">
                <h1 className="text-3xl font-bold tracking-tight mb-4">Privacy Policy</h1>
                <p className="text-sm text-[var(--hw-on-surface-variant)] leading-relaxed mb-4">
                    We only collect data needed to run learning workflows, such as account profile, assignment metadata,
                    and submission records.
                </p>
                <p className="text-sm text-[var(--hw-on-surface-variant)] leading-relaxed mb-8">
                    If you need data correction or removal support, please contact the class administrator.
                </p>
                <Link href="/" className="text-sm font-semibold text-[var(--hw-primary)] hover:underline">
                    Back to Home
                </Link>
            </div>
        </main>
    );
}
