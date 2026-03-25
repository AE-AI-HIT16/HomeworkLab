import { signOut } from "@/auth";
import Link from "next/link";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--hw-surface)] text-[var(--hw-on-surface)]">
            {/* Top Nav */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-8">
                    <span className="text-xl font-bold tracking-tight">HomeworkLab</span>
                    <div className="hidden md:flex items-center gap-6">
                        <span className="text-[var(--hw-outline)] cursor-default">Dashboard</span>
                        <span className="text-[var(--hw-outline)] cursor-default">Assignments</span>
                        <span className="text-[var(--hw-outline)] cursor-default">Classroom</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[var(--hw-surface-container-low)] transition-all cursor-pointer">
                        <span className="text-sm font-medium text-[var(--hw-on-surface-variant)]">Support</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-[var(--hw-outline)] hover:bg-[var(--hw-surface-container-low)] rounded-full transition-all active:scale-95 duration-200">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <button className="p-2 text-[var(--hw-outline)] hover:bg-[var(--hw-surface-container-low)] rounded-full transition-all active:scale-95 duration-200">
                            <span className="material-symbols-outlined">settings</span>
                        </button>
                        <div className="w-8 h-8 rounded-full bg-[var(--hw-surface-container-high)] overflow-hidden ml-2 border border-[var(--hw-outline-variant)]/50" />
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center px-6 pt-20">
                <div className="max-w-3xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left Side: Error Illustration */}
                    <div className="lg:col-span-5 flex flex-col items-center lg:items-end order-2 lg:order-1">
                        <div className="relative">
                            {/* Abstract Background Shapes */}
                            <div className="absolute -top-6 -left-6 w-32 h-32 bg-[var(--hw-primary)]/5 rounded-full blur-3xl" />
                            <div className="absolute -bottom-10 -right-4 w-40 h-40 bg-[var(--hw-primary-container)]/10 rounded-full blur-2xl" />

                            {/* Main Error Visual */}
                            <div className="relative bg-[var(--hw-surface-container-lowest)] p-8 rounded-xl shadow-[var(--hw-shadow-lg)] border border-[var(--hw-outline-variant)]/15 flex flex-col items-center">
                                <div className="w-16 h-16 bg-[var(--hw-error)]/10 text-[var(--hw-error)] rounded-full flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>lock_person</span>
                                </div>
                                <div className="h-1 w-24 bg-[var(--hw-surface-container-high)] rounded-full overflow-hidden">
                                    <div className="inference-glow h-full w-1/3 rounded-full" />
                                </div>
                                <div className="mt-6 space-y-2 w-full">
                                    <div className="h-2 w-full bg-[var(--hw-surface-container-low)] rounded-full" />
                                    <div className="h-2 w-3/4 bg-[var(--hw-surface-container-low)] rounded-full" />
                                    <div className="h-2 w-5/6 bg-[var(--hw-surface-container-low)] rounded-full" />
                                </div>
                            </div>

                            {/* Error Code Tag */}
                            <div className="absolute -bottom-4 -left-12 hidden lg:block">
                                <span className="bg-[var(--hw-surface-container-highest)] px-3 py-1.5 rounded text-[10px] tracking-widest font-semibold uppercase text-[var(--hw-on-surface-variant)]">
                                    Error Code: 403_FORBIDDEN
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Content */}
                    <div className="lg:col-span-7 text-center lg:text-left order-1 lg:order-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--hw-secondary-container)]/30 text-[var(--hw-primary)] rounded-full mb-6">
                            <span className="material-symbols-outlined text-sm">shield</span>
                            <span className="text-[11px] font-bold uppercase tracking-wider">Security Protocol</span>
                        </div>

                        <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                            Access Denied
                        </h1>

                        <p className="text-xl text-[var(--hw-on-surface-variant)] font-medium leading-relaxed max-w-md mb-10">
                            Your GitHub account is not registered for this class.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Link
                                href="/login"
                                className="w-full sm:w-auto px-8 py-3.5 bg-[var(--hw-primary)] text-white font-semibold rounded-lg shadow-sm hover:brightness-110 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">home</span>
                                Go Back Home
                            </Link>

                            <form
                                action={async () => {
                                    "use server";
                                    await signOut({ redirectTo: "/login" });
                                }}
                            >
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto px-8 py-3.5 bg-[var(--hw-surface-container-high)] text-[var(--hw-on-surface)] font-semibold rounded-lg hover:brightness-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">logout</span>
                                    Đăng xuất
                                </button>
                            </form>
                        </div>

                        <div className="mt-12 pt-10 border-t border-transparent relative">
                            <div className="absolute top-0 left-0 w-1/4 h-px bg-gradient-to-r from-[var(--hw-outline-variant)]/30 to-transparent" />
                            <div className="flex items-center gap-4 text-[var(--hw-on-surface-variant)]/60">
                                <span className="material-symbols-outlined text-lg">info</span>
                                <p className="text-sm">Contact your instructor if you believe this is a mistake.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-12 px-6 flex flex-col lg:flex-row justify-between items-center gap-6 text-[var(--hw-on-surface-variant)]/40">
                <div className="flex items-center gap-6">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">© 2024 HomeworkLab AI Workspace</span>
                    <div className="w-1 h-1 bg-[var(--hw-outline-variant)]/30 rounded-full" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-[var(--hw-primary)] transition-colors cursor-pointer">Privacy Policy</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[11px] font-medium italic">Authenticated via GitHub</span>
                </div>
            </footer>
        </div>
    );
}
