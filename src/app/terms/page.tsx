import Link from "next/link";

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-[var(--hw-surface)] text-[var(--hw-on-surface)]">
            <div className="max-w-3xl mx-auto px-6 py-16">
                <h1 className="text-3xl font-bold tracking-tight mb-4">Terms of Use</h1>
                <p className="text-sm text-[var(--hw-on-surface-variant)] leading-relaxed mb-4">
                    This platform is for educational use within authorized classes. Users are responsible for submission
                    integrity and account security.
                </p>
                <p className="text-sm text-[var(--hw-on-surface-variant)] leading-relaxed mb-8">
                    Misuse, unauthorized access, or plagiarism may result in account suspension based on class policy.
                </p>
                <Link href="/" className="text-sm font-semibold text-[var(--hw-primary)] hover:underline">
                    Back to Home
                </Link>
            </div>
        </main>
    );
}
