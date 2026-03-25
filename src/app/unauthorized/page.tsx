import { signOut } from "@/auth";
import Link from "next/link";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--hw-surface)] text-[var(--hw-on-surface)]">
            {/* Top Nav */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-8">
                    <span className="text-xl font-bold tracking-tight">HIT <span className="text-[var(--hw-primary)]">AI/DATA</span></span>
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
            <main className="flex-grow flex items-center justify-center px-6 pt-24 pb-12 relative z-10 w-full">
                <div className="bg-[var(--hw-surface-container-lowest)] rounded-xl pt-10 pb-8 px-8 sm:px-10 max-w-[420px] w-full shadow-[0_12px_40px_rgba(26,28,29,0.04)] relative z-10 border border-[var(--hw-outline-variant)]/20 mx-auto">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-[var(--hw-surface-container-high)] text-[var(--hw-outline)] rounded-full flex items-center justify-center mb-6 shadow-sm">
                            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 0" }}>person_off</span>
                        </div>

                        <h1 className="text-[1.75rem] font-semibold tracking-tight mb-2 text-[var(--hw-on-surface)]">
                            Account Not Authorized
                        </h1>

                        <p className="text-[14px] text-[var(--hw-on-surface-variant)] leading-relaxed mb-8 px-2">
                            Your GitHub account isn't on the
                            authorized list for AI Class 101 yet.
                            <br /><br />
                            If you think this is a mistake, please reach out to your instructor or the class administrator.
                        </p>

                        <div className="w-full flex justify-center mb-4">
                            <Link
                                href="mailto:nguyenhuyhoangqbx5@gmail.com"
                                className="w-full sm:w-auto px-8 py-3 bg-[var(--hw-primary)] text-white font-medium rounded-lg hover:brightness-110 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
                            >
                                Contact Admin
                            </Link>
                        </div>

                        <div className="w-full flex justify-center mt-2">
                            <form
                                className="w-full"
                                action={async () => {
                                    "use server";
                                    await signOut({ redirectTo: "/login" });
                                }}
                            >
                                <button
                                    type="submit"
                                    className="w-full text-[13px] font-medium text-[var(--hw-primary)] hover:text-[var(--hw-on-primary-fixed-variant)] bg-transparent py-2 transition-colors flex items-center justify-center"
                                >
                                    Sign Out & Try Different Account
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-12 px-6 flex flex-col lg:flex-row justify-between items-center gap-6 text-[var(--hw-on-surface-variant)]/40">
                <div className="flex items-center gap-6">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">© 2024 HIT — AI/DATA</span>
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
