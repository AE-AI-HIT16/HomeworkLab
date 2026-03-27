"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

interface LoginClientProps {
    accessDenied: boolean;
    deniedUser?: string;
}

type LoginState = "default" | "loading" | "denied";

export default function LoginClient({ accessDenied, deniedUser }: LoginClientProps) {
    const [state, setState] = useState<LoginState>(accessDenied ? "denied" : "default");

    const mailToUrl = `mailto:nguyenhuyhoangqbx5@gmail.com?subject=${encodeURIComponent("Access Request: HIT AI/DATA")}&body=${encodeURIComponent(`Hello Admin,\n\nPlease add my GitHub account to the authorized access list for the HIT AI/DATA system.\n\nMy Information:\n- Full Name: [Enter your name]\n- GitHub Username: ${deniedUser || "[Enter username]"}\n\nThank you!`)}`;

    const handleSignIn = () => {
        setState("loading");
        signIn("github", { callbackUrl: "/dashboard" });
    };

    return (
        <div className="min-h-screen flex flex-col bg-[var(--hw-surface)] text-[var(--hw-on-surface)] selection:bg-[var(--hw-primary-fixed)]">
            {/* Background Pattern */}
            <div aria-hidden="true" className="fixed inset-0 ai-pattern pointer-events-none" />
            <div aria-hidden="true" className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--hw-primary)]/5 rounded-full blur-[120px] pointer-events-none" />
            <div aria-hidden="true" className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--hw-primary-container)]/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Top Nav */}
            <nav className="fixed top-0 w-full z-50 bg-[var(--hw-surface)]/80 backdrop-blur-md">
                <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-[var(--hw-primary)] rounded-lg flex items-center justify-center text-white">
                            <span className="material-symbols-outlined text-[16px]">school</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">
                            HIT <span className="text-[var(--hw-primary)]">AI/DATA</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-[var(--hw-on-surface)]/60 cursor-pointer hover:text-[var(--hw-primary)] transition-colors">help_outline</span>
                    </div>
                </div>
            </nav>

            <main className="flex-grow flex items-center justify-center px-6 py-24 relative z-10">
                <div className="relative w-full max-w-md">
                    {/* Decorative Blurs */}
                    <div className="absolute -top-12 -left-12 w-24 h-24 bg-[var(--hw-primary)]/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[var(--hw-secondary-container)]/20 rounded-full blur-3xl pointer-events-none" />

                    {/* ═══ STATE: DEFAULT ═══ */}
                    {state === "default" && (
                        <div className="bg-[var(--hw-surface-container-lowest)] rounded-xl p-8 md:p-10 shadow-[0_12px_40px_rgba(26,28,29,0.04)] relative z-10">
                            <div className="flex flex-col items-center text-center">
                                {/* Logo */}
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-[var(--hw-primary)] rounded-lg mb-6 shadow-sm">
                                    <span className="material-symbols-outlined text-white text-2xl">menu_book</span>
                                </div>

                                {/* Class Badge */}
                                <span className="inline-block px-3 py-1 bg-[var(--hw-primary-fixed)] text-[var(--hw-on-primary-fixed)] text-[10px] font-bold uppercase tracking-[0.15em] rounded-full mb-4">
                                    Designed for AI Class AI-101
                                </span>

                                <h1 className="text-[1.75rem] font-medium tracking-tight mb-2">Welcome Back</h1>
                                <p className="text-[var(--hw-on-surface-variant)] text-sm mb-8">
                                    Access your editorial workspace for the AI Fundamentals track.
                                </p>

                                {/* GitHub Sign In */}
                                <button
                                    onClick={handleSignIn}
                                    className="w-full py-3 bg-[var(--hw-primary)] text-white font-medium rounded-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group shadow-md shadow-[var(--hw-primary)]/20"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                    Sign in with GitHub
                                    <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
                                </button>

                                {/* Workspace Features */}
                                <div className="mt-8 relative w-full pt-8">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-px bg-[var(--hw-outline-variant)]/20" />
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--hw-outline)] mb-6">
                                        Instructional Context
                                    </p>
                                    <div className="space-y-3 text-left w-full">
                                        <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--hw-surface-container-low)]">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--hw-primary)]">
                                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>auto_awesome</span>
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-bold text-[var(--hw-on-surface)]">AI Synthesis Active</p>
                                                <p className="text-[11px] text-[var(--hw-on-surface-variant)] mt-0.5">
                                                    Real-time feedback on push
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--hw-surface-container-low)]">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--hw-primary)]">
                                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>history_edu</span>
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-bold text-[var(--hw-on-surface)]">Tracking Submissions</p>
                                                <p className="text-[11px] text-[var(--hw-on-surface-variant)] mt-0.5">
                                                    History synced to main branch
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Enrollment */}
                                <div className="mt-6 pt-4 border-t border-[var(--hw-outline-variant)]/10 w-full">
                                    <p className="text-sm text-[var(--hw-on-surface-variant)]">
                                        New to the class?{" "}
                                        <a className="text-[var(--hw-primary)] font-semibold hover:underline decoration-[var(--hw-primary)]/30 underline-offset-4" href="#">
                                            Contact your TA
                                        </a>
                                        {" "}for enrollment.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ STATE: LOADING ═══ */}
                    {state === "loading" && (
                        <div className="bg-[var(--hw-surface-container-lowest)] rounded-xl p-8 md:p-10 shadow-[0_12px_40px_rgba(26,28,29,0.04)] relative z-10">
                            <div className="flex flex-col items-center text-center">
                                {/* Animated Logo */}
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-[var(--hw-primary)] rounded-lg mb-6 shadow-sm animate-pulse">
                                    <span className="material-symbols-outlined text-white text-2xl">menu_book</span>
                                </div>

                                <h1 className="text-[1.75rem] font-medium tracking-tight mb-2">Welcome back</h1>
                                <p className="text-[var(--hw-on-surface-variant)] text-sm mb-8">
                                    Continue your curating journey.
                                </p>

                                {/* Loading Button */}
                                <div className="w-full py-3 bg-[var(--hw-secondary-container)]/30 text-[var(--hw-on-surface-variant)] font-medium rounded-lg flex items-center justify-center gap-3 mb-8">
                                    <svg className="w-5 h-5 animate-spin text-[var(--hw-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Authenticating with GitHub...
                                </div>

                                {/* Divider */}
                                <div className="w-full flex items-center gap-4 mb-8">
                                    <div className="flex-1 h-px bg-[var(--hw-outline-variant)]/20" />
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--hw-outline)]">
                                        Or continue with email
                                    </span>
                                    <div className="flex-1 h-px bg-[var(--hw-outline-variant)]/20" />
                                </div>

                                {/* Disabled Email Form */}
                                <div className="w-full space-y-4 opacity-40 pointer-events-none">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--hw-on-surface-variant)] mb-2 text-left">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            disabled
                                            className="w-full bg-[var(--hw-surface-container-low)] border-none rounded-lg p-4 text-[var(--hw-on-surface)]"
                                            placeholder="you@university.edu"
                                        />
                                    </div>
                                    <button
                                        disabled
                                        className="w-full py-3 bg-[var(--hw-primary-fixed-dim)] text-[var(--hw-on-primary-fixed)] font-medium rounded-lg"
                                    >
                                        Sign In
                                    </button>
                                </div>

                                {/* Status */}
                                <div className="mt-8 pt-6 border-t border-[var(--hw-outline-variant)]/10 w-full">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--hw-outline)] flex items-center justify-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Establishing secure connection...
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ STATE: ACCESS DENIED ═══ */}
                    {state === "denied" && (
                        <div className="bg-[var(--hw-surface-container-lowest)] rounded-xl p-8 md:p-10 shadow-[0_12px_40px_rgba(26,28,29,0.04)] relative z-10">
                            <div className="flex flex-col items-center text-center">
                                {/* Error Icon */}
                                <div className="w-16 h-16 rounded-full bg-[var(--hw-error-container)]/30 flex items-center justify-center mb-6">
                                    <span className="material-symbols-outlined text-[var(--hw-error)] text-3xl">lock_person</span>
                                </div>

                                <h1 className="text-[1.75rem] font-medium tracking-tight mb-2">Access Denied</h1>
                                <p className="text-sm text-[var(--hw-on-surface-variant)] mb-8 leading-relaxed">
                                    Your GitHub account is not registered for this class. Please verify your credentials or contact your administrator.
                                </p>

                                {/* Authenticated User Card */}
                                <div className="w-full bg-[var(--hw-surface-container-low)] rounded-lg p-4 mb-8 text-left">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="material-symbols-outlined text-[var(--hw-primary)] text-sm">account_circle</span>
                                        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--hw-on-surface-variant)]">
                                            Authenticated User
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{deniedUser || "unknown_user"}</span>
                                        <span className="text-[10px] bg-[var(--hw-outline-variant)]/20 px-2 py-0.5 rounded text-[var(--hw-on-surface-variant)] font-semibold">
                                            External
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="w-full space-y-3">
                                    <button
                                        onClick={() => setState("default")}
                                        className="w-full bg-[var(--hw-primary)] text-white py-3 rounded-lg font-medium hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                                        Go back
                                    </button>
                                    <a
                                        href={mailToUrl}
                                        className="w-full bg-[var(--hw-surface-container-high)] text-[var(--hw-on-surface)] py-3 rounded-lg font-medium hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">mail</span>
                                        Contact Instructor
                                    </a>
                                </div>

                                {/* Security Badge */}
                                <div className="mt-8 pt-6 border-t border-[var(--hw-outline-variant)]/10 w-full flex flex-col items-center">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--hw-on-surface-variant)]/60 mb-4">
                                        Secured by HIT AI/DATA
                                    </p>
                                    <div className="flex gap-4">
                                        <span className="material-symbols-outlined text-[var(--hw-outline)]/40">security</span>
                                        <span className="material-symbols-outlined text-[var(--hw-outline)]/40">shield</span>
                                        <span className="material-symbols-outlined text-[var(--hw-outline)]/40">verified_user</span>
                                    </div>
                                </div>
                            </div>

                            {/* Error Metadata */}
                            <div className="mt-8 flex justify-between px-2">
                                <span className="text-[10px] font-semibold text-[var(--hw-on-surface-variant)]/40">
                                    Error Code: 403_GITHUB_UNMAPPED
                                </span>
                                <span className="text-[10px] font-semibold text-[var(--hw-on-surface-variant)]/40">
                                    Timestamp: {new Date().toISOString().slice(0, 16).replace("T", " ")}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-6 px-8">
                <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--hw-on-surface)]/40">
                        © 2024 HIT — AI/DATA. Editorial Workspace for AI Education.
                    </span>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--hw-on-surface)]/40 hover:text-[var(--hw-primary)] transition-colors" href="#">Terms</a>
                        <a className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--hw-on-surface)]/40 hover:text-[var(--hw-primary)] transition-colors" href="#">Privacy</a>
                        <a className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--hw-on-surface)]/40 hover:text-[var(--hw-primary)] transition-colors" href="#">Security</a>
                        <a className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--hw-on-surface)]/40 hover:text-[var(--hw-primary)] transition-colors" href="#">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
