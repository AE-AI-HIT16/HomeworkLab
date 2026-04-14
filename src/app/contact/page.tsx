import Link from "next/link";

const SUPPORT_EMAIL = "nguyenhuyhoangqbx5@gmail.com";

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-[var(--hw-surface)] text-[var(--hw-on-surface)]">
            <div className="max-w-3xl mx-auto px-6 py-16">
                <h1 className="text-3xl font-bold tracking-tight mb-4">Contact</h1>
                <p className="text-sm text-[var(--hw-on-surface-variant)] leading-relaxed mb-6">
                    Need help with access, course setup, or assignment issues? Reach out to the support team.
                </p>
                <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--hw-primary)] text-white text-sm font-semibold hover:brightness-110 transition-all"
                >
                    Email Support
                </a>
                <div className="mt-8">
                    <Link href="/" className="text-sm font-semibold text-[var(--hw-primary)] hover:underline">
                        Back to Home
                    </Link>
                </div>
            </div>
        </main>
    );
}
